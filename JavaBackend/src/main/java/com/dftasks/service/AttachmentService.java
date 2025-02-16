package com.dftasks.service;

import com.dftasks.model.Attachment;
import com.dftasks.repository.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.awt.image.Graphics2D;
import java.awt.image.RenderingHints;

@Service
@RequiredArgsConstructor
public class AttachmentService {
    private final AttachmentRepository attachmentRepository;

    @Value("${attachment.max-size:10485760}") // 10MB default
    private long maxFileSize;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    public Attachment saveAttachment(MultipartFile file, String taskId) throws IOException {
        validateFile(file);

        Attachment attachment = Attachment.builder()
                .taskId(taskId)
                .fileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .data(file.getBytes())
                .size(file.getSize())
                .build();

        return attachmentRepository.save(attachment);
    }

    public void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum limit");
        }

        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("File type not allowed");
        }
    }

    public List<Attachment> getAttachmentsByTaskId(String taskId) {
        return attachmentRepository.findByTaskId(taskId);
    }

    public Attachment getAttachment(String id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
    }

    public void deleteAttachment(String id) {
        attachmentRepository.deleteById(id);
    }

    public void deleteAttachmentsByTaskId(String taskId) {
        List<Attachment> attachments = attachmentRepository.findByTaskId(taskId);
        attachmentRepository.deleteAll(attachments);
    }

    public List<Attachment> saveAttachments(List<MultipartFile> files, String taskId) throws IOException {
        List<Attachment> savedAttachments = new ArrayList<>();
        
        for (MultipartFile file : files) {
            validateFile(file);
            byte[] processedData = processFileData(file);
            
            Attachment attachment = Attachment.builder()
                    .taskId(taskId)
                    .fileName(file.getOriginalFilename())
                    .contentType(file.getContentType())
                    .data(processedData)
                    .size(processedData.length)
                    .build();

            savedAttachments.add(attachmentRepository.save(attachment));
        }
        
        return savedAttachments;
    }

    private byte[] processFileData(MultipartFile file) throws IOException {
        if (file.getContentType() != null && file.getContentType().startsWith("image/")) {
            return compressImage(file.getBytes());
        }
        return file.getBytes();
    }

    private byte[] compressImage(byte[] imageData) throws IOException {
        BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(imageData));
        
        // Skala ned bilden om den är för stor
        int maxDimension = 1920; // Full HD
        if (originalImage.getWidth() > maxDimension || originalImage.getHeight() > maxDimension) {
            double scale = Math.min(
                (double) maxDimension / originalImage.getWidth(),
                (double) maxDimension / originalImage.getHeight()
            );
            
            int newWidth = (int) (originalImage.getWidth() * scale);
            int newHeight = (int) (originalImage.getHeight() * scale);
            
            BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, originalImage.getType());
            Graphics2D g = resizedImage.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
            g.dispose();
            
            originalImage = resizedImage;
        }
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(originalImage, "JPEG", outputStream);
        return outputStream.toByteArray();
    }
} 