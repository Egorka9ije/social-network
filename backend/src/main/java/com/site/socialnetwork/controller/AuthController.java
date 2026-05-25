package com.site.socialnetwork.controller;

import com.site.socialnetwork.dto.JwtResponse;
import com.site.socialnetwork.dto.LoginRequest;
import com.site.socialnetwork.dto.MessageResponse;
import com.site.socialnetwork.dto.RegisterRequest;
import com.site.socialnetwork.entity.User;
import com.site.socialnetwork.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@RequestBody RegisterRequest request) {
        User user = authService.register(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                request.getFirstName(),
                request.getLastName(),
                request.getAvatar(),
                request.getBio()
        );
        return ResponseEntity.ok(new MessageResponse("User registered successfully: " + user.getUsername()));
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        String token = authService.authenticate(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(new JwtResponse(token));
    }
}
