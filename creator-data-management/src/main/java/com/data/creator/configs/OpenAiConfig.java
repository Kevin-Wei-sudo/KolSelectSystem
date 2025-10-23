package com.data.creator.configs;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAiConfig {

    @Bean
    public ChatClient chatClient(OpenAiChatModel chatModel) {
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .build();
        return ChatClient.builder(chatModel)
                .defaultOptions(options)
                .build();
    }

}
