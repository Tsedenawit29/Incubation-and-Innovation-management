package com.iims.iims.Industry.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IndustryResponse {

    private UUID id;
    private UUID tenantId; // Just the ID, not the full object
    private String name;
    private String description;
}
