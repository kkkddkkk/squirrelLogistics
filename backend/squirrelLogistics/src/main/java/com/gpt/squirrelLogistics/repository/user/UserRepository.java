package com.gpt.squirrelLogistics.repository.user;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.user.User;

public interface UserRepository extends JpaRepository<User, Long> {

}
