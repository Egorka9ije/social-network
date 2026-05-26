package com.site.socialnetwork.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    Long id;
    String username;
    String email;
    String firstName;
    String lastName;
    String avatar;
    String bio;
    String role;
    LocalDateTime createdAt;
    boolean isActive;
}
