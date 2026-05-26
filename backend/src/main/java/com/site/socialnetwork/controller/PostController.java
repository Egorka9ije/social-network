package com.site.socialnetwork.controller;

import com.site.socialnetwork.dto.*;
import com.site.socialnetwork.entity.User;
import com.site.socialnetwork.service.AuthService;
import com.site.socialnetwork.service.CommentService;
import com.site.socialnetwork.service.LikeService;
import com.site.socialnetwork.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:5173")
public class PostController {

    private final PostService postService;
    private final AuthService authService;
    private final LikeService likeService;
    private final CommentService commentService;

    public PostController(PostService postService, AuthService authService, LikeService likeService, CommentService commentService) {
        this.postService = postService;
        this.authService = authService;
        this.likeService = likeService;
        this.commentService = commentService;
    }

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts(){
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable Long id){
        return ResponseEntity.ok(postService.getPostById(id));
    }

    @PostMapping()
    public ResponseEntity<PostDTO> createPost(@RequestBody CreatePostRequest request){
        User user = authService.getCurrentUser();
        PostDTO post = postService.createPost(request.getContent(), request.getImage(), user);
        return ResponseEntity.ok(post);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostDTO> updatePost(@PathVariable Long id, @RequestBody CreatePostRequest request) {
        User user = authService.getCurrentUser();
        PostDTO post = postService.updatePost(id, request.getContent(), user);
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        postService.deletePost(id, user);
        return ResponseEntity.ok("Пост удалён");
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostDTO>> getPostsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(postService.getPostsByUser(userId));
    }

    // Лайкнуть пост
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        likeService.likePost(id, user);
        return ResponseEntity.ok("Лайк поставлен");
    }

    // Убрать лайк
    @DeleteMapping("/{id}/like")
    public ResponseEntity<?> unlikePost(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        likeService.unlikePost(id, user);
        return ResponseEntity.ok("Лайк убран");
    }

    // Комментарии к посту
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getCommentsByPost(id));
    }

    // Добавить комментарий
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDTO> addComment(@PathVariable Long id, @RequestBody CreateCommentRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(commentService.addComment(id, request.getContent(), user));
    }

    // Удалить комментарий
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        User user = authService.getCurrentUser();
        commentService.deleteComment(commentId, user);
        return ResponseEntity.ok("Комментарий удалён");
    }
}
