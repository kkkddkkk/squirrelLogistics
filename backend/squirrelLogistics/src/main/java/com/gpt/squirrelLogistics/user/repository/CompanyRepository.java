package com.gpt.squirrelLogistics.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.user.Company;

public interface CompanyRepository extends JpaRepository<Company, Long> {}
