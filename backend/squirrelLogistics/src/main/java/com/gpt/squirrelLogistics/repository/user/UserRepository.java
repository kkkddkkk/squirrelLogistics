package com.gpt.squirrelLogistics.repository.user;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
	boolean existsByLoginId(String loginId);

	boolean existsByEmail(String email);

	Optional<User> findByLoginId(String loginId);

	Optional<User> findByEmail(String email);

	@Query("SELECT u FROM User u WHERE u.role = :role")
	List<User> findAllByRole(@Param("role") UserRoleEnum role);

	/**
	 * 특정 역할을 가진 사용자 수 조회
	 * 기사 통계 정보 조회에 사용
	 */
	@Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
	long countByRole(@Param("role") UserRoleEnum role);
	
	@Query("SELECT COUNT(u) FROM User u")
	long totalUsers();

	@Query("SELECT COUNT(u) FROM User u WHERE u.regDate >= :start AND u.regDate < :end")
	long countNewUsersBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

	@Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
	List<Object[]> countGroupByRole();

	@Query(value = """
	    SELECT DATE(reg_date) AS d, COUNT(*) AS c
	    FROM user
	    WHERE reg_date >= :start AND reg_date < :end
	    GROUP BY DATE(reg_date)
	    ORDER BY d
	    """, nativeQuery = true)
	List<Object[]> dailySignups(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

	@Query(value = """
	    SELECT COUNT(*) FROM user
	    WHERE last_login >= :start AND last_login < :end
	    """, nativeQuery = true)
	long countActiveBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
