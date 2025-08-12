package com.gpt.squirrelLogistics.repository.company;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.company.Company;

public interface CompanyRepository extends JpaRepository<Company, Long> {

}
