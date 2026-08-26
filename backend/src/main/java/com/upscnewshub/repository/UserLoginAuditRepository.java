package com.upscnewshub.repository;

import com.upscnewshub.entity.UserLoginAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserLoginAuditRepository extends JpaRepository<UserLoginAudit, Long> {
    List<UserLoginAudit> findTop20ByOrderByLoginTimestampDesc();
}
