package com.site.socialnetwork.repository;

import com.site.socialnetwork.entity.Like;
import com.site.socialnetwork.entity.Post;
import com.site.socialnetwork.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndPost(User user, Post post);
    long countByPost(Post post);
    boolean existsByUserAndPost(User user, Post post);
}
