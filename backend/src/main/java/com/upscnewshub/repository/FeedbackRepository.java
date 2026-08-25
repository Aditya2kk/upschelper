package com.upscnewshub.repository;

import com.upscnewshub.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {

    List<Feedback> findAllByOrderByCreatedAtDesc();

    List<Feedback> findByTypeOrderByCreatedAtDesc(String type);

    long countByStatus(String status);
}
