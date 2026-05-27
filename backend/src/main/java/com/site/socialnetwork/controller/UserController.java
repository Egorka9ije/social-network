package com.site.socialnetwork.controller;

import com.site.socialnetwork.dto.UserDTO;
import com.site.socialnetwork.entity.User;
import com.site.socialnetwork.service.AuthService;
import com.site.socialnetwork.service.SubscriptionService;
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
    private final SubscriptionService subscriptionService;

    public UserController(AuthService authService, UserService userService, SubscriptionService subscriptionService) {
        this.authService = authService;
        this.userService = userService;
        this.subscriptionService = subscriptionService;
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

    // Подписаться
    @PostMapping("/{id}/subscribe")
    public ResponseEntity<?> subscribe(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        subscriptionService.subscribe(id, user);
        return ResponseEntity.ok("Вы подписаны");
    }

    // Отписаться
    @DeleteMapping("/{id}/subscribe")
    public ResponseEntity<?> unsubscribe(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        subscriptionService.unsubscribe(id, user);
        return ResponseEntity.ok("Вы отписаны");
    }

    // Подписки пользователя
    @GetMapping("/{id}/following")
    public ResponseEntity<List<UserDTO>> getFollowing(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.getFollowing(id));
    }

    // Подписчики пользователя
    @GetMapping("/{id}/followers")
    public ResponseEntity<List<UserDTO>> getFollowers(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.getFollowers(id));
    }
}
