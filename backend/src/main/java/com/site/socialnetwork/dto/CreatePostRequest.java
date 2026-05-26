package com.site.socialnetwork.dto;

import lombok.Data;

@Data
public class CreatePostRequest {
    private String content;
    private String image;
}
