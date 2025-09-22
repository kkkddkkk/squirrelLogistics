package com.gpt.squirrelLogistics.repository.term;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.term.Term;


public interface TermRepository extends JpaRepository<Term, Long> {

    @Query("""
      SELECT t FROM Term t
      LEFT JOIN FETCH t.user u
      WHERE (:q IS NULL OR :q = '' OR
            lower(t.termName)    LIKE lower(concat('%', :q, '%')) OR
            lower(t.termContent) LIKE lower(concat('%', :q, '%')))
    """)
    Page<Term> search(@Param("q") String q, Pageable pageable);
}