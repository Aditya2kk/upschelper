package com.upscnewshub.repository;

import com.upscnewshub.entity.TelegramChannelSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TelegramChannelRepository extends JpaRepository<TelegramChannelSource, Long> {
    List<TelegramChannelSource> findByActiveTrue();
    boolean existsByUsername(String username);
}
