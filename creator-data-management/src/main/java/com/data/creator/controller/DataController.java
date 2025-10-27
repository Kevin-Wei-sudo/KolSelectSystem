package com.data.creator.controller;

import com.data.creator.dto.ApiResponse;
import com.data.creator.services.DataImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/data")
@RequiredArgsConstructor
public class DataController {

    private final DataImportService dataImportService;
    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> stats() {
        dataImportService.importFile();
        return ApiResponse.ok(null);
    }

    @PostMapping("/reset-demo")
    @Transactional
    public ApiResponse<Map<String, Object>> resetDemo() {
        return ApiResponse.ok(null);
    }

    @GetMapping("/test-db")
    public ApiResponse<Map<String, Object>> testDatabase() {
        return ApiResponse.ok(null);
    }
}
