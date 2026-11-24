package com.heritagehub.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;

@Service
public class JsonDataService {

    private final ObjectMapper objectMapper;

    public JsonDataService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public <T> List<T> readList(String classpathLocation, TypeReference<List<T>> typeRef) {
        ClassPathResource resource = new ClassPathResource(classpathLocation);
        if (!resource.exists()) {
            throw new IllegalStateException("Required JSON data file not found: " + classpathLocation);
        }
        try (InputStream is = resource.getInputStream()) {
            List<T> items = objectMapper.readValue(is, typeRef);
            return items != null ? items : Collections.emptyList();
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to parse JSON data file: " + classpathLocation, ex);
        }
    }

    public String readRawText(String classpathLocation) {
        ClassPathResource resource = new ClassPathResource(classpathLocation);
        if (!resource.exists()) {
            throw new IllegalStateException("Required geospatial file not found: " + classpathLocation);
        }
        try (InputStream is = resource.getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read geospatial resource: " + classpathLocation, ex);
        }
    }
}
