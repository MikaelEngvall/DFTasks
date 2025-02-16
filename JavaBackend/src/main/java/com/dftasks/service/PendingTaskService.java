package com.dftasks.service;

import com.dftasks.model.Task;
import com.dftasks.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PendingTaskService {
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 8 * * *") // Kör 08:00 varje dag
    public void checkPendingTasks() {
        List<Task> pendingTasks = taskRepository.findByStatusAndCreatedAtBefore(
            "pending", 
            LocalDateTime.now().minusDays(2)
        );

        if (!pendingTasks.isEmpty()) {
            notificationService.notifyAdminsAboutPendingTasks(pendingTasks);
        }
    }

    public Map<String, Long> getPendingTasksStatistics() {
        long totalPending = taskRepository.countByStatus("pending");
        long unassigned = taskRepository.findByStatusAndAssignedToIsNull("pending").size();
        long overdue = taskRepository.findByStatusAndCreatedAtBefore(
            "pending", 
            LocalDateTime.now().minusDays(2)
        ).size();

        return Map.of(
            "total", totalPending,
            "unassigned", unassigned,
            "overdue", overdue
        );
    }

    public List<Task> getHighPriorityPendingTasks() {
        return taskRepository.findByStatusOrderByCreatedAtDesc("pending").stream()
            .filter(this::isHighPriority)
            .collect(Collectors.toList());
    }

    private boolean isHighPriority(Task task) {
        LocalDateTime twoDaysAgo = LocalDateTime.now().minusDays(2);
        return task.getCreatedAt().isBefore(twoDaysAgo) || 
               (task.getDueDate() != null && task.getDueDate().isBefore(LocalDateTime.now()));
    }
} 