package com.gpt.squirrelLogistics.repository.review;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.dto.review.DriverReviewCardResponseDTO;
import com.gpt.squirrelLogistics.entity.review.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {
	Optional<Review> findAllByDeliveryAssignment_AssignedId(long assignedId);

//	@Query("SELECT r.rating, r.rReason, r.regDate FROM Review r "
//			+ "WHERE r.reviewId = : reviewId")
//	List<Object[]> findReviewContent(@Param("reviewId") Long reviewId);

    // 기사 검색을 위한 메서드 추가
    // 드라이버 ID로 리뷰 조회 (DeliveryAssignment를 통해)
    @Query("SELECT r FROM Review r " +
           "JOIN r.deliveryAssignment da " +
           "JOIN da.driver d " +
           "WHERE d.driverId = :driverId")
    List<Review> findByDriverId(@Param("driverId") Long driverId);
    
    //companyId로 리뷰 조회
    @Query("SELECT r FROM Review r "+
			"JOIN r.deliveryAssignment da "+
			"JOIN da.deliveryRequest dr "+
			"JOIN dr.company c "+
			"WHERE c.companyId = :companyId ")
	List<Review> findByCompanyId(@Param("companyId") Long companyId);
	
	//작성자: 고은설.
	//기능: 특정 아이디의 드라이버가 수행한 모든 운송 할당건에 대한 리뷰 추
	@Query("""
		    select new com.gpt.squirrelLogistics.dto.review.DriverReviewCardResponseDTO(
		        r.reviewId,
		        r.rating,
		        r.reason,
		        r.regDate,
		        r.modiDate,
		        r.stateEnum,
		        da.assignedId,
		        d.driverId,
		        c.companyId
		    )
		    from Review r
		        join r.deliveryAssignment da
		        join da.driver d
		        join da.deliveryRequest dr
		        join dr.company c
		    where d.driverId = :driverId
		      and r.stateEnum = com.gpt.squirrelLogistics.enums.review.StateEnum.SUBMITTED
		    order by r.regDate desc
		    """)
		Page<DriverReviewCardResponseDTO> findAllSubmittedByDriverId(
		    @Param("driverId") Long driverId,
		    Pageable pageable
		);

}
