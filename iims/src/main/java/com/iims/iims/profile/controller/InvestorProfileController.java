package com.iims.iims.profile.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.iims.iims.profile.dto.InvestorProfileDto;
import com.iims.iims.profile.dto.InvestorProfileUpdateRequest;
import com.iims.iims.profile.service.InvestorProfileService;

@RestController
@RequestMapping("/api/profile/investor")
@CrossOrigin(origins = "http://localhost:3000")
public class InvestorProfileController {
    private final InvestorProfileService service;

    public InvestorProfileController(InvestorProfileService service) {
        this.service = service;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<InvestorProfileDto> getProfile(@PathVariable UUID userId) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authenticated user: " + auth.getName() + ", roles: " + auth.getAuthorities());
        return ResponseEntity.ok(service.getProfileByUserId(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<InvestorProfileDto> updateProfile(@PathVariable UUID userId, @RequestBody InvestorProfileUpdateRequest req) {
        return ResponseEntity.ok(service.updateProfile(userId, req));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<InvestorProfileDto> createProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(service.createProfile(userId));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteProfile(@PathVariable UUID userId) {
        service.deleteProfile(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<InvestorProfileDto>> getAllInvestors() {
        return ResponseEntity.ok(service.getAllInvestors());
    }

    @GetMapping("/search")
    public ResponseEntity<List<InvestorProfileDto>> searchInvestors(@RequestParam String query) {
        return ResponseEntity.ok(service.searchInvestors(query));
    }

    @GetMapping("/focus/{investmentFocus}")
    public ResponseEntity<List<InvestorProfileDto>> getInvestorsByFocus(@PathVariable String investmentFocus) {
        return ResponseEntity.ok(service.getInvestorsByFocus(investmentFocus));
    }

    @GetMapping("/stage/{investmentStage}")
    public ResponseEntity<List<InvestorProfileDto>> getInvestorsByStage(@PathVariable String investmentStage) {
        return ResponseEntity.ok(service.getInvestorsByStage(investmentStage));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getInvestorCount() {
        return ResponseEntity.ok(service.getInvestorCount());
    }
}
