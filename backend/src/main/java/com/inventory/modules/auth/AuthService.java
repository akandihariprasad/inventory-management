package com.inventory.modules.auth;

import com.inventory.common.enums.Role;
import com.inventory.common.exception.DuplicateResourceException;
import com.inventory.common.exception.ResourceNotFoundException;
import com.inventory.modules.auth.dto.*;
import com.inventory.modules.company.entities.Company;
import com.inventory.modules.company.repositories.CompanyRepository;
import com.inventory.modules.supplier.entities.Supplier;
import com.inventory.modules.supplier.repositories.SupplierRepository;
import com.inventory.modules.user.entities.RefreshToken;
import com.inventory.modules.user.entities.User;
import com.inventory.modules.user.repositories.RefreshTokenRepository;
import com.inventory.modules.user.repositories.UserRepository;
import com.inventory.security.JwtUtil;
import com.inventory.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final SupplierRepository supplierRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    
    @Transactional
    public LoginResponse registerOwner(RegisterOwnerRequest request) {
        log.info("Registering new owner with email: {}", request.getEmail());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }
        
        // Create company
        Company company = Company.builder()
            .name(request.getCompanyName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .address(request.getAddress())
            .build();
        company = companyRepository.save(company);
        log.info("Company created with ID: {}", company.getId());
        
        // Create user
        User user = User.builder()
            .name(request.getOwnerName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(Role.OWNER)
            .companyId(company.getId())
            .isActive(true)
            .isPasswordResetRequired(false)
            .build();
        user = userRepository.save(user);
        log.info("Owner user created with ID: {}", user.getId());
        
        // Generate tokens
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String accessToken = jwtUtil.generateAccessToken(userDetails, user.getId(), 
            user.getRole().name(), user.getCompanyId(), user.getName());
        String refreshToken = generateRefreshToken(userDetails, user.getId());
        
        return buildLoginResponse(user, accessToken, refreshToken);
    }
    
    @Transactional
    public LoginResponse registerSupplier(RegisterSupplierRequest request) {
        log.info("Registering new supplier with email: {}", request.getEmail());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }
        
        // Create user
        User user = User.builder()
            .name(request.getSupplierName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(Role.SUPPLIER)
            .companyId(null)
            .isActive(true)
            .isPasswordResetRequired(false)
            .build();
        user = userRepository.save(user);
        log.info("Supplier user created with ID: {}", user.getId());
        
        // Create supplier profile
        Supplier supplier = Supplier.builder()
            .userId(user.getId())
            .companyName(request.getSupplierName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .address(request.getBusinessAddress())
            .isVerified(false)
            .build();
        supplierRepository.save(supplier);
        log.info("Supplier profile created");
        
        // Generate tokens
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String accessToken = jwtUtil.generateAccessToken(userDetails, user.getId(), 
            user.getRole().name(), null, user.getName());
        String refreshToken = generateRefreshToken(userDetails, user.getId());
        
        return buildLoginResponse(user, accessToken, refreshToken);
    }
    
    @Transactional
    public LoginResponse registerAdmin(RegisterAdminRequest request) {
        log.info("Registering new admin with email: {}", request.getEmail());
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }
        
        // Verify company exists
        Company company = companyRepository.findById(request.getCompanyId())
            .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + request.getCompanyId()));
        
        // Create admin user
        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(Role.ADMIN)
            .companyId(request.getCompanyId())
            .isActive(true)
            .isPasswordResetRequired(false)
            .build();
        
        user = userRepository.save(user);
        log.info("Admin user created with ID: {} for company: {}", user.getId(), company.getName());
        
        // Generate tokens
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String accessToken = jwtUtil.generateAccessToken(userDetails, user.getId(), 
            user.getRole().name(), user.getCompanyId(), user.getName());
        String refreshToken = generateRefreshToken(userDetails, user.getId());
        
        return buildLoginResponse(user, accessToken, refreshToken);
    }
    
    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userRepository.findById(userDetails.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (!user.getIsActive()) {
            log.warn("Login failed: Account deactivated for user: {}", request.getEmail());
            throw new RuntimeException("Account is deactivated. Please contact administrator.");
        }
        
        log.info("Login successful for user: {}", request.getEmail());
        
        String accessToken = jwtUtil.generateAccessToken(userDetails, user.getId(), 
            user.getRole().name(), user.getCompanyId(), user.getName());
        String refreshToken = generateRefreshToken(userDetails, user.getId());
        
        return buildLoginResponse(user, accessToken, refreshToken);
    }
    
    @Transactional
    public LoginResponse refreshToken(String refreshToken) {
        log.info("Refreshing token");
        
        if (refreshToken != null && refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        }
        
        if (!jwtUtil.validateRefreshToken(refreshToken)) {
            log.warn("Invalid refresh token");
            throw new RuntimeException("Invalid refresh token");
        }
        
        Long userId = jwtUtil.extractUserId(refreshToken);
        
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
            .orElseThrow(() -> new RuntimeException("Refresh token not found"));
        
        if (storedToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(storedToken);
            log.warn("Refresh token expired for user ID: {}", userId);
            throw new RuntimeException("Refresh token expired");
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String newAccessToken = jwtUtil.generateAccessToken(userDetails, user.getId(), 
            user.getRole().name(), user.getCompanyId(), user.getName());
        String newRefreshToken = generateRefreshToken(userDetails, user.getId());
        
        // Delete old refresh token
        refreshTokenRepository.delete(storedToken);
        
        log.info("Token refreshed successfully for user: {}", user.getEmail());
        
        return buildLoginResponse(user, newAccessToken, newRefreshToken);
    }
    
    @Transactional
    public void logout(String token) {
        log.info("Logging out user");
        
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        refreshTokenRepository.findByToken(token).ifPresent(refreshToken -> {
            refreshTokenRepository.delete(refreshToken);
            log.info("Refresh token deleted");
        });
    }
    
    @Transactional
    public void setPassword(SetPasswordRequest request, String token) {
        log.info("Setting new password");
        
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        String email = jwtUtil.extractUsername(token);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setIsPasswordResetRequired(false);
        userRepository.save(user);
        
        log.info("Password updated successfully for user: {}", email);
    }
    
    private String generateRefreshToken(UserDetailsImpl userDetails, Long userId) {
        String token = jwtUtil.generateRefreshToken(userDetails, userId);
        
        RefreshToken refreshToken = RefreshToken.builder()
            .token(token)
            .userId(userId)
            .expiryDate(LocalDateTime.now().plusDays(7))
            .build();
        
        refreshTokenRepository.save(refreshToken);
        return token;
    }
    
    private LoginResponse buildLoginResponse(User user, String accessToken, String refreshToken) {
        return LoginResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .userId(user.getId())
            .email(user.getEmail())
            .name(user.getName())
            .role(user.getRole().name())
            .companyId(user.getCompanyId())
            .isPasswordResetRequired(user.getIsPasswordResetRequired())
            .build();
    }
}