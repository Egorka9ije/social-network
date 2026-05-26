package com.site.socialnetwork.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentDTO {
    private Long id;
    private String content;
    private Long userId;
    private String username;
    private String userAvatar;
    private LocalDateTime createdAt;

}
