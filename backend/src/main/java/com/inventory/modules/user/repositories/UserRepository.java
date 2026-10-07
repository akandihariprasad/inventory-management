package com.inventory.modules.user.repositories;

import com.inventory.common.enums.Role;
import com.inventory.modules.user.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByCompanyId(Long companyId);
    
    List<User> findByCompanyIdAndRole(Long companyId, Role role);
    
    List<User> findByRole(Role role);
    
    Optional<User> findByEmailAndRole(String email, Role role);
}