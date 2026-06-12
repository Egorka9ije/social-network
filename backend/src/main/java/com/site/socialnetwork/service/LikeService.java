package com.site.socialnetwork.service;

import com.site.socialnetwork.entity.Like;
import com.site.socialnetwork.entity.Post;
import com.site.socialnetwork.entity.User;
import com.site.socialnetwork.repository.LikeRepository;
import com.site.socialnetwork.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LikeService {

    @Autowired
    private LikeRepository likeRepository;
    @Autowired
    private PostRepository postRepository;

    public void likePost(Long postId, User user){
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Пост не найден"));

        if (likeRepository.existsByUserAndPost(user, post)) {
            throw new RuntimeException("Вы уже лайкнули этот пост");
        }

        Like like = new Like();
        like.setUser(user);
        like.setPost(post);
        likeRepository.save(like);
    }

    public void unlikePost(Long postId, User user){
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Пост не найден"));

        Like like = likeRepository.findByUserAndPost(user, post)
                .orElseThrow(() -> new RuntimeException("Лайк не найден"));
        likeRepository.delete(like);
    }

    // Количество лайков
    public long getLikesCount(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Пост не найден"));
        return likeRepository.countByPost(post);
    }

    public long getTotalLikes(User user) {
        return likeRepository.countByPost_User(user);
    }
    public boolean isLikedByUser(Long postId, User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Пост не найден"));
        return likeRepository.existsByUserAndPost(user, post);
    }


}
