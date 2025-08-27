package com.gpt.squirrelLogistics.repository.user;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;

public interface UserRepository extends JpaRepository<User, Long> {
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
}
