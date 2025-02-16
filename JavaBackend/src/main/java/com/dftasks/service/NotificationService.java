package com.dftasks.service;

import com.dftasks.model.Task;
import com.dftasks.model.User;
import com.dftasks.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final JavaMailSender emailSender;
    private final UserRepository userRepository;

    public void notifyAdminsAboutPendingTasks(List<Task> pendingTasks) {
        List<User> admins = userRepository.findByRole("ADMIN");
        
        for (User admin : admins) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(admin.getEmail());
            message.setSubject("Pending Tasks Reminder");
            message.setText(createPendingTasksMessage(pendingTasks));
            emailSender.send(message);
        }
    }

    private String createPendingTasksMessage(List<Task> tasks) {
        StringBuilder message = new StringBuilder();
        message.append("The following tasks have been pending for more than 48 hours:\n\n");
        
        for (Task task : tasks) {
            message.append(String.format(
                "- %s (ID: %s, Created: %s)\n",
                task.getTitle(),
                task.getId(),
                task.getCreatedAt()
            ));
        }
        
        message.append("\nPlease review these tasks as soon as possible.");
        return message.toString();
    }
} 