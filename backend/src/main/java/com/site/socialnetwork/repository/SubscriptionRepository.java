package com.site.socialnetwork.repository;

import com.site.socialnetwork.entity.Subscription;
import com.site.socialnetwork.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    // Подписан ли follower на following
    Optional<Subscription> findByFollowerAndFollowing(User follower, User following);

    // Подписки пользователя (на кого подписан)
    List<Subscription> findByFollower(User follower);

    // Подписчики пользователя (кто подписан на него)
    List<Subscription> findByFollowing(User following);

    // Количество подписок
    long countByFollower(User follower);

    // Количество подписчиков
    long countByFollowing(User following);

    // Проверка подписки
    boolean existsByFollowerAndFollowing(User follower, User following);
    void deleteAllByFollowerOrFollowing(User follower, User following);
}
