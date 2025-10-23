package com.data.creator.services;

import com.data.creator.dtos.InfluencerDTO;
import com.data.creator.entities.Influencer;
import com.data.creator.repositories.InfluencerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InfluencerService {
    private final InfluencerRepository influencerRepository;

    public void saveInfluencers(List<InfluencerDTO> influencers) {
        List<Influencer> newInfluencers = new ArrayList<>();
        for (InfluencerDTO influencer : influencers) {
            Influencer newInfluencer = influencerDTOtoInfluencer(influencer);
            newInfluencers.add(newInfluencer);
        }
        influencerRepository.saveAll(newInfluencers);
    }

    public List<InfluencerDTO> findAll() {
        return influencerRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .map(InfluencerService::influencerToDTO)
                .collect(Collectors.toList());
    }

    private static Influencer influencerDTOtoInfluencer(InfluencerDTO influencerDTO) {
        Influencer influencer = new Influencer();
        influencer.setName(influencerDTO.getName());
        influencer.setAvatar(influencerDTO.getAvatar());
        influencer.setPlatform(influencerDTO.getPlatform());
        influencer.setCategory(influencerDTO.getCategory());
        influencer.setGender(influencerDTO.getGender());
        influencer.setAgeRange(influencerDTO.getAgeRange());
        influencer.setLocation(influencerDTO.getLocation());
        influencer.setFollowersCount(influencerDTO.getFollowersCount());
        influencer.setAvgViews(influencerDTO.getAvgViews());
        influencer.setEngagementRate(influencerDTO.getEngagementRate());
        influencer.setCompletionRate(influencerDTO.getCompletionRate());
        influencer.setPublishFrequency30d(influencerDTO.getPublishFrequency30d());
        influencer.setPublishFrequency90d(influencerDTO.getPublishFrequency90d());
        influencer.setExplosiveContentCount(influencerDTO.getExplosiveContentCount());
        influencer.setFansGrowthTrend(influencerDTO.getFansGrowthTrend());
        influencer.setStyleTags(influencerDTO.getStyleTags());
        influencer.setPersonaStability(influencerDTO.getPersonaStability());
        influencer.setCooperationReputation(influencerDTO.getCooperationReputation());
        influencer.setCommentQuality(influencerDTO.getCommentQuality());
        influencer.setContentInnovation(influencerDTO.getContentInnovation());
        influencer.setPlatformIndex(influencerDTO.getPlatformIndex());
        influencer.setPlatformRecommendationProb(influencerDTO.getPlatformRecommendationProb());
        influencer.setScores(influencerDTO.getScores());
        influencer.setPotentialLevel(influencerDTO.getPotentialLevel());
        influencer.setPredictionReasons(influencerDTO.getPredictionReasons());
        influencer.setPriceRange(influencerDTO.getPriceRange());
        influencer.setPriceMin(influencerDTO.getPriceMin());
        influencer.setPriceMax(influencerDTO.getPriceMax());
        influencer.setVerified(influencerDTO.getVerified());
        influencer.setContact(influencerDTO.getContact());
        influencer.setRecentWorks(influencerDTO.getRecentWorks());
        return influencer;
    }

    private static InfluencerDTO influencerToDTO(Influencer influencer) {
        InfluencerDTO influencerDTO = new InfluencerDTO();
        influencerDTO.setName(influencer.getName());
        influencerDTO.setAvatar(influencer.getAvatar());
        influencerDTO.setPlatform(influencer.getPlatform());
        influencerDTO.setCategory(influencer.getCategory());
        influencerDTO.setGender(influencer.getGender());
        influencerDTO.setAgeRange(influencer.getAgeRange());
        influencerDTO.setLocation(influencer.getLocation());
        influencerDTO.setFollowersCount(influencer.getFollowersCount());
        influencerDTO.setAvgViews(influencer.getAvgViews());
        influencerDTO.setEngagementRate(influencer.getEngagementRate());
        influencerDTO.setCompletionRate(influencer.getCompletionRate());
        influencerDTO.setPublishFrequency30d(influencer.getPublishFrequency30d());
        influencerDTO.setPublishFrequency90d(influencer.getPublishFrequency90d());
        influencerDTO.setExplosiveContentCount(influencer.getExplosiveContentCount());
        influencerDTO.setFansGrowthTrend(influencer.getFansGrowthTrend());
        influencerDTO.setStyleTags(influencer.getStyleTags());
        influencerDTO.setPersonaStability(influencer.getPersonaStability());
        influencerDTO.setCooperationReputation(influencer.getCooperationReputation());
        influencerDTO.setCommentQuality(influencer.getCommentQuality());
        influencerDTO.setContentInnovation(influencer.getContentInnovation());
        influencerDTO.setPlatformIndex(influencer.getPlatformIndex());
        influencerDTO.setPlatformRecommendationProb(influencer.getPlatformRecommendationProb());
        influencerDTO.setScores(influencer.getScores());
        influencerDTO.setPotentialLevel(influencer.getPotentialLevel());
        influencerDTO.setPredictionReasons(influencer.getPredictionReasons());
        influencerDTO.setPriceRange(influencer.getPriceRange());
        influencerDTO.setPriceMin(influencer.getPriceMin());
        influencerDTO.setPriceMax(influencer.getPriceMax());
        influencerDTO.setVerified(influencer.getVerified());
        influencerDTO.setContact(influencer.getContact());
        influencerDTO.setRecentWorks(influencer.getRecentWorks());
        return influencerDTO;
    }

}
