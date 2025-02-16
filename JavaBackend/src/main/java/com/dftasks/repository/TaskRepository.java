package com.dftasks.repository;

import com.dftasks.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByStatus(String status);
    List<Task> findByAssignedTo(String userId);
} 