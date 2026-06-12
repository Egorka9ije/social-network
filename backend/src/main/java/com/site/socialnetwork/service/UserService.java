package com.site.socialnetwork.service;

import com.site.socialnetwork.dto.UserDTO;
import com.site.socialnetwork.entity.Post;
import com.site.socialnetwork.entity.Role;
import com.site.socialnetwork.entity.User;
import com.site.socialnetwork.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired private LikeRepository likeRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private SubscriptionRepository subscriptionRepository;
    @Autowired private MessageRepository messageRepository;
    @Autowired private AuthService authService;

    // Получить профиль пользователя
    public UserDTO getUserProfile(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getAvatar(),
                user.getBio(),
                user.getRole().name(),
                user.getCreatedAt(),
                user.isActive()
        );
    }

    // Получить пользователя по ID
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        return getUserProfile(user);
    }

    // Поиск пользователей
    public List<UserDTO> searchUsers(String query) {
        return userRepository
                .findByUsernameContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                        query, query, query)
                .stream()
                .map(this::getUserProfile)
                .collect(Collectors.toList());
    }
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        // 1. Сначала удаляем лайки пользователя и лайки на его постах
        likeRepository.deleteAllByUser(user);
        List<Post> userPosts = postRepository.findByUserId(userId);
        for (Post post : userPosts) {
            likeRepository.deleteAllByPost(post);
            commentRepository.deleteAllByPost(post);
        }

        // 2. Удаляем комментарии пользователя
        commentRepository.deleteAllByUser(user);

        // 3. Удаляем посты пользователя
        postRepository.deleteAllByUser(user);

        // 4. Удаляем подписки
        subscriptionRepository.deleteAllByFollowerOrFollowing(user, user);

        // 5. Удаляем сообщения
        messageRepository.deleteAllBySenderOrReceiver(user, user);

        // 6. Удаляем пользователя
        userRepository.delete(user);
    }

    // Список всех пользователей
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::getUserProfile)
                .collect(Collectors.toList());
    }

    public UserDTO updateAvatar(User user, MultipartFile file) {
        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID().toString().substring(0, 8) + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get("uploads/avatars/");
            try {
                Files.createDirectories(uploadPath);
                Files.copy(file.getInputStream(), uploadPath.resolve(fileName));
                user.setAvatar("/uploads/avatars/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Ошибка загрузки аватара");
            }
        }
        userRepository.save(user);
        return getUserProfile(user);
    }

    // Изменить роль
    public UserDTO changeUserRole(Long userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        // Нельзя изменить роль самому себе
        User currentUser = authService.getCurrentUser();
        if (user.getId().equals(currentUser.getId())) {
            throw new RuntimeException("Нельзя изменить свою собственную роль");
        }

        user.setRole(Role.valueOf(newRole));
        userRepository.save(user);
        return getUserProfile(user);
    }

    // Заблокировать/разблокировать
    public UserDTO toggleUserActive(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        user.setActive(!user.isActive());
        userRepository.save(user);
        return getUserProfile(user);
    }

}
