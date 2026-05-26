package com.site.socialnetwork.controller;

import com.site.socialnetwork.dto.UserDTO;
import com.site.socialnetwork.entity.User;
import com.site.socialnetwork.service.AuthService;
import com.site.socialnetwork.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final AuthService authService;
    private final UserService userService;

    public UserController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(userService.getUserProfile(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getProfileById(@PathVariable Long id){
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }
}
