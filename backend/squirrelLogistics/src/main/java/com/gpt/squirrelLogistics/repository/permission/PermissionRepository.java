package com.gpt.squirrelLogistics.repository.permission;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.permission.Permission;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

}
