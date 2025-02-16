package com.dftasks.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TranslationService {
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${google.translate.api-key}")
    private String apiKey;
    
    private static final String TRANSLATE_URL = 
            "https://translation.googleapis.com/language/translate/v2?key={apiKey}";

    public String translate(String text, String targetLang) {
        Map<String, Object> body = new HashMap<>();
        body.put("q", text);
        body.put("target", targetLang);
        body.put("format", "text");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<TranslationResponse> response = restTemplate.exchange(
                    TRANSLATE_URL,
                    HttpMethod.POST,
                    entity,
                    TranslationResponse.class,
                    apiKey
            );

            if (response.getBody() != null && 
                response.getBody().getData() != null && 
                !response.getBody().getData().getTranslations().isEmpty()) {
                return response.getBody().getData().getTranslations().get(0).getTranslatedText();
            }
        } catch (Exception e) {
            // Logga felet och returnera originaltexten
            return text;
        }
        return text;
    }

    private static class TranslationResponse {
        private Data data;
        // getters och setters
        public Data getData() { return data; }
        public void setData(Data data) { this.data = data; }
    }

    private static class Data {
        private List<Translation> translations;
        // getters och setters
        public List<Translation> getTranslations() { return translations; }
        public void setTranslations(List<Translation> translations) { 
            this.translations = translations; 
        }
    }

    private static class Translation {
        private String translatedText;
        // getters och setters
        public String getTranslatedText() { return translatedText; }
        public void setTranslatedText(String translatedText) { 
            this.translatedText = translatedText; 
        }
    }
} 