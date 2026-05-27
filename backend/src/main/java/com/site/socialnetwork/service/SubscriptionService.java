package com.site.socialnetwork.service;

import com.site.socialnetwork.dto.UserDTO;
import com.site.socialnetwork.entity.Subscription;
import com.site.socialnetwork.entity.User;
import com.site.socialnetwork.repository.SubscriptionRepository;
import com.site.socialnetwork.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {
    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private UserRepository userRepository;

    // Подписаться
    public void subscribe(Long followingId, User follower) {
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        if (follower.getId().equals(followingId)) {
            throw new RuntimeException("Нельзя подписаться на себя");
        }

        if (subscriptionRepository.existsByFollowerAndFollowing(follower, following)) {
            throw new RuntimeException("Вы уже подписаны");
        }

        Subscription sub = new Subscription();
        sub.setFollower(follower);
        sub.setFollowing(following);
        subscriptionRepository.save(sub);
    }

    // Отписаться
    public void unsubscribe(Long followingId, User follower) {
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Subscription sub = subscriptionRepository.findByFollowerAndFollowing(follower, following)
                .orElseThrow(() -> new RuntimeException("Подписка не найдена"));

        subscriptionRepository.delete(sub);
    }

    // Список подписок (на кого подписан)
    public List<UserDTO> getFollowing(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        return subscriptionRepository.findByFollower(user)
                .stream()
                .map(sub -> convertToDTO(sub.getFollowing()))
                .collect(Collectors.toList());
    }

    // Список подписчиков (кто подписан)
    public List<UserDTO> getFollowers(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        return subscriptionRepository.findByFollowing(user)
                .stream()
                .map(sub -> convertToDTO(sub.getFollower()))
                .collect(Collectors.toList());
    }

    private UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getId(), user.getUsername(), user.getEmail(),
                user.getFirstName(), user.getLastName(),
                user.getAvatar(), user.getBio(),
                user.getRole().name(), user.getCreatedAt(), user.isActive()
        );
    }
}
