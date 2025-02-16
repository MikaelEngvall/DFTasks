package com.dftasks.repository;

import com.dftasks.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByStatus(String status);
    List<Task> findByAssignedTo(String assignedTo);
    List<Task> findByStatusAndAssignedTo(String status, String assignedTo);
    List<Task> findByStatusOrderByCreatedAtDesc(String status);
    List<Task> findByStatusAndAssignedToIsNull(String status);
    List<Task> findByStatusAndCreatedAtBefore(String status, LocalDateTime date);
    long countByStatus(String status);
} 