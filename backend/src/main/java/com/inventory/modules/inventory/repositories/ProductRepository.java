package com.inventory.modules.inventory.repositories;

import com.inventory.modules.inventory.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByCompanyId(Long companyId);
    
    Optional<Product> findByCompanyIdAndName(Long companyId, String name);
    
    Optional<Product> findByCompanyIdAndSku(Long companyId, String sku);
    
    List<Product> findByCompanyIdAndIsActiveTrue(Long companyId);
    
    @Query("SELECT p FROM Product p WHERE p.companyId = :companyId AND p.currentStock < p.minimumStockLevel")
    List<Product> findLowStockProducts(@Param("companyId") Long companyId);
    
    List<Product> findByCompanyIdAndCategory(Long companyId, String category);
    
    boolean existsByCompanyIdAndSku(Long companyId, String sku);
}