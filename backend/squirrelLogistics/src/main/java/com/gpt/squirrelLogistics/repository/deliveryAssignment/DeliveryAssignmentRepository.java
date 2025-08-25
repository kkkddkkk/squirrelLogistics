package com.gpt.squirrelLogistics.repository.deliveryAssignment;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestRequestDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.entity.actualDelivery.ActualDelivery;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.gpt.squirrelLogistics.dto.actualDelivery.ActualDeliveryDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentProposalListDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentSlimResponseDTO;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;
import com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum;

import jakarta.persistence.LockModeType;

public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {

//	List<DeliveryAssignment> findByCompletedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
	List<DeliveryAssignment> findByCompletedAt(LocalDateTime completedAt);

	//일정에 포함된 날짜 찾기
	@Query("SELECT DISTINCT FUNCTION('DATE', d.completedAt) FROM DeliveryAssignment d")
	List<Date> findOnlyCompletedAt();

	//날짜별 출발주소+도착주소 찾기
	@Query("SELECT d.assignedId, r.startAddress, r.endAddress FROM DeliveryAssignment d "
			+ "JOIN d.deliveryRequest r WHERE FUNCTION('DATE', d.completedAt) = :completedAt")
	List<Object[]> findStartEndAddress(@Param("completedAt") String completedAt);
	
	//ID로 출발주소+도착주소 찾기
	@Query("SELECT r.startAddress, r.endAddress FROM DeliveryAssignment d "
			+ "JOIN d.deliveryRequest r WHERE d.assignedId=:assignedId")
	List<Object[]> findStartEndAddressById(@Param("assignedId") Long assignedId);

	
	//ID로 리뷰(id, 평점, 사유) 찾기
	@Query("SELECT r.reviewId, r.rating, r.reason FROM DeliveryAssignment d "
			+ "JOIN Review r ON r.deliveryAssignment = d WHERE d.assignedId = :assignedId")
	List<Object[]> findReviewById(@Param("assignedId") String assignedId);
	
	//ID로 실제운송기록(산간지역, 취급주의, 실제요금)
	@Query("SELECT ad.mountainous, ad.caution, ad.actualFee FROM DeliveryAssignment d "
			+ "JOIN d.actualDelivery ad WHERE d.assignedId = :assignedId")
	List<Object[]> findActualDeliveryById(@Param("assignedId") String assignedId);
	
	//ID로 실제운송기록(ActualDelivery 전체)
	@Query("SELECT ad FROM DeliveryAssignment d "
			+ "JOIN d.actualDelivery ad WHERE d.assignedId = :assignedId")
	ActualDelivery findAllActualDeliveyById(@Param("assignedId") String assignedId);

	//ID로 user(기사이름), vehicleType(차량이름)
	@Query("SELECT us.name, vt.name FROM DeliveryAssignment d " + 
			"JOIN d.deliveryRequest dr "+
			"JOIN dr.vehicleType vt " + 
			"JOIN d.driver dri " +
			"JOIN dri.user us " + 
			"WHERE d.assignedId = :assignedId")
	List<Object[]> findDriverById(@Param("assignedId") String assignedId);
	
	//ID로 requestId 찾기
	@Query("SELECT dr.requestId FROM DeliveryAssignment d JOIN d.deliveryRequest dr WHERE d.assignedId = :assignedId")
	Long findRequestIdById(@Param("assignedId") Long assignedId);
	
	//ID로 1차 paymentId 찾기
	@Query("SELECT p.paymentId "+
			"FROM DeliveryAssignment d "+
			"JOIN d.deliveryRequest dr "+
			"JOIN dr.payment p "+
			"WHERE d.assignedId = :assignedId")
	Long findFirstPaymentIdById(@Param("assignedId") Long assignedId);
	
    //prepaidId로 실제운송 찾기
    @Query("SELECT ad FROM DeliveryAssignment da "+
    		"JOIN da.payment p "+
    		"JOIN da.actualDelivery ad "+
    		"WHERE p.prepaidId =:prepaidId")
    ActualDeliveryDTO findActualDeliveryByPrepaidId(@Param("prepaidId")Long prepaidId);
    
    //paymentId로 deliveryAssignment 찾기
    @Query("SELECT da FROM DeliveryAssignment da " +
    	       "JOIN da.payment p " +
    	       "WHERE p.paymentId = :paymentId")
    	DeliveryAssignment findDeliveryAssignmentById(@Param("paymentId") Long paymentId);
    
	
	
	
    // 작성자: 고은설.
    // 기능: 드라이버 아이디로 모든 기사의 운송 할당 내역을 조회, 이미 예약이 잡힌 일자에 새로운 요청을 수락하는 것을 방지하기 위함.
    @Query("""
                select case when count(a) > 0 then true else false end
                from DeliveryAssignment a
                join a.deliveryRequest r
                where a.driver.driverId = :driverId
                  and a.status in :blockingStatuses
                  and r.wantToStart < :endAt
                  and r.wantToEnd   > :startAt
            """)
    boolean existsOverlappingByRequestWindow(@Param("driverId") Long driverId, @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("blockingStatuses") Collection<com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum> blockingStatuses);

    // 작성자: 고은설.
    // 기능: 환불기간 내 수락되지 않은 지명 제안 매칭 실패 상태로 전환.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
      UPDATE delivery_assignment a
      JOIN delivery_request r ON r.request_id = a.request_id
      JOIN payment p         ON p.payment_id = r.payment_id
      SET a.status = 'CANCELED',
          a.cancelled_at = :now
      WHERE a.status = 'UNKNOWN'
        AND p.refund_date < :now
    """, nativeQuery = true)
    int cancelExpiredProposals(@Param("now") LocalDateTime now);
    
    
    // 작성자: 고은설.
    // 기능: 시스템 시간 기준 오늘 시작되는 운송 할당 배정됨에서 진행중으로 상태 변경을 위함.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
      UPDATE delivery_assignment a
      JOIN delivery_request r ON r.request_id = a.request_id
      SET a.status = 'IN_PROGRESS'
      WHERE a.status = 'ASSIGNED'
        AND r.want_to_start <= :now
        AND r.want_to_end   >= :now
    """, nativeQuery = true)
    int markAssignedToInProgress(@Param("now") LocalDateTime now);

    // 작성자: 고은설.
    // 기능: 동일 기사에게 이미 지명 제안된 요청이 대기(UNKNOWN)상태로 있는지 확인 위함(중복 제안 방지).
    @Query("""
              select case when count(a)>0 then true else false end
              from DeliveryAssignment a
              where a.deliveryRequest.requestId = :requestId
                and a.driver.driverId = :driverId
                and a.status = :status
            """)
    boolean existsByRequestAndDriverAndStatus(@Param("requestId") Long requestId, @Param("driverId") Long driverId,
            @Param("status") com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum status);

    // 작성자: 고은설.
    // 기능: 특정 기사에게 배정된 운송 할당 정보 중 UNKNOWN상태 추출을 위함.
    @Query("""
              select a from DeliveryAssignment a
              where a.deliveryRequest.requestId = :requestId
                and a.driver.driverId = :driverId
                and a.status = :status
            """)
    Optional<DeliveryAssignment> findFirstByRequestAndDriverAndStatus(@Param("requestId") Long requestId,
            @Param("driverId") Long driverId,
            @Param("status") com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum status);

    // 작성자: 고은설.
    // 기능: 지명 제안(UNKNOWN)요청 + 기사 기준, 락 포함.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
              select a from DeliveryAssignment a
              where a.deliveryRequest.requestId = :requestId
                and a.driver.driverId = :driverId
                and a.status = com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.UNKNOWN
            """)
    Optional<DeliveryAssignment> findUnknownForUpdateByRequestAndDriver(@Param("requestId") Long requestId,
            @Param("driverId") Long driverId);

    // 작성자: 고은설.
    // 기능: 요청에 이미 활성(ASSIGNED/IN_PROGRESS) 할당이 있는지 (누가 들고 있나 확인용)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
              select a from DeliveryAssignment a
              where a.deliveryRequest.requestId = :requestId
                and a.status in (
                  com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED,
                  com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS
                )
              order by a.assignedAt desc
            """)
    Optional<DeliveryAssignment> findFirstActiveByRequest(@Param("requestId") Long requestId);
    


    // 작성자: 고은설.
    // 기능: 지명 제안(UNKNOWN) 존재 여부 – (공개 수락 시 차단용)
    @Query("""
                select case when count(a) > 0 then true else false end
                  from DeliveryAssignment a
                 where a.deliveryRequest.requestId = :requestId
                   and a.status = com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.UNKNOWN
            """)
    boolean existsUnknownForRequest(@Param("requestId") Long requestId);

    // 작성자: 고은설.
    // 기능:(지명 수락을 assignmentId로 받을 때) 할당 + 요청을 락 걸어서 로딩
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
                select a
                  from DeliveryAssignment a
                  join fetch a.deliveryRequest r
                 where a.assignedId = :assignmentId
            """)
    Optional<DeliveryAssignment> findByIdForUpdateWithRequest(@Param("assignmentId") Long assignmentId);

    // 작성자: 고은설.
    // 기능: 해당 운송 할당 정보에 대한 활성 상태(UNKNOWN/ASSIGNED/IN_PROGRESS) 감지 위함, 없으면 다시 공개로 전환.
    @Query("""
              select case when count(a)>0 then true else false end
              from DeliveryAssignment a
              where a.deliveryRequest.requestId = :requestId
                and a.status in (
                  com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.UNKNOWN,
                  com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED,
                  com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS
                )
            """)
    boolean existsActiveForRequest(@Param("requestId") Long requestId);

    // 작성자: 고은설.
    // 기능: 운송 할당 레코드 삽입.
    @Modifying
    @Query(value = """
                INSERT INTO delivery_assignment
                    (assigned_at, completed_at, cancelled_at, status, request_id, payment_id, driver_id, actualDelivery_id)
                VALUES
                    (:assignedAt, :completedAt, :cancelledAt, :status, :requestId, :paymentId, :driverId, :actualDeliveryId)
            """, nativeQuery = true)
    int insertDeliveryAssignment(@Param("assignedAt") LocalDateTime assignedAt,
            @Param("completedAt") LocalDateTime completedAt, @Param("cancelledAt") LocalDateTime cancelledAt,
            @Param("status") String status, @Param("requestId") Long requestId, @Param("paymentId") Long paymentId,
            @Param("driverId") Long driverId, @Param("actualDeliveryId") Long actualDeliveryId);

    // 작성자: 고은설.
    // 기능: 최신순 운전자에게 온 모든 운송 할당 정보 조회.
    @Transactional(readOnly = true)
    @Query("""
            select new com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentProposalListDTO(
              a.assignedId,
              r.requestId,
              r.startAddress,
              r.endAddress,
              r.distance,
              r.estimatedFee,
              coalesce(bp.refundDate, ap.refundDate),
              cu.name
            )
            from DeliveryAssignment a
            join a.deliveryRequest r
            left join a.payment ap
            left join r.payment bp
            left join r.company c
            left join c.user cu
            where a.driver.driverId = :driverId
              and a.status = com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.UNKNOWN
            order by a.assignedAt desc
            """)
    List<DeliveryAssignmentProposalListDTO> findAllUnknownByDriver(@Param("driverId") Long driverId);

    // 작성자: 고은설.
    // 기능: 오늘 시작하는 운송 일정 가져오기.
    Optional<DeliveryAssignment>
    findFirstByDriverDriverIdAndStatusAndDeliveryRequest_WantToStartLessThanEqualAndDeliveryRequest_WantToEndGreaterThanEqualOrderByDeliveryRequest_WantToStartAsc(
        Long driverId,
        StatusEnum status,       // IN_PROGRESS 전달
        LocalDateTime now1,      // now
        LocalDateTime now2       // now
    );

	/* ============== 기사 지명 요청 관련 메서드들 ============== */
	
	/**
	 * 🔍 요청 ID로 기사 할당 정보 조회
	 * 
	 * @param requestId 배송 요청 ID
	 * @return 기사 할당 정보 목록
	 */
	@Query("SELECT da FROM DeliveryAssignment da WHERE da.deliveryRequest.requestId = :requestId")
	List<DeliveryAssignment> findByRequestId(@Param("requestId") Long requestId);
	
	/**
	 * 🗑️ 요청과 기사로 할당 정보 삭제 (중복 방지용)
	 * 
	 * @param requestId 배송 요청 ID
	 * @param driverId 기사 ID
	 */
	@Modifying
	@Query("DELETE FROM DeliveryAssignment da WHERE da.deliveryRequest.requestId = :requestId AND da.driver.driverId = :driverId")
	void deleteByRequestAndDriver(@Param("requestId") Long requestId, @Param("driverId") Long driverId);
	
	/**
	 * 📋 기사 지명 요청 목록 조회 (UNKNOWN 상태 - 기존 상태값 활용)
	 * 
	 * @param driverId 기사 ID
	 * @return 기사 지명 요청 목록
	 */
	@Query("SELECT da FROM DeliveryAssignment da WHERE da.driver.driverId = :driverId AND da.status = :status ORDER BY da.assignedAt DESC")
	List<DeliveryAssignment> findProposedRequestsByDriver(@Param("driverId") Long driverId, @Param("status") StatusEnum status);
	
	/**
	 * 🔍 특정 요청의 기사 할당 상태 조회
	 * 
	 * @param requestId 배송 요청 ID
	 * @param status 할당 상태
	 * @return 기사 할당 정보
	 */
	@Query("SELECT da FROM DeliveryAssignment da WHERE da.deliveryRequest.requestId = :requestId AND da.status = :status")
	Optional<DeliveryAssignment> findByRequestIdAndStatus(@Param("requestId") Long requestId, @Param("status") StatusEnum status);
}
