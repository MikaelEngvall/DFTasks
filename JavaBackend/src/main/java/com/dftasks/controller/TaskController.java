package com.dftasks.controller;

import com.dftasks.model.Task;
import com.dftasks.service.TaskService;
import com.dftasks.service.TranslationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import java.util.ArrayList;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.AllArgsConstructor;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;
    private final TranslationService translationService;
    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Task>> getAllTasks(
            @RequestHeader(value = "Accept-Language", defaultValue = "sv") String language) {
        List<Task> tasks = taskService.getAllTasks();
        
        // Översätt beskrivningar för alla uppgifter till det begärda språket
        tasks.forEach(task -> {
            if (task.getTranslations() != null && task.getTranslations().containsKey(language)) {
                task.setDescription(task.getTranslations().get(language));
            }
        });
        
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Task>> getPendingTasks() {
        return ResponseEntity.ok(taskService.getPendingTasks());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Task> getTask(
            @PathVariable String id,
            @RequestHeader(value = "Accept-Language", defaultValue = "sv") String language) {
        Task task = taskService.getTaskById(id);
        
        // Om det begärda språket finns i översättningarna, använd det
        if (task.getTranslations() != null && task.getTranslations().containsKey(language)) {
            String translatedDescription = task.getTranslations().get(language);
            task.setDescription(translatedDescription);
        }
        // Annars behåll originalspråket (svenska)
        
        return ResponseEntity.ok(task);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        // Översätt beskrivningen till alla målspråk
        Map<String, String> translations = new HashMap<>();
        translations.put("sv", task.getDescription()); // Originalspråk
        
        for (String lang : List.of("en", "pl", "uk")) {
            try {
                String translatedDesc = translationService.translate(task.getDescription(), lang);
                translations.put(lang, translatedDesc);
            } catch (Exception e) {
                translations.put(lang, task.getDescription()); // Använd original vid fel
            }
        }
        
        task.setTranslations(translations);
        return ResponseEntity.ok(taskService.createTask(task));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @RequestBody Task task) {
        return ResponseEntity.ok(taskService.updateTask(id, task));
    }

    @PostMapping("/{id}/decline")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> declineTask(
            @PathVariable String id,
            @RequestParam String declineReason,
            @RequestParam String userId) {
        return ResponseEntity.ok(taskService.declineTask(id, declineReason, userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/translations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> updateTranslations(@PathVariable String id) {
        Task task = taskService.getTaskById(id);
        if (task == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            // Översätt beskrivningen till alla målspråk
            Map<String, String> translations = new HashMap<>();
            translations.put("sv", task.getDescription()); // Originalspråk

            for (String lang : List.of("en", "pl", "uk")) {
                try {
                    String translatedDesc = translationService.translate(task.getDescription(), lang);
                    translations.put(lang, translatedDesc);
                    logger.debug("Translated task {} to {}", id, lang);
                } catch (Exception e) {
                    logger.warn("Failed to translate task {} to {}: {}", id, lang, e.getMessage());
                    translations.put(lang, task.getDescription());
                }
            }

            task.setTranslations(translations);
            Task updatedTask = taskService.updateTask(task);
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            logger.error("Error updating translations for task {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/batch-translate")
    @PreAuthorize("hasRole('SUPERADMIN')")  // Endast superadmin får köra batch-översättningar
    public ResponseEntity<Map<String, Object>> batchTranslateTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer limit) {
        
        try {
            // Hämta uppgifter baserat på filter
            List<Task> tasks;
            if (status != null) {
                tasks = taskService.getTasksByStatus(status, limit);
            } else {
                tasks = limit != null ? 
                    taskService.getAllTasks().stream().limit(limit).toList() : 
                    taskService.getAllTasks();
            }

            int successCount = 0;
            int failureCount = 0;
            List<String> failedTaskIds = new ArrayList<>();

            for (Task task : tasks) {
                try {
                    // Översätt beskrivningen till alla målspråk
                    Map<String, String> translations = new HashMap<>();
                    translations.put("sv", task.getDescription()); // Originalspråk

                    for (String lang : List.of("en", "pl", "uk")) {
                        try {
                            String translatedDesc = translationService.translate(task.getDescription(), lang);
                            translations.put(lang, translatedDesc);
                            logger.debug("Translated task {} to {}", task.getId(), lang);
                        } catch (Exception e) {
                            logger.warn("Failed to translate task {} to {}: {}", 
                                task.getId(), lang, e.getMessage());
                            translations.put(lang, task.getDescription());
                        }
                    }

                    task.setTranslations(translations);
                    taskService.updateTask(task);
                    successCount++;
                    
                    // Kort paus för att undvika API-begränsningar
                    Thread.sleep(100);
                } catch (Exception e) {
                    failureCount++;
                    failedTaskIds.add(task.getId());
                    logger.error("Error processing task {}: {}", task.getId(), e.getMessage());
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("totalProcessed", tasks.size());
            result.put("successCount", successCount);
            result.put("failureCount", failureCount);
            result.put("failedTaskIds", failedTaskIds);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Batch translation failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Batch translation failed: " + e.getMessage()));
        }
    }

    @GetMapping("/translation-stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> getTranslationStats() {
        try {
            List<Task> allTasks = taskService.getAllTasks();
            Map<String, Object> stats = new HashMap<>();
            
            // Grundläggande statistik
            int totalTasks = allTasks.size();
            int tasksWithTranslations = 0;
            Map<String, Integer> translationsByLanguage = new HashMap<>();
            Map<String, Integer> missingTranslations = new HashMap<>();
            
            // Initiera språkräknare
            for (String lang : List.of("en", "pl", "uk")) {
                translationsByLanguage.put(lang, 0);
                missingTranslations.put(lang, 0);
            }
            
            // Analysera varje uppgift
            for (Task task : allTasks) {
                if (task.getTranslations() != null && !task.getTranslations().isEmpty()) {
                    tasksWithTranslations++;
                    
                    // Räkna översättningar per språk
                    for (String lang : List.of("en", "pl", "uk")) {
                        if (task.getTranslations().containsKey(lang) && 
                            !task.getTranslations().get(lang).equals(task.getDescription())) {
                            translationsByLanguage.compute(lang, (k, v) -> v + 1);
                        } else {
                            missingTranslations.compute(lang, (k, v) -> v + 1);
                        }
                    }
                } else {
                    // Räkna saknade översättningar för alla språk
                    for (String lang : List.of("en", "pl", "uk")) {
                        missingTranslations.compute(lang, (k, v) -> v + 1);
                    }
                }
            }
            
            // Sammanställ statistiken
            stats.put("totalTasks", totalTasks);
            stats.put("tasksWithTranslations", tasksWithTranslations);
            stats.put("tasksWithoutTranslations", totalTasks - tasksWithTranslations);
            stats.put("translationsByLanguage", translationsByLanguage);
            stats.put("missingTranslations", missingTranslations);
            stats.put("translationCoverage", totalTasks > 0 ? 
                (double) tasksWithTranslations / totalTasks * 100 : 0);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error generating translation statistics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate translation statistics"));
        }
    }

    @GetMapping("/missing-translations")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> getTasksWithMissingTranslations(
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String status) {
        try {
            List<Task> allTasks = status != null ? 
                taskService.getTasksByStatus(status) : 
                taskService.getAllTasks();
            
            Map<String, List<TaskSummary>> missingTranslations = new HashMap<>();
            
            // Om inget specifikt språk anges, kontrollera alla språk
            List<String> languagesToCheck = language != null ? 
                List.of(language) : List.of("en", "pl", "uk");
            
            for (String lang : languagesToCheck) {
                List<TaskSummary> tasksWithoutTranslation = allTasks.stream()
                    .filter(task -> task.getTranslations() == null || 
                                  !task.getTranslations().containsKey(lang) ||
                                  task.getTranslations().get(lang).equals(task.getDescription()))
                    .map(task -> new TaskSummary(
                        task.getId(),
                        task.getTitle(),
                        task.getStatus(),
                        task.getCreatedAt()))
                    .toList();
                
                missingTranslations.put(lang, tasksWithoutTranslation);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalTasks", allTasks.size());
            response.put("missingTranslations", missingTranslations);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching tasks with missing translations: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch tasks with missing translations"));
        }
    }

    @GetMapping("/translation-priority")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<TaskPriorityDTO>> getTranslationPriorities(
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Integer limit) {
        try {
            List<Task> allTasks = taskService.getAllTasks();
            List<String> languagesToCheck = language != null ? 
                List.of(language) : List.of("en", "pl", "uk");
            
            // Beräkna prioritet för varje uppgift
            List<TaskPriorityDTO> prioritizedTasks = allTasks.stream()
                .filter(task -> needsTranslation(task, languagesToCheck))
                .map(task -> {
                    int priority = calculatePriority(task);
                    return new TaskPriorityDTO(
                        task.getId(),
                        task.getTitle(),
                        task.getStatus(),
                        task.getCreatedAt(),
                        getMissingLanguages(task, languagesToCheck),
                        priority
                    );
                })
                .sorted((a, b) -> b.getPriority() - a.getPriority())
                .limit(limit != null ? limit : Long.MAX_VALUE)
                .toList();
            
            return ResponseEntity.ok(prioritizedTasks);
        } catch (Exception e) {
            logger.error("Error calculating translation priorities: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private boolean needsTranslation(Task task, List<String> languages) {
        return languages.stream().anyMatch(lang -> 
            task.getTranslations() == null || 
            !task.getTranslations().containsKey(lang) ||
            task.getTranslations().get(lang).equals(task.getDescription()));
    }

    private List<String> getMissingLanguages(Task task, List<String> languages) {
        return languages.stream()
            .filter(lang -> 
                task.getTranslations() == null || 
                !task.getTranslations().containsKey(lang) ||
                task.getTranslations().get(lang).equals(task.getDescription()))
            .toList();
    }

    private int calculatePriority(Task task) {
        int priority = 0;
        
        // Högre prioritet för nyare uppgifter
        long daysOld = ChronoUnit.DAYS.between(task.getCreatedAt(), LocalDateTime.now());
        if (daysOld < 7) priority += 30;
        else if (daysOld < 30) priority += 20;
        else if (daysOld < 90) priority += 10;
        
        // Prioritera baserat på status
        switch (task.getStatus().toLowerCase()) {
            case "pending": priority += 40; break;
            case "in_progress": priority += 30; break;
            case "completed": priority += 10; break;
            default: priority += 5;
        }
        
        return priority;
    }

    // Inre klass för att returnera sammanfattning av uppgifter
    @Data
    @AllArgsConstructor
    private static class TaskSummary {
        private String id;
        private String title;
        private String status;
        private LocalDateTime createdAt;
    }

    @Data
    @AllArgsConstructor
    private static class TaskPriorityDTO {
        private String id;
        private String title;
        private String status;
        private LocalDateTime createdAt;
        private List<String> missingTranslations;
        private int priority;
    }
} 