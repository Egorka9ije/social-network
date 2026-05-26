package com.site.socialnetwork.repository;

import com.site.socialnetwork.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // Все посты (лента)
    List<Post> findAllByOrderByCreatedAtDesc();

    // Посты пользователя
    List<Post> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Посты от подписок (лента друзей)
    List<Post> findByUserIdInOrderByCreatedAtDesc(List<Long> userIds);
}
