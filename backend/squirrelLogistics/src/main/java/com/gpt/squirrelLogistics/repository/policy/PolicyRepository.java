package com.gpt.squirrelLogistics.repository.policy;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.policy.Policy;

public interface PolicyRepository extends JpaRepository<Policy, Long> {

}
