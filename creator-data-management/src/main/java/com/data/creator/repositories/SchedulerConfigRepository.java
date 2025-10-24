package com.data.creator.repositories;

import com.data.creator.entities.SchedulerConfig;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SchedulerConfigRepository extends CrudRepository<SchedulerConfig, String> {
}
