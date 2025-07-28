package com.iims.iims.mentorassignment.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class UserSummaryDTO {
    private UUID id;
    private String fullName;
    private String email;
} 