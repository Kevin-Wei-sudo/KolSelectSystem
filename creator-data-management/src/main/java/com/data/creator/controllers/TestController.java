package com.data.creator.controllers;

import com.data.creator.dtos.InfluencerDTO;
import com.data.creator.services.InfluencerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/influencers")
@RequiredArgsConstructor
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

}
