package com.iims.iims.meeting.entity;

import com.iims.iims.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "meetings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_time")
    private Instant startTime;

    @Column(name = "end_time")
    private Instant endTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    // Attendees stored as user references (many-to-many)
    @ManyToMany
    @JoinTable(name = "meeting_attendees",
            joinColumns = @JoinColumn(name = "meeting_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private List<User> attendees;

    @Column(name = "meet_link")
    private String meetLink;

    @Column(name = "google_event_id")
    private String googleEventId;

    // store who owns the event: "user:<uuid>" or "tenant:<uuid>"
    @Column(name = "google_event_owner")
    private String googleEventOwner;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    public void onCreate() { createdAt = Instant.now(); }
}
