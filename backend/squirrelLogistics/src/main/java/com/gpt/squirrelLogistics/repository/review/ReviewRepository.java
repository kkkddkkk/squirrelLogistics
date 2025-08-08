package com.gpt.squirrelLogistics.repository.review;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.review.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

}
