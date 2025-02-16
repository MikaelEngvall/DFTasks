package com.dftasks.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Field;
import org.springframework.data.annotation.FieldType;
import org.springframework.data.mongodb.core.mapping.PrePersist;
import org.springframework.data.mongodb.core.mapping.PreUpdate;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tasks")
public class Task {
    @Id
    private String id;
    private String title;
    private String description;
    @Field(targetType = FieldType.ENCRYPTED)
    private Map<String, String> translations;
    private String reporterName;
    @Field(targetType = FieldType.ENCRYPTED)
    private String reporterEmail;
    private String reporterPhone;
    private String address;
    private String apartmentNumber;
    private String status;
    private String assignedTo;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private String url;
    private String userAgent;
    private String ip;
    private String platform;
    private String declinedBy;
    private LocalDateTime declinedAt;
    private String declineReason;
    private LocalDateTime updatedAt;

    @Field(targetType = FieldType.ENCRYPTED)
    private Map<String, Object> metadata;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 