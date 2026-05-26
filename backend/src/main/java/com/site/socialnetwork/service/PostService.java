package com.site.socialnetwork.service;

import com.site.socialnetwork.dto.PostDTO;
import com.site.socialnetwork.entity.Post;
import com.site.socialnetwork.entity.User;
import com.site.socialnetwork.repository.PostRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    private PostDTO convertToDTO(Post post) {
        return new PostDTO(
                post.getId(),
                post.getContent(),
                post.getImage(),
                post.getCreatedAt(),
                post.getUser().getId(),
                post.getUser().getUsername(),
                post.getUser().getAvatar(),
                0L,  // likesAmount (пока 0, добавим позже)
                0L   // commentsAmount (пока 0, добавим позже)
        );
    }

    public List<PostDTO> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Посты пользователя
    public List<PostDTO> getPostsByUser(Long userId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Создать пост
    public PostDTO createPost(String content, String image, User user) {
        Post post = new Post();
        post.setContent(content);
        post.setImage(image);
        post.setUser(user);
        return convertToDTO(postRepository.save(post));
    }

    public PostDTO getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пост не найден"));
        return convertToDTO(post);
    }

    // Обновить пост
    public PostDTO updatePost(Long id, String content, User user) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пост не найден"));
        if (!post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Вы не можете редактировать чужой пост");
        }
        post.setContent(content);
        post.setUpdatedAt(LocalDateTime.now());
        return convertToDTO(postRepository.save(post));
    }

    // Удалить пост
    public void deletePost(Long id, User user) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пост не найден"));
        if (!post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Вы не можете удалить чужой пост");
        }
        postRepository.delete(post);
    }
}
