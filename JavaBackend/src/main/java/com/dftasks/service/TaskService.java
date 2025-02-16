package com.dftasks.service;

import com.dftasks.model.Task;
import com.dftasks.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;

    public Task createTask(Task task) {
        task.setCreatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<Task> getPendingTasks() {
        return taskRepository.findByStatus("pending");
    }

    public Task getTaskById(String id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    public Task updateTask(String id, Task taskDetails) {
        Task task = getTaskById(id);
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setStatus(taskDetails.getStatus());
        task.setAssignedTo(taskDetails.getAssignedTo());
        task.setDueDate(taskDetails.getDueDate());
        return taskRepository.save(task);
    }

    public Task declineTask(String id, String declineReason, String userId) {
        Task task = getTaskById(id);
        task.setStatus("declined");
        task.setDeclinedBy(userId);
        task.setDeclinedAt(LocalDateTime.now());
        task.setDeclineReason(declineReason);
        return taskRepository.save(task);
    }

    public void deleteTask(String id) {
        taskRepository.deleteById(id);
    }
} 