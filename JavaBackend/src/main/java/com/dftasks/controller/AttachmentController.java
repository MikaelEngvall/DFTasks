package com.dftasks.controller;

import com.dftasks.model.Attachment;
import com.dftasks.repository.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentController {
    private final AttachmentRepository attachmentRepository;
    private final AttachmentService attachmentService;

    @GetMapping("/task/{taskId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Attachment>> getAttachmentsByTaskId(@PathVariable String taskId) {
        List<Attachment> attachments = attachmentRepository.findByTaskId(taskId);
        // Ta bort binärdata från responsen för att minska datamängden
        attachments.forEach(attachment -> attachment.setData(null));
        return ResponseEntity.ok(attachments);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable String id) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        ByteArrayResource resource = new ByteArrayResource(attachment.getData());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + attachment.getFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAttachment(@PathVariable String id) {
        attachmentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/upload/{taskId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Attachment>> uploadFiles(
            @PathVariable String taskId,
            @RequestParam("files") List<MultipartFile> files) {
        try {
            List<Attachment> attachments = attachmentService.saveAttachments(files, taskId);
            // Ta bort binärdata från responsen
            attachments.forEach(attachment -> attachment.setData(null));
            return ResponseEntity.ok(attachments);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
} 