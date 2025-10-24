package com.data.creator.controllers;

import com.data.creator.dtos.InfluencerDTO;
import com.data.creator.services.InfluencerService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import static com.data.creator.services.InfluencerService.PRESET_PHRASES;

@Slf4j
@RestController
@RequestMapping("/api/influencers")
@RequiredArgsConstructor
@Validated
public class TestController {
    private final InfluencerService influencerService;

    /** 提取并保存达人数据 */
    @PostMapping
    public void saveInfluencers(@RequestBody List<InfluencerDTO> influencers) {
        influencerService.saveInfluencers(influencers);
    }

    /** 获取所有达人数据 */
    @GetMapping
    public List<InfluencerDTO> getAllInfluencers() {
        return influencerService.findAll();
    }

    @GetMapping("/presetPhrases")
    public List<String> getPresetPhrases() {
        return PRESET_PHRASES;
    }

    @GetMapping("/preset")
    public List<InfluencerDTO> searchByPreset(@RequestParam @NotNull(message = "输入不能为空") String phrase) {
        return influencerService.searchByPresetPhrase(phrase);
    }

    /** 统计摘要接口：返回 Map 结构 */
    @GetMapping("/stats")
    public Map<String, Object> getStatsSummary() {
        return influencerService.getStatsSummary();
    }
}
