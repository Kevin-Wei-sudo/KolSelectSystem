package com.data.creator.repositories;

import com.data.creator.entities.Influencer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InfluencerRepository extends JpaRepository<Influencer, String> {
}
