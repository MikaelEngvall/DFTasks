package com.dftasks.service;

import com.dftasks.dto.TaskDTO;
import com.dftasks.model.Task;
import com.dftasks.model.User;
import com.dftasks.repository.TaskRepository;
import com.dftasks.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TranslationService translationService;

    public List<Task> getAllTasks(String status, String assignedTo) {
        if (status != null && assignedTo != null) {
            return taskRepository.findByStatusAndAssignedTo(status, assignedTo);
        } else if (status != null) {
            return taskRepository.findByStatus(status);
        } else if (assignedTo != null) {
            return taskRepository.findByAssignedTo(assignedTo);
        }
        return taskRepository.findAll();
    }

    public Task getTaskById(String id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    public Task createTask(TaskDTO taskDTO) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Task task = Task.builder()
                .title(taskDTO.getTitle())
                .description(taskDTO.getDescription())
                .status("pending")
                .reporterName(currentUser.getName())
                .reporterEmail(currentUser.getEmail())
                .dueDate(taskDTO.getDueDate())
                .build();

        // Översätt titel och beskrivning till alla stödda språk
        Map<String, String> translations = translationService.translateTask(
                task.getTitle(), 
                task.getDescription()
        );
        task.setTranslations(translations);

        return taskRepository.save(task);
    }

    public Task updateTask(String id, TaskDTO taskDTO) {
        Task existingTask = getTaskById(id);
        
        if (taskDTO.getTitle() != null) {
            existingTask.setTitle(taskDTO.getTitle());
        }
        if (taskDTO.getDescription() != null) {
            existingTask.setDescription(taskDTO.getDescription());
        }
        if (taskDTO.getDueDate() != null) {
            existingTask.setDueDate(taskDTO.getDueDate());
        }

        // Uppdatera översättningar om titel eller beskrivning har ändrats
        if (taskDTO.getTitle() != null || taskDTO.getDescription() != null) {
            Map<String, String> translations = translationService.translateTask(
                    existingTask.getTitle(), 
                    existingTask.getDescription()
            );
            existingTask.setTranslations(translations);
        }

        return taskRepository.save(existingTask);
    }

    public void deleteTask(String id) {
        Task task = getTaskById(id);
        taskRepository.delete(task);
    }

    public Task updateTaskStatus(String id, String status) {
        Task task = getTaskById(id);
        task.setStatus(status);
        return taskRepository.save(task);
    }

    public Task addComment(String id, String comment) {
        Task task = getTaskById(id);
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Map<String, Object> commentData = Map.of(
                "content", comment,
                "createdBy", currentUser.getId(),
                "createdAt", LocalDateTime.now(),
                "isActive", true
        );

        if (task.getMetadata() == null) {
            task.setMetadata(Map.of("comments", List.of(commentData)));
        } else {
            List<Map<String, Object>> comments = (List<Map<String, Object>>) 
                    task.getMetadata().getOrDefault("comments", List.of());
            comments.add(commentData);
            task.getMetadata().put("comments", comments);
        }

        return taskRepository.save(task);
    }

    public Task assignTask(String id, String userId) {
        Task task = getTaskById(id);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        task.setAssignedTo(userId);
        task.setStatus("in progress");
        
        return taskRepository.save(task);
    }

    public Task declineTask(String id, String reason) {
        Task task = getTaskById(id);
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        task.setStatus("cannot fix");
        task.setDeclinedBy(currentUser.getId());
        task.setDeclinedAt(LocalDateTime.now());
        task.setDeclineReason(reason);

        return taskRepository.save(task);
    }
} 