package com.gpt.squirrelLogistics.repository.company;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.company.Company;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    /**
     * userId로 Company 정보 조회
     * @param userId 사용자 ID
     * @return Company 정보 (Optional)
     */
    @Query("SELECT c FROM Company c JOIN c.user u WHERE u.userId = :userId")
    Optional<Company> findByUserId(@Param("userId") Long userId);
}
