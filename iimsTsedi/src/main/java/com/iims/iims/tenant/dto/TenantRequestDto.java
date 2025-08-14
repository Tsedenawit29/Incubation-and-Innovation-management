package com.iims.iims.tenant.dto;

import lombok.Data;

@Data
public class TenantRequestDto {
    private String name;
    private String email;
    private String description;
    private String address;
    private String phone;
    private String website;
} 