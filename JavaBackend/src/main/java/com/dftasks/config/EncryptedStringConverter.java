package com.dftasks.config;

import com.dftasks.service.EncryptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.stereotype.Component;

@Component
public class EncryptedStringConverter {
    private final EncryptionService encryptionService;

    public EncryptedStringConverter(EncryptionService encryptionService) {
        this.encryptionService = encryptionService;
    }

    @WritingConverter
    public class StringToEncryptedStringConverter implements Converter<String, String> {
        @Override
        public String convert(String source) {
            return source != null ? encryptionService.encrypt(source) : null;
        }
    }

    @ReadingConverter
    public class EncryptedStringToStringConverter implements Converter<String, String> {
        @Override
        public String convert(String source) {
            return source != null ? encryptionService.decrypt(source) : null;
        }
    }
} 