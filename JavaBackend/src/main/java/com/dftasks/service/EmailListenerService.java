package com.dftasks.service;

import com.dftasks.model.Task;
import com.dftasks.repository.TaskRepository;
import com.dftasks.model.Attachment;
import com.dftasks.repository.AttachmentRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sun.mail.imap.IMAPStore;
import jakarta.mail.*;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.search.FlagTerm;

import java.time.LocalDateTime;
import java.util.Properties;
import java.io.InputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.mail.FolderClosedException;
import jakarta.mail.StoreClosedException;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailListenerService {
    private static final Logger logger = LoggerFactory.getLogger(EmailListenerService.class);
    private final TaskRepository taskRepository;
    private final AttachmentRepository attachmentRepository;
    private final TranslationService translationService;
    private static final List<String> TARGET_LANGUAGES = List.of("en", "pl", "uk");
    private volatile boolean isRunning = true;

    @Value("${email.host}")
    private String host;

    @Value("${email.port}")
    private int port;

    @Value("${email.username}")
    private String username;

    @Value("${email.password}")
    private String password;

    @PostConstruct
    public void startListening() {
        Thread emailThread = new Thread(this::listenForEmails);
        emailThread.setDaemon(true);
        emailThread.setName("email-listener");
        emailThread.start();
        logger.info("Email listener started successfully");
    }

    private void listenForEmails() {
        while (isRunning) {
            Store store = null;
            Folder inbox = null;
            try {
                Properties props = createMailProperties();
                Session session = Session.getInstance(props);
                store = session.getStore("imaps");
                store.connect(host, username, password);
                
                inbox = store.getFolder("INBOX");
                inbox.open(Folder.READ_WRITE);
                
                Message[] messages = inbox.search(new FlagTerm(new Flags(Flags.Flag.SEEN), false));
                logger.info("Found {} unread messages", messages.length);

                for (Message message : messages) {
                    try {
                        processEmail(message);
                        message.setFlag(Flags.Flag.SEEN, true);
                        logger.debug("Processed message: {}", message.getSubject());
                    } catch (Exception e) {
                        logger.error("Error processing message: {}", message.getSubject(), e);
                    }
                }

                Thread.sleep(30000); // 30 sekunder mellan kontroller
            } catch (FolderClosedException | StoreClosedException e) {
                logger.warn("Connection lost, will retry: {}", e.getMessage());
                sleep(5000); // Kort väntan vid anslutningsfel
            } catch (Exception e) {
                logger.error("Unexpected error in email listener", e);
                sleep(60000); // Längre väntan vid andra fel
            } finally {
                closeQuietly(inbox, store);
            }
        }
    }

    private Properties createMailProperties() {
        Properties props = new Properties();
        props.setProperty("mail.store.protocol", "imaps");
        props.setProperty("mail.imaps.host", host);
        props.setProperty("mail.imaps.port", String.valueOf(port));
        props.setProperty("mail.imaps.ssl.enable", "true");
        props.setProperty("mail.imaps.timeout", "10000");
        props.setProperty("mail.imaps.connectiontimeout", "10000");
        return props;
    }

    private void closeQuietly(Folder folder, Store store) {
        try {
            if (folder != null && folder.isOpen()) {
                folder.close(false);
            }
        } catch (Exception e) {
            logger.warn("Error closing folder", e);
        }
        
        try {
            if (store != null && store.isConnected()) {
                store.close();
            }
        } catch (Exception e) {
            logger.warn("Error closing store", e);
        }
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            isRunning = false;
        }
    }

    private void processEmail(Message message) throws Exception {
        String content = getTextFromMessage(message);
        String subject = message.getSubject();
        String from = message.getFrom()[0].toString();

        // Översätt innehåll till alla målspråk
        Map<String, String> translations = new HashMap<>();
        translations.put("sv", content); // Originalspråk (svenska)
        
        for (String lang : TARGET_LANGUAGES) {
            try {
                String translatedContent = translationService.translate(content, lang);
                translations.put(lang, translatedContent);
                logger.debug("Translated content to {}", lang);
            } catch (Exception e) {
                logger.warn("Failed to translate content to {}: {}", lang, e.getMessage());
                translations.put(lang, content); // Använd originaltext vid fel
            }
        }

        Task task = Task.builder()
                .title(subject != null ? subject : "Ny felanmälan")
                .description(content)
                .translations(translations)
                .status("pending")
                .createdAt(LocalDateTime.now())
                .reporterEmail(from)
                .build();

        Task savedTask = taskRepository.save(task);
        
        // Hantera bilagor om meddelandet är multipart
        if (message.isMimeType("multipart/*")) {
            Multipart multipart = (Multipart) message.getContent();
            processAttachments(multipart, savedTask.getId());
        }
    }

    private void processAttachments(Multipart multipart, String taskId) throws Exception {
        for (int i = 0; i < multipart.getCount(); i++) {
            BodyPart bodyPart = multipart.getBodyPart(i);
            if (!Part.ATTACHMENT.equalsIgnoreCase(bodyPart.getDisposition())) {
                continue;
            }

            String fileName = bodyPart.getFileName();
            InputStream is = bodyPart.getInputStream();
            byte[] attachmentData = is.readAllBytes();

            Attachment attachment = Attachment.builder()
                    .taskId(taskId)
                    .fileName(fileName)
                    .contentType(bodyPart.getContentType())
                    .data(attachmentData)
                    .size(attachmentData.length)
                    .build();

            attachmentRepository.save(attachment);
        }
    }

    private String getTextFromMessage(Message message) throws Exception {
        if (message.isMimeType("text/plain")) {
            return message.getContent().toString();
        } else if (message.isMimeType("multipart/*")) {
            MimeMultipart mimeMultipart = (MimeMultipart) message.getContent();
            return getTextFromMimeMultipart(mimeMultipart);
        }
        return "";
    }

    private String getTextFromMimeMultipart(MimeMultipart mimeMultipart) throws Exception {
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < mimeMultipart.getCount(); i++) {
            BodyPart bodyPart = mimeMultipart.getBodyPart(i);
            if (bodyPart.isMimeType("text/plain")) {
                result.append(bodyPart.getContent());
            } else if (bodyPart.isMimeType("multipart/*")) {
                result.append(getTextFromMimeMultipart((MimeMultipart) bodyPart.getContent()));
            }
        }
        return result.toString();
    }
} 