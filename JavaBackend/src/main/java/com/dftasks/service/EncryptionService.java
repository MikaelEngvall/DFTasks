package com.dftasks.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EncryptionService {
    private static final Logger logger = LoggerFactory.getLogger(EncryptionService.class);
    private static final String ALGORITHM = "AES";
    
    @Value("${encryption.key}")
    private String encryptionKey;
    
    private SecretKeySpec getKeySpec() {
        byte[] key = encryptionKey.getBytes(StandardCharsets.UTF_8);
        return new SecretKeySpec(key, ALGORITHM);
    }
    
    public String encrypt(String data) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, getKeySpec());
            return Base64.getEncoder().encodeToString(
                cipher.doFinal(data.getBytes(StandardCharsets.UTF_8))
            );
        } catch (Exception e) {
            logger.error("Encryption failed: {}", e.getMessage());
            return data;
        }
    }
    
    public String decrypt(String encryptedData) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, getKeySpec());
            return new String(
                cipher.doFinal(Base64.getDecoder().decode(encryptedData)),
                StandardCharsets.UTF_8
            );
        } catch (Exception e) {
            logger.error("Decryption failed: {}", e.getMessage());
            return encryptedData;
        }
    }
} 