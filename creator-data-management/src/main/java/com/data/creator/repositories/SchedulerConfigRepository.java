package com.data.creator.repositories;

import com.data.creator.entities.SchedulerConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SchedulerConfigRepository extends JpaRepository<SchedulerConfig, String> {
}
