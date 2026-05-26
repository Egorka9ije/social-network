package com.site.socialnetwork.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostDTO {
    Long id;
    String text;
    String image;
    LocalDateTime createdAt;
    Long authorId;
    String authorName;
    String avatar;
    Long likesAmount;
    Long commentAmount;
}
