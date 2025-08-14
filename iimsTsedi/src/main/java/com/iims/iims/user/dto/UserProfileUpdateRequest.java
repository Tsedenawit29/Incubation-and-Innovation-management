package com.iims.iims.user.dto;

import lombok.Data;
 
@Data
public class UserProfileUpdateRequest {
    private String fullName;
    private String email;
} 