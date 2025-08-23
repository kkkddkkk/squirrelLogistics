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
	
	@Query("SELECT u FROM User u WHERE u.role = :role")
	List<User> findAllByRole(@Param("role") UserRoleEnum role);
}
