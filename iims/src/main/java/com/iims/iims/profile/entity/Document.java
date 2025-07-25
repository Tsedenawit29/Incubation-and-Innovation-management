package com.iims.iims.profile.entity; // Or adjust to your preferred entity package

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "documents") // Table name for documents
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ManyToOne relationship with StartupProfile
    // Each document belongs to one startup profile
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "startup_profile_id", nullable = false) // Foreign key column
    private StartupProfile startupProfile;

    @Column(nullable = false, length = 500) // Name of the document (e.g., "Business Plan.pdf")
    private String name;

    @Column(columnDefinition = "TEXT") // URL to the document, or Base64 content if stored directly
    private String url;

    @Column(length = 50) // Type of the file (e.g., "pdf", "docx", "image/png")
    private String fileType;
}
