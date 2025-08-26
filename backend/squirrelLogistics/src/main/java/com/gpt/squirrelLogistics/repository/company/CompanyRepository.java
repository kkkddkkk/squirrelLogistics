package com.gpt.squirrelLogistics.repository.company;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.company.Company;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;

public interface CompanyRepository extends JpaRepository<Company, Long> {

	//김도경
	//userId로 companyId 찾기
	@Query("SELECT c.companyId FROM Company c "
			+ "JOIN c.user u WHERE u.userId =:userId")
	Long findCompanyIdByUserId(@Param("userId")Long userId);
}
