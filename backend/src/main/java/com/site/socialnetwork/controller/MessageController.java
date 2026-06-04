package com.site.socialnetwork.controller;

import com.site.socialnetwork.dto.CreateMessageRequest;
import com.site.socialnetwork.dto.MessageDTO;
import com.site.socialnetwork.dto.UserDTO;
import com.site.socialnetwork.entity.User;
import com.site.socialnetwork.service.AuthService;
import com.site.socialnetwork.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {
    private final MessageService messageService;
    private final AuthService authService;

    public MessageController(MessageService messageService, AuthService authService) {
        this.messageService = messageService;
        this.authService = authService;
    }

    // Отправить сообщение
    @PostMapping("/send/{receiverId}")
    public ResponseEntity<MessageDTO> sendMessage(@PathVariable Long receiverId, @RequestBody CreateMessageRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(messageService.sendMessage(receiverId, request.getContent(), user));
    }

    // История чата
    @GetMapping("/chat/{userId}")
    public ResponseEntity<List<MessageDTO>> getChatHistory(@PathVariable Long userId) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(messageService.getChatHistory(userId, user));
    }

    // Список чатов
    @GetMapping("/chats")
    public ResponseEntity<List<UserDTO>> getChatList() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(messageService.getChatList(user));
    }
}
