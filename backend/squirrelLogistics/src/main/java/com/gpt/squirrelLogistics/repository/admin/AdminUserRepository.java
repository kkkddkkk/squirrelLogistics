package com.gpt.squirrelLogistics.repository.admin;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.admin.AdminUser;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

	// 작성자: 고은설.
	// 기능: 유저 아이디로 어드민 아이디 추출.
	@Query(value = "SELECT admin_id FROM admin_user WHERE user_id = :userId LIMIT 1", nativeQuery = true)
	Optional<Long> findAdminIdByUserId(@Param("userId") Long userId);

	// 작성자: 고은설.
	// 기능: 어드민 아이디를 통해 유저 엔티티상 이름 조회.
	@Query("select u.name from AdminUser au join au.user u where au.adminId = :adminId")
	Optional<String> findUserNameByAdminId(@Param("adminId") Long adminId);
}
