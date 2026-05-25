package com.site.socialnetwork.service;

import com.site.socialnetwork.entity.Role;
import com.site.socialnetwork.entity.User;
import com.site.socialnetwork.exception.UnauthorizedException;
import com.site.socialnetwork.repository.UserRepository;
import com.site.socialnetwork.security.JwtUtils;
import com.site.socialnetwork.security.UserDetailsImpl;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;


import java.time.LocalDateTime;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
    }

    public User register(String username, String email, String password,
                         String firstName, String lastName, String avatar, String bio) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Логин уже занят");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email уже занят");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(Role.ROLE_USER);
        user.setActive(true);
        user.setAvatar(avatar);
        user.setBio(bio);

        return userRepository.save(user);
    }

    public String authenticate(String username, String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            return jwtUtils.generateJwtToken(authentication);
        } catch (InternalAuthenticationServiceException e) {
            // Spring Security оборачивает DisabledException в InternalAuthenticationServiceException
            if (e.getCause() instanceof DisabledException) {
                throw new DisabledException("Ваш аккаунт заблокирован. Обратитесь к администратору.");
            }
            throw new UnauthorizedException("Неверный логин или пароль");
        } catch (AuthenticationException e) {
            throw new UnauthorizedException("Неверный логин или пароль");
        }
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Пользователь не авторизован");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
    }
}
