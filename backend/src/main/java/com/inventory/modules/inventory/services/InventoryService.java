package com.inventory.modules.inventory.services;

import com.inventory.common.enums.StockMovementType;
import com.inventory.common.exception.ResourceNotFoundException;
import com.inventory.modules.inventory.dto.*;
import com.inventory.modules.inventory.entities.Product;
import com.inventory.modules.inventory.entities.StockMovement;
import com.inventory.modules.inventory.repositories.ProductRepository;
import com.inventory.modules.inventory.repositories.StockMovementRepository;
import com.inventory.modules.user.entities.User;
import com.inventory.modules.user.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {
    
    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public ProductResponse addProduct(Long companyId, ProductRequest request) {
        // Generate SKU
        String sku = generateSKU(request.getName(), companyId);
        
        Product product = Product.builder()
            .companyId(companyId)
            .name(request.getName())
            .description(request.getDescription())
            .sku(sku)
            .category(request.getCategory())
            .unit(request.getUnit())
            .unitPrice(request.getUnitPrice())
            .sellingPrice(request.getSellingPrice())
            .currentStock(request.getCurrentStock())
            .minimumStockLevel(request.getMinimumStockLevel())
            .imageUrl(request.getImageUrl())
            .isActive(true)
            .build();
        
        product = productRepository.save(product);
        
        // If initial stock > 0, create stock movement
        if (request.getCurrentStock() > 0) {
            StockMovement movement = StockMovement.builder()
                .productId(product.getId())
                .companyId(companyId)
                .type(StockMovementType.STOCK_IN)
                .quantity(request.getCurrentStock())
                .notes("Initial stock added")
                .build();
            stockMovementRepository.save(movement);
        }
        
        return mapToResponse(product);
    }
    
    @Transactional
    public ProductResponse updateProduct(Long companyId, Long productId, ProductRequest request) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        if (!product.getCompanyId().equals(companyId)) {
            throw new ResourceNotFoundException("Product not found for this company");
        }
        
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setUnit(request.getUnit());
        product.setUnitPrice(request.getUnitPrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setMinimumStockLevel(request.getMinimumStockLevel());
        product.setImageUrl(request.getImageUrl());
        
        product = productRepository.save(product);
        return mapToResponse(product);
    }
    
    @Transactional
    public void deleteProduct(Long companyId, Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        if (!product.getCompanyId().equals(companyId)) {
            throw new ResourceNotFoundException("Product not found for this company");
        }
        
        product.setIsActive(false);
        productRepository.save(product);
    }
    
    @Transactional
    public StockMovementResponse adjustStock(Long companyId, Long userId, StockMovementRequest request) {
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        if (!product.getCompanyId().equals(companyId)) {
            throw new ResourceNotFoundException("Product not found for this company");
        }
        
        int oldStock = product.getCurrentStock();
        int newStock = oldStock;
        
        if (request.getType() == StockMovementType.STOCK_IN) {
            newStock = oldStock + request.getQuantity();
        } else if (request.getType() == StockMovementType.STOCK_OUT) {
            if (oldStock < request.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock. Available: " + oldStock);
            }
            newStock = oldStock - request.getQuantity();
        } else if (request.getType() == StockMovementType.ADJUSTMENT) {
            newStock = request.getQuantity();
        }
        
        product.setCurrentStock(newStock);
        productRepository.save(product);
        
        StockMovement movement = StockMovement.builder()
            .productId(product.getId())
            .companyId(companyId)
            .type(request.getType())
            .quantity(request.getQuantity())
            .notes(request.getNotes())
            .performedBy(userId)
            .build();
        
        movement = stockMovementRepository.save(movement);
        
        return mapToMovementResponse(movement);
    }
    
    public List<ProductResponse> getCompanyProducts(Long companyId) {
        return productRepository.findByCompanyIdAndIsActiveTrue(companyId)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public ProductResponse getProductById(Long companyId, Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        if (!product.getCompanyId().equals(companyId)) {
            throw new ResourceNotFoundException("Product not found for this company");
        }
        
        return mapToResponse(product);
    }
    
    public List<ProductResponse> getLowStockProducts(Long companyId) {
        return productRepository.findLowStockProducts(companyId)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public List<StockMovementResponse> getProductMovements(Long companyId, Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        if (!product.getCompanyId().equals(companyId)) {
            throw new ResourceNotFoundException("Product not found for this company");
        }
        
        return stockMovementRepository.findByProductId(productId)
            .stream()
            .map(this::mapToMovementResponse)
            .collect(Collectors.toList());
    }
    
    public List<StockMovementResponse> getAllMovements(Long companyId) {
        return stockMovementRepository.findByCompanyId(companyId)
            .stream()
            .map(this::mapToMovementResponse)
            .collect(Collectors.toList());
    }
    
    private String generateSKU(String productName, Long companyId) {
        String base = productName.toUpperCase().replaceAll("[^A-Za-z0-9]", "_");
        String uniqueId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return base.substring(0, Math.min(10, base.length())) + "_" + uniqueId;
    }
    
    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
            .id(product.getId())
            .name(product.getName())
            .description(product.getDescription())
            .sku(product.getSku())
            .category(product.getCategory())
            .unit(product.getUnit())
            .unitPrice(product.getUnitPrice())
            .sellingPrice(product.getSellingPrice())
            .currentStock(product.getCurrentStock())
            .minimumStockLevel(product.getMinimumStockLevel())
            .isLowStock(product.getCurrentStock() < product.getMinimumStockLevel())
            .imageUrl(product.getImageUrl())
            .isActive(product.getIsActive())
            .createdAt(product.getCreatedAt())
            .updatedAt(product.getUpdatedAt())
            .build();
    }
    
    private StockMovementResponse mapToMovementResponse(StockMovement movement) {
        Product product = productRepository.findById(movement.getProductId()).orElse(null);
        User user = userRepository.findById(movement.getPerformedBy()).orElse(null);
        
        return StockMovementResponse.builder()
            .id(movement.getId())
            .productId(movement.getProductId())
            .productName(product != null ? product.getName() : null)
            .type(movement.getType())
            .quantity(movement.getQuantity())
            .referenceType(movement.getReferenceType())
            .notes(movement.getNotes())
            .performedByName(user != null ? user.getName() : null)
            .createdAt(movement.getCreatedAt())
            .build();
    }
}