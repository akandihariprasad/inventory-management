package com.inventory.modules.purchase.services;

import com.inventory.common.enums.OrderStatus;
import com.inventory.common.exception.ResourceNotFoundException;
import com.inventory.modules.company.entities.Company;
import com.inventory.modules.company.repositories.CompanyRepository;
import com.inventory.modules.inventory.entities.Product;
import com.inventory.modules.inventory.entities.StockMovement;
import com.inventory.modules.inventory.repositories.ProductRepository;
import com.inventory.modules.inventory.repositories.StockMovementRepository;
import com.inventory.modules.purchase.dto.*;
import com.inventory.modules.purchase.entities.PurchaseRequest;
import com.inventory.modules.purchase.entities.PurchaseRequestItem;
import com.inventory.modules.purchase.repositories.PurchaseRequestItemRepository;
import com.inventory.modules.purchase.repositories.PurchaseRequestRepository;
import com.inventory.modules.supplier.entities.Supplier;
import com.inventory.modules.supplier.entities.SupplierProduct;
import com.inventory.modules.supplier.repositories.SupplierProductRepository;
import com.inventory.modules.supplier.repositories.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseRequestService {
    
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final PurchaseRequestItemRepository itemRepository;
    private final SupplierRepository supplierRepository;
    private final CompanyRepository companyRepository;
    private final SupplierProductRepository supplierProductRepository;
    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    
    @Transactional
    public PurchaseRequestResponse createPurchaseRequest(Long companyId, Long userId, PurchaseRequestRequest request) {
        // Validate supplier
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
            .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        
        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        
        // Create purchase request
        PurchaseRequest purchaseRequest = PurchaseRequest.builder()
            .companyId(companyId)
            .supplierId(request.getSupplierId())
            .status(OrderStatus.PENDING)
            .totalAmount(BigDecimal.ZERO)
            .deliveryNotes(request.getDeliveryNotes())
            .build();
        
        purchaseRequest = purchaseRequestRepository.save(purchaseRequest);
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        // Create items
        for (PurchaseRequestItemDTO itemDTO : request.getItems()) {
            SupplierProduct supplierProduct = supplierProductRepository.findById(itemDTO.getSupplierProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier product not found"));
            
            BigDecimal unitPrice = supplierProduct.getUnitPrice();
            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(itemDTO.getRequestedQty()));
            
            PurchaseRequestItem item = PurchaseRequestItem.builder()
                .purchaseRequestId(purchaseRequest.getId())
                .supplierProductId(itemDTO.getSupplierProductId())
                .productName(itemDTO.getProductName())
                .requestedQty(itemDTO.getRequestedQty())
                .unitPrice(unitPrice)
                .totalPrice(totalPrice)
                .build();
            
            itemRepository.save(item);
            totalAmount = totalAmount.add(totalPrice);
        }
        
        // Update total amount
        purchaseRequest.setTotalAmount(totalAmount);
        purchaseRequest = purchaseRequestRepository.save(purchaseRequest);
        
        return mapToResponse(purchaseRequest);
    }
    
    @Transactional
    public PurchaseRequestResponse approvePurchaseRequest(Long purchaseRequestId, Long supplierId) {
        PurchaseRequest request = purchaseRequestRepository.findById(purchaseRequestId)
            .orElseThrow(() -> new ResourceNotFoundException("Purchase request not found"));
        
        if (!request.getSupplierId().equals(supplierId)) {
            throw new ResourceNotFoundException("Purchase request not found for this supplier");
        }
        
        if (request.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Purchase request is not in PENDING state");
        }
        
        request.setStatus(OrderStatus.APPROVED);
        request = purchaseRequestRepository.save(request);
        
        return mapToResponse(request);
    }
    
    @Transactional
    public PurchaseRequestResponse rejectPurchaseRequest(Long purchaseRequestId, Long supplierId, ApproveRejectRequest rejectRequest) {
        PurchaseRequest request = purchaseRequestRepository.findById(purchaseRequestId)
            .orElseThrow(() -> new ResourceNotFoundException("Purchase request not found"));
        
        if (!request.getSupplierId().equals(supplierId)) {
            throw new ResourceNotFoundException("Purchase request not found for this supplier");
        }
        
        if (request.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Purchase request is not in PENDING state");
        }
        
        request.setStatus(OrderStatus.REJECTED);
        request.setRejectionReason(rejectRequest.getRejectionReason());
        request = purchaseRequestRepository.save(request);
        
        return mapToResponse(request);
    }
    
    @Transactional
    public PurchaseRequestResponse dispatchPurchaseRequest(Long purchaseRequestId, Long supplierId) {
        PurchaseRequest request = purchaseRequestRepository.findById(purchaseRequestId)
            .orElseThrow(() -> new ResourceNotFoundException("Purchase request not found"));
        
        if (!request.getSupplierId().equals(supplierId)) {
            throw new ResourceNotFoundException("Purchase request not found for this supplier");
        }
        
        if (request.getStatus() != OrderStatus.APPROVED) {
            throw new IllegalStateException("Purchase request must be APPROVED before dispatching");
        }
        
        request.setStatus(OrderStatus.DISPATCHED);
        request.setDispatchedAt(LocalDateTime.now());
        request = purchaseRequestRepository.save(request);
        
        return mapToResponse(request);
    }
    
    @Transactional
    public PurchaseRequestResponse deliverPurchaseRequest(Long purchaseRequestId, Long companyId, Long userId, DeliveryRequest deliveryRequest) {
        PurchaseRequest request = purchaseRequestRepository.findById(purchaseRequestId)
            .orElseThrow(() -> new ResourceNotFoundException("Purchase request not found"));
        
        if (!request.getCompanyId().equals(companyId)) {
            throw new ResourceNotFoundException("Purchase request not found for this company");
        }
        
        if (request.getStatus() != OrderStatus.DISPATCHED) {
            throw new IllegalStateException("Purchase request must be DISPATCHED before delivery");
        }
        
        // Update received quantities
        List<PurchaseRequestItem> items = itemRepository.findByPurchaseRequestId(purchaseRequestId);
        for (PurchaseRequestItem item : items) {
            Integer receivedQty = deliveryRequest.getReceivedQuantities().get(item.getId());
            if (receivedQty != null) {
                item.setReceivedQty(receivedQty);
                itemRepository.save(item);
                
                // Update stock and create stock movement
                updateInventoryStock(request.getCompanyId(), item, receivedQty, userId, purchaseRequestId);
            }
        }
        
        request.setStatus(OrderStatus.DELIVERED);
        request.setDeliveredAt(LocalDateTime.now());
        request = purchaseRequestRepository.save(request);
        
        return mapToResponse(request);
    }
    
    private void updateInventoryStock(Long companyId, PurchaseRequestItem item, Integer receivedQty, Long userId, Long purchaseRequestId) {
        // Find or create product in company's inventory
        Product product = productRepository.findByCompanyIdAndName(companyId, item.getProductName())
            .orElseGet(() -> {
                Product newProduct = Product.builder()
                    .companyId(companyId)
                    .name(item.getProductName())
                    .sku(generateSKU(item.getProductName()))
                    .unitPrice(item.getUnitPrice())
                    .sellingPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(1.2))) // 20% markup
                    .currentStock(0)
                    .minimumStockLevel(5)
                    .isActive(true)
                    .build();
                return productRepository.save(newProduct);
            });
        
        // Update stock
        int oldStock = product.getCurrentStock();
        product.setCurrentStock(oldStock + receivedQty);
        productRepository.save(product);
        
        // Create stock movement
        StockMovement movement = StockMovement.builder()
            .productId(product.getId())
            .companyId(companyId)
            .type(com.inventory.common.enums.StockMovementType.STOCK_IN)
            .quantity(receivedQty)
            .referenceId(purchaseRequestId)
            .referenceType("PURCHASE_REQUEST")
            .notes("Stock received from purchase order")
            .performedBy(userId)
            .build();
        
        stockMovementRepository.save(movement);
    }
    
    private String generateSKU(String productName) {
        return productName.toUpperCase().replaceAll("\\s+", "_").substring(0, Math.min(10, productName.length())) 
            + "_" + System.currentTimeMillis();
    }
    
    public List<PurchaseRequestResponse> getCompanyPurchaseRequests(Long companyId) {
        return purchaseRequestRepository.findByCompanyIdOrderByCreatedAtDesc(companyId)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public List<PurchaseRequestResponse> getSupplierPurchaseRequests(Long supplierId) {
        return purchaseRequestRepository.findBySupplierIdOrderByCreatedAtDesc(supplierId)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public PurchaseRequestResponse getPurchaseRequestById(Long id, Long companyId) {
        PurchaseRequest request = purchaseRequestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Purchase request not found"));
        
        if (!request.getCompanyId().equals(companyId)) {
            throw new ResourceNotFoundException("Purchase request not found for this company");
        }
        
        return mapToResponse(request);
    }
    
    private PurchaseRequestResponse mapToResponse(PurchaseRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId()).orElse(null);
        Company company = companyRepository.findById(request.getCompanyId()).orElse(null);
        
        List<PurchaseRequestItem> items = itemRepository.findByPurchaseRequestId(request.getId());
        List<PurchaseRequestItemDTO> itemDTOs = items.stream()
            .map(item -> {
                PurchaseRequestItemDTO dto = new PurchaseRequestItemDTO();
                dto.setSupplierProductId(item.getSupplierProductId());
                dto.setProductName(item.getProductName());
                dto.setRequestedQty(item.getRequestedQty());
                dto.setUnitPrice(item.getUnitPrice());
                return dto;
            })
            .collect(Collectors.toList());
        
        return PurchaseRequestResponse.builder()
            .id(request.getId())
            .companyId(request.getCompanyId())
            .companyName(company != null ? company.getName() : null)
            .supplierId(request.getSupplierId())
            .supplierName(supplier != null ? supplier.getCompanyName() : null)
            .status(request.getStatus())
            .totalAmount(request.getTotalAmount())
            .rejectionReason(request.getRejectionReason())
            .deliveryNotes(request.getDeliveryNotes())
            .dispatchedAt(request.getDispatchedAt())
            .deliveredAt(request.getDeliveredAt())
            .createdAt(request.getCreatedAt())
            .updatedAt(request.getUpdatedAt())
            .items(itemDTOs)
            .build();
    }
}