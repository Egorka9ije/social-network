package com.site.socialnetwork.controller;

import com.site.socialnetwork.dto.PostDTO;
import com.site.socialnetwork.dto.UserDTO;
import com.site.socialnetwork.entity.User;
import com.site.socialnetwork.service.AuthService;
import com.site.socialnetwork.service.PostService;
import com.site.socialnetwork.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {
    private final UserService userService;
    private final PostService postService;
    private final AuthService authService;

    public AdminController(UserService userService, PostService postService, AuthService authService) {
        this.userService = userService;
        this.postService = postService;
        this.authService = authService;
    }

    // Все посты (для админа)
    @GetMapping("/posts")
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    // Удалить любой пост
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deleteAnyPost(@PathVariable Long id) {
        try {
            User admin = authService.getCurrentUser();
            postService.deletePost(id, admin); // нужно изменить deletePost, чтобы админ мог удалять чужие
            return ResponseEntity.ok("Пост удалён");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Список всех пользователей
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Удалить пользователя
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("Пользователь удалён");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Изменить роль
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            UserDTO updated = userService.changeUserRole(id, request.get("role"));
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Заблокировать/разблокировать
    @PutMapping("/users/{id}/toggle-active")
    public ResponseEntity<?> toggleUserActive(@PathVariable Long id) {
        try {
            UserDTO updated = userService.toggleUserActive(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
