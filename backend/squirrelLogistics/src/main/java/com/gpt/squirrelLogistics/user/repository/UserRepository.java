package com.gpt.squirrelLogistics.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.user.User;

public interface UserRepository extends JpaRepository<User, Long> {
	  boolean existsByLoginId(String loginId);
	  boolean existsByEmail(String email);
	  Optional<User> findByLoginId(String loginId);
	}