package com.gpt.squirrelLogistics.repository.company;

import java.util.Optional;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.company.Company;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    /**
     * userId로 Company 정보 조회
     * @param userId 사용자 ID
     * @return Company 정보 (Optional)
     */
    @Query("SELECT c FROM Company c JOIN c.user u WHERE u.userId = :userId")
    Optional<Company> findByUserId(@Param("userId") Long userId);
	//김도경
	//userId로 companyId 찾기
	@Query("SELECT c.companyId FROM Company c "
			+ "JOIN c.user u WHERE u.userId =:userId")
	Long findCompanyIdByUserId(@Param("userId")Long userId);
	
	//companyId로 userName 조회
	//작성자: 김도경
	@Query("SELECT c.user.name FROM Company c WHERE c.companyId =:companyId")
	String findUserNameByCompanyId(@Param("companyId") Long companyId);
	
	//companyId로 userName 조회
	//작성자: 김도경
	@Query("SELECT c.user.Pnumber FROM Company c WHERE c.companyId =:companyId")
	String findUserNumByCompanyId(@Param("companyId") Long companyId);
}
