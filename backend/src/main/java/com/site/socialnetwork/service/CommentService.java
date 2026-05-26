package com.site.socialnetwork.service;

import com.site.socialnetwork.dto.CommentDTO;
import com.site.socialnetwork.dto.PostDTO;
import com.site.socialnetwork.entity.Comment;
import com.site.socialnetwork.entity.Post;
import com.site.socialnetwork.entity.User;
import com.site.socialnetwork.repository.CommentRepository;
import com.site.socialnetwork.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private PostRepository postRepository;

    private CommentDTO convertToDTO(Comment comment) {
        return new CommentDTO(
                comment.getId(),
                comment.getContent(),
                comment.getUser().getId(),
                comment.getUser().getUsername(),
                comment.getUser().getAvatar(),
                comment.getCreatedAt()
        );
    }

    public CommentDTO addComment(Long postId, String content, User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Пост не найден"));
        Comment comment = new Comment();
        comment.setContent(content);
        comment.setUser(user);
        comment.setPost(post);  // ← привязать пост
        return convertToDTO(commentRepository.save(comment));
    }

    public void deleteComment(Long id, User user) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Комментарий не найден"));
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Вы не можете удалить чужой комменатрий");
        }
        commentRepository.delete(comment);
    }

    public List<CommentDTO> getCommentsByPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Пост не найден"));
        return commentRepository.findByPostOrderByCreatedAtAsc(post)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public long getCommentsCount(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Пост не найден"));
        return commentRepository.countByPost(post);
    }
}
