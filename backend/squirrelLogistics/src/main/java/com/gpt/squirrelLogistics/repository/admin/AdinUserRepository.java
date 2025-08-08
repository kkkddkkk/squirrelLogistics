package com.gpt.squirrelLogistics.repository.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.admin.AdminUser;

public interface AdinUserRepository extends JpaRepository<AdminUser, Long> {

}
