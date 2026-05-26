package com.site.socialnetwork.repository;

import com.site.socialnetwork.entity.Comment;
import com.site.socialnetwork.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostOrderByCreatedAtAsc(Post post);
    long countByPost(Post post);
}
