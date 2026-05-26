package com.site.socialnetwork.service;

import com.site.socialnetwork.dto.UserDTO;
import com.site.socialnetwork.entity.User;
import com.site.socialnetwork.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

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
}
