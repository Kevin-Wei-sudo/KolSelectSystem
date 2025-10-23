package com.data.creator.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.ai.openai.OpenAiEmbeddingOptions;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmbeddingService {
    private final EmbeddingModel embeddingModel;
    public List<Float> generateEmbedding(String message) {
        EmbeddingResponse embeddingResponse = embeddingModel
                .call(new EmbeddingRequest(List.of(message), OpenAiEmbeddingOptions.builder().build()));

        float[] output = embeddingResponse.getResult().getOutput();

        List<Float> result = new ArrayList<>(output.length);
        for (float v : output) {
            result.add(v);
        }
        return result;
    }

}