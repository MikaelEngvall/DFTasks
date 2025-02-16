package com.dftasks.repository;

import com.dftasks.model.Attachment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AttachmentRepository extends MongoRepository<Attachment, String> {
    List<Attachment> findByTaskId(String taskId);
} 