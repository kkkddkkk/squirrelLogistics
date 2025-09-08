package com.gpt.squirrelLogistics.repository.deliveryAssignment;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DriverDeliveryHistoryDTO;
import com.gpt.squirrelLogistics.dto.deliveryCompleted.DeliveryCompletedCardDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryStatusLog.DeliveryStatusLogSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.entity.actualDelivery.ActualDelivery;
import com.gpt.squirrelLogistics.dto.deliveryTracking.DeliveryAssignmentTrackingHeaderDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.driverSchedule.DriverScheduleDTO;
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
import jakarta.persistence.QueryHint;

public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {

//	List<DeliveryAssignment> findByCompletedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
	List<DeliveryAssignment> findByCompletedAt(LocalDateTime completedAt);

	// 달력에 기록할 일정리스트 추가
	@Query(value = "SELECT DISTINCT DATE(dr.want_to_start) AS want_to_start " + "FROM delivery_assignment da "
			+ "JOIN delivery_request dr ON da.request_id = dr.request_id "
			+ "JOIN company c ON dr.company_id = c.company_id " + "WHERE c.company_id = :companyId", nativeQuery = true)
	List<Object[]> findDateListByCompanyId(@Param("companyId") Long companyId);

	// 일정에 포함된 날짜 찾기
	@Query("SELECT DISTINCT FUNCTION('DATE', d.completedAt) FROM DeliveryAssignment d")
	List<Date> findOnlyCompletedAt();

	// 날짜별 출발주소+도착주소+상태 찾기
	@Query("SELECT d.assignedId, r.startAddress, r.endAddress, d.status, p.payStatus FROM DeliveryAssignment d "
			+ "JOIN d.deliveryRequest r " + "LEFT JOIN d.payment p " + "JOIN r.company c "
			+ "WHERE FUNCTION('DATE', r.wantToStart) = :wantToStart " + "AND c.companyId = :companyId")
	List<Object[]> findListHeader(@Param("wantToStart") LocalDate wantToStart, @Param("companyId") Long companyId);

	// ID로 상태찾기
	@Query("SELECT d.status FROM DeliveryAssignment d " + "WHERE d.assignedId=:assignedId")
	List<String> findStatusById(@Param("assignedId") Long assignedId);

	// ID로 estimatedFee(예상금액) 찾기
	@Query("SELECT r.estimatedFee FROM DeliveryAssignment d "
			+ "JOIN d.deliveryRequest r WHERE d.assignedId=:assignedId")
	Long findEstimatedFeeById(@Param("assignedId") Long assignedId);

	// 날짜별 출발주소+도착주소 찾기
	@Query("SELECT d.assignedId, r.startAddress, r.endAddress FROM DeliveryAssignment d "
			+ "JOIN d.deliveryRequest r WHERE FUNCTION('DATE', d.completedAt) = :completedAt")
	List<Object[]> findStartEndAddress(@Param("completedAt") String completedAt);

	// ID로 출발주소+도착주소 찾기
	@Query("SELECT r.startAddress, r.endAddress FROM DeliveryAssignment d "
			+ "JOIN d.deliveryRequest r WHERE d.assignedId=:assignedId")
	List<Object[]> findStartEndAddressById(@Param("assignedId") Long assignedId);

	// ID로 출발날짜 찾기
	@Query("SELECT r.wantToStart FROM DeliveryAssignment d "
			+ "JOIN d.deliveryRequest r WHERE d.assignedId=:assignedId")
	LocalDateTime findStartDateById(@Param("assignedId") Long assignedId);

	// ID로 리뷰(id, 평점, 사유) 찾기
	@Query("SELECT r.reviewId, r.rating, r.reason FROM DeliveryAssignment d "
			+ "JOIN Review r ON r.deliveryAssignment = d WHERE d.assignedId = :assignedId")
	List<Object[]> findReviewById(@Param("assignedId") Long assignedId);

	// ID로 실제운송기록(산간지역, 취급주의, 실제요금)
	@Query("SELECT ad.mountainous, ad.caution, ad.actualFee FROM DeliveryAssignment d "
			+ "JOIN d.actualDelivery ad WHERE d.assignedId = :assignedId")
	List<Object[]> findActualDeliveryById(@Param("assignedId") Long assignedId);

	// ID로 실제운송기록(ActualDelivery 전체)
	@Query("SELECT ad FROM DeliveryAssignment d " + "JOIN d.actualDelivery ad WHERE d.assignedId = :assignedId")
	ActualDelivery findAllActualDeliveyById(@Param("assignedId") String assignedId);

	// ID로 user(기사이름), vehicleType(차량이름)
	@Query("SELECT us.name, vt.name, dri.profileImageUrl FROM DeliveryAssignment d " + "JOIN d.deliveryRequest dr "
			+ "JOIN dr.vehicleType vt " + "JOIN d.driver dri " + "JOIN dri.user us "
			+ "WHERE d.assignedId = :assignedId")
	List<Object[]> findDriverById(@Param("assignedId") Long assignedId);

	// ID로 userId(Company) 찾기
	@Query("SELECT us.userId FROM DeliveryAssignment d " + "JOIN d.deliveryRequest dr " + "JOIN dr.company c "
			+ "JOIN c.user us " + "WHERE d.assignedId = :assignedId")
	Long findUserById(@Param("assignedId") Long assignedId);

	// ID로 requestId 찾기
	@Query("SELECT dr.requestId FROM DeliveryAssignment d JOIN d.deliveryRequest dr WHERE d.assignedId = :assignedId")
	Long findRequestIdById(@Param("assignedId") Long assignedId);

	// ID로 1차 paymentId 찾기
	@Query("SELECT p.paymentId " + "FROM DeliveryAssignment d " + "JOIN d.deliveryRequest dr " + "JOIN dr.payment p "
			+ "WHERE d.assignedId = :assignedId")
	Long findFirstPaymentIdById(@Param("assignedId") Long assignedId);

	// ID로 2차 paymentId 찾기
	@Query("SELECT p.paymentId " + "FROM DeliveryAssignment d " + "JOIN d.payment p "
			+ "WHERE d.assignedId = :assignedId")
	Long findSecondPaymentIdById(@Param("assignedId") Long assignedId);

	// prepaidId로 실제운송 찾기
	@Query("SELECT ad FROM DeliveryAssignment da " + "JOIN da.payment p " + "JOIN da.actualDelivery ad "
			+ "WHERE p.prepaidId =:prepaidId")
	ActualDeliveryDTO findActualDeliveryByPrepaidId(@Param("prepaidId") Long prepaidId);

	// paymentId로 deliveryAssignment 찾기
	@Query("SELECT da FROM DeliveryAssignment da " + "JOIN da.payment p " + "WHERE p.paymentId = :paymentId")
	DeliveryAssignment findDeliveryAssignmentByPaymentId(@Param("paymentId") Long paymentId);

	// paymentID로 deliveryAssignmentId 찾기
	@Query("SELECT da.assignedId FROM DeliveryAssignment da " + "JOIN da.payment p " + "WHERE p.paymentId = :paymentId")
	Long findIdByPaymentId(@Param("paymentId") Long paymentId);

	// 작성자: 고은설.
	// 기능: 드라이버 아이디로 모든 기사의 운송 할당 내역을 조회, 이미 예약이 잡힌 일자에 새로운 요청을 수락하는 것을 방지하기 위함.
	@Query("""
			    select case when count(a) > 0 then true else false end
			    from DeliveryAssignment a
			    join a.deliveryRequest r
			    where a.driver.driverId = :driverId
			      and a.status in :blockingStatuses
			      and date(r.wantToStart) = date(:startAt)
			""")
	boolean existsOverlappingByRequestDay(@Param("driverId") Long driverId, @Param("startAt") LocalDateTime startAt,
			@Param("blockingStatuses") Collection<com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum> blockingStatuses);

	// 작성자: 고은설.
	// 기능: 기존 WANT TO END기준 판정 호직 WANT TO START +24로 변경.
	@Query("""
			  select (count(a) > 0)
			  from DeliveryAssignment a
			  join a.deliveryRequest r
			  where a.driver.driverId = :driverId
			    and a.status in :blockingStatuses
			    and r.wantToStart < :candidateEnd      
			    and r.wantToStart > :candidateStartMinus24h 
			""")
	boolean existsOverlapping24h(@Param("driverId") Long driverId, @Param("candidateEnd") LocalDateTime candidateEnd, // =
																														// candidateStart.plusHours(24)
			@Param("candidateStartMinus24h") LocalDateTime candidateStartMinus24h, // = candidateStart.minusHours(24)
			@Param("blockingStatuses") Collection<com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum> blockingStatuses);
	// 작성자: 고은설.
	// 기능: 환불기간 내 수락되지 않은 지명 제안 매칭 실패 상태로 전환.
//	@Modifying(clearAutomatically = true, flushAutomatically = true)
//	@Query(value = """
//			  UPDATE delivery_assignment a
//			  JOIN delivery_request r ON r.request_id = a.request_id
//			  JOIN payment p         ON p.payment_id = r.payment_id
//			  SET a.status = 'CANCELED',
//			      a.cancelled_at = :now
//			  WHERE a.status = 'UNKNOWN'
//			    AND p.refund_date < :now
//			""", nativeQuery = true)
//	int cancelExpiredProposals(@Param("now") LocalDateTime now);

	// 작성자: 고은설.
	// 기능: 시작 시간 기준으로 특정 시간까지 수락되지 않은 지명 제안 매칭 실패 상태로 전환.
	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query(value = """
			  UPDATE delivery_assignment a
			  JOIN delivery_request r ON r.request_id = a.request_id
			  SET a.status = 'CANCELED',
			      a.cancelled_at = :now
			  WHERE a.status = 'UNKNOWN'
			    AND r.status = 'PROPOSED'
			    AND r.want_to_start IS NOT NULL
			    AND r.want_to_start <= :proposalDeadline
			""", nativeQuery = true)
	int cancelExpiredProposalsByStart(@Param("now") LocalDateTime now,
			@Param("proposalDeadline") LocalDateTime proposalDeadline);

	// 작성자: 고은설.
	// 기능: 시스템 시간 기준 오늘 시작되는 운송 할당 배정됨에서 진행중으로 상태 변경을 위함.
	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query(value = """
			  UPDATE delivery_assignment a
			  JOIN delivery_request r ON r.request_id = a.request_id
			  SET a.status = 'IN_PROGRESS'
			  WHERE a.status = 'ASSIGNED'
			    AND r.want_to_start <= :now
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
	// 기능: 특정 운송 요청의 수락전 만료 처리.
	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query(value = """
			  UPDATE delivery_assignment a
			  JOIN delivery_request r ON r.request_id = a.request_id
			  SET a.status = 'CANCELED',
			      a.cancelled_at = :now
			  WHERE a.status = 'UNKNOWN'
			    AND r.status = 'PROPOSED'
			    AND r.request_id = :requestId
			    AND r.want_to_start IS NOT NULL
			    AND r.want_to_start <= :proposalDeadline
			""", nativeQuery = true)
	int cancelExpiredProposalsByStartForRequest(@Param("now") LocalDateTime now,
			@Param("proposalDeadline") LocalDateTime proposalDeadline, @Param("requestId") Long requestId);

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
	Optional<DeliveryAssignment> findFirstByDriverDriverIdAndStatusAndDeliveryRequest_WantToStartLessThanEqualAndDeliveryRequest_WantToEndGreaterThanEqualOrderByDeliveryRequest_WantToStartAsc(
			Long driverId, StatusEnum status, // IN_PROGRESS 전달
			LocalDateTime now1, // now
			LocalDateTime now2 // now
	);

	// 작성자: 고은설.
	// 기능: 운전자 현 배송 상태 화면 제작에 필요한 부분만 발췌.
//	@Query("""
//			  select new com.gpt.squirrelLogistics.dto.deliveryTracking.DeliveryAssignmentTrackingHeaderDTO(
//			    da.assignedId,
//			    dr.requestId,
//			    dr.startAddress,
//			    dr.memoToDriver,
//			    dr.wantToStart,
//			    dr.wantToEnd
//			  )
//			  from DeliveryAssignment da
//			  join da.deliveryRequest dr
//			  where da.driver.driverId = :driverId
//			    and da.status = com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS
//			  order by dr.wantToStart asc
//			""")
//	List<DeliveryAssignmentTrackingHeaderDTO> findCurrentTrackingHead(@Param("driverId") Long driverId,
//			@Param("now") java.time.LocalDateTime now, // 사용 안 해도 시그니처 유지 가능
//			org.springframework.data.domain.Pageable pageable);

	@Query("""
			  select new com.gpt.squirrelLogistics.dto.deliveryTracking.DeliveryAssignmentTrackingHeaderDTO(
			    da.assignedId,
			    dr.requestId,
			    dr.startAddress,
			    dr.memoToDriver,
			    dr.wantToStart,
			    dr.wantToEnd
			  )
			  from DeliveryAssignment da
			  join da.deliveryRequest dr
			  where da.driver.driverId = :driverId
			    and (
			         da.status = com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS
			         or (da.status = com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED
			             and dr.wantToStart <= :now)
			        )
			  order by
			    case when da.status = com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS then 0 else 1 end,
			    dr.wantToStart asc,
			    da.assignedAt desc
			""")
	List<DeliveryAssignmentTrackingHeaderDTO> findCurrentOrDueHead(@Param("driverId") Long driverId,
			@Param("now") LocalDateTime now, org.springframework.data.domain.Pageable pageable);

	// 작성자: 고은설.
	// 기능: IN_PROGRESS 상태로 전환까지 된 assign데이터 중 종료 일이 지나도록 완료처리 안된 미완수건 검수.
//	@Query("""
//			    select a
//			    from DeliveryAssignment a
//			    join a.deliveryRequest r
//			    where (a.status = com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS
//			           or a.status = com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED)
//			      and r.wantToEnd is not null
//			      and r.wantToEnd < :threshold
//			""")
//	List<DeliveryAssignment> findInProgressOrAssignedPastEnd(@Param("threshold") LocalDateTime threshold);

	// 작성자: 고은설
	// 기능 : IN_PROGRESS 상태로 전환까지 된 assign데이터 중 want to start 기준 12시간이 지나도록 아무 행동을
	// 취하지 않은 건 검수.
	@Query("""
			    SELECT a
			    FROM DeliveryAssignment a
			    JOIN a.deliveryRequest r
			    WHERE a.status = com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS
			      AND r.wantToStart < :threshold
			      AND NOT EXISTS (
			          SELECT 1 FROM DeliveryStatusLog l
			          WHERE l.deliveryAssignment = a
			            AND l.status IN (
			      com.gpt.squirrelLogistics.enums.deliveryStatus.DeliveryStatusEnum.MOVING_TO_PICKUP,
			       com.gpt.squirrelLogistics.enums.deliveryStatus.DeliveryStatusEnum.PICKUP_COMPLETED,
			       com.gpt.squirrelLogistics.enums.deliveryStatus.DeliveryStatusEnum.MOVING_TO_WAYPOINT,
			       com.gpt.squirrelLogistics.enums.deliveryStatus.DeliveryStatusEnum.ARRIVED_AT_WAYPOINT,
			       com.gpt.squirrelLogistics.enums.deliveryStatus.DeliveryStatusEnum.DROPPED_AT_WAYPOINT,
			       com.gpt.squirrelLogistics.enums.deliveryStatus.DeliveryStatusEnum.COMPLETED
			            )
			      )
			""")
	List<DeliveryAssignment> findInProgressNotStartedBefore(@Param("threshold") LocalDateTime threshold);

	// 작성자: 고은설.
	// 기능: 특정 기사에게 할당된 해당 연·월 운송 일정(하루 1건: assignedAt 최솟값만) 조회
	@Query("""
			  select new com.gpt.squirrelLogistics.dto.driverSchedule.DriverScheduleDTO(
			    a.assignedId,
			    r.requestId,
			    case when a.status = com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.COMPLETED then true else false end,
			    case when a.status = com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.FAILED    then true else false end,
			    r.wantToStart,
			    r.wantToEnd
			  )
			  from DeliveryAssignment a
			  join a.deliveryRequest r
			  where a.driver.driverId = :driverId
			    and r.wantToStart >= :monthStart
			    and r.wantToStart <  :monthEnd
			    and a.status in (
			      com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED,
			      com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS,
			      com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.COMPLETED,
			      com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.FAILED
			    )
			  order by r.wantToStart asc, a.assignedAt asc
			""")
	List<DriverScheduleDTO> findMonthlyScheduleForDriver(@Param("driverId") Long driverId,
			@Param("monthStart") LocalDateTime monthStart, @Param("monthEnd") LocalDateTime monthEnd);

	// 작성자: 고은설.
	// 기능: 할당 운송 완료 처리시 락 필요.
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@QueryHints({ @QueryHint(name = "jakarta.persistence.lock.timeout", value = "5000") // ms, 타임아웃 선택
	})
	@Query("""
			select a
			from DeliveryAssignment a
			where a.assignedId = :id
			""")
	Optional<DeliveryAssignment> findByIdForUpdate(@Param("id") Long id);

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
	 * @param driverId  기사 ID
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
	List<DeliveryAssignment> findProposedRequestsByDriver(@Param("driverId") Long driverId,
			@Param("status") StatusEnum status);

	/**
	 * 🔍 특정 요청의 기사 할당 상태 조회
	 * 
	 * @param requestId 배송 요청 ID
	 * @param status    할당 상태
	 * @return 기사 할당 정보
	 */
	@Query("SELECT da FROM DeliveryAssignment da WHERE da.deliveryRequest.requestId = :requestId AND da.status = :status")
	Optional<DeliveryAssignment> findByRequestIdAndStatus(@Param("requestId") Long requestId,
			@Param("status") StatusEnum status);

	// 작성자: 고은설
	// 기능: 완료된 운송 할당 정보를 가지고 실제 운송 정보 추출.
	@Query("""
			select new com.gpt.squirrelLogistics.dto.deliveryAssignment.DriverDeliveryHistoryDTO(
			    a.assignedId,
			    u.name,
			    ad.actualPolyline,
			    ad.distance,
			    null,
			    null,
			    preP.payAmount,
			    p.payAmount,
			    p.payStatus,
			    p.paid
			)
			from DeliveryAssignment a
			left join a.deliveryRequest dr
			left join dr.company c
			left join c.user u
			left join a.actualDelivery ad
			left join a.payment p
			left join Payment preP on preP.paymentId = p.prepaidId
			where a.assignedId = :assignId
			""")
	Optional<DriverDeliveryHistoryDTO> findHistoryBase(@Param("assignId") Long assignId);

	// 작성자: 고은설
	// 기능: 완료된 운송 할당 정보를 가지고 요청의 경유지 정보 추출.
	@Query("""
			select new com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointSlimResponseDTO(
			    wp.waypointId,
			    wp.address,
			    wp.dropOrder,
			    wp.status
			)
			from DeliveryWaypoint wp
			where wp.deliveryRequest = :request
			order by wp.dropOrder
			""")
	List<DeliveryWaypointSlimResponseDTO> findWaypointsByRequest(@Param("request") DeliveryRequest request);

	// 작성자: 고은설
	// 기능: 완료된 운송 할당 정보를 가지고 배송 상태 로그 추출.
//	@Query("""
//			select new com.gpt.squirrelLogistics.dto.deliveryStatusLog.DeliveryStatusLogSlimResponseDTO(
//			    log.statusId,
//			    log.status,
//			    log.createdAt
//			)
//			from DeliveryStatusLog log
//			where log.deliveryAssignment.assignedId = :assignId
//			order by log.createdAt asc
//			""")
//	List<DeliveryStatusLogSlimResponseDTO> findLogsByAssignId(@Param("assignId") Long assignId);

	@Query("""
			select new com.gpt.squirrelLogistics.dto.deliveryStatusLog.DeliveryStatusLogSlimResponseDTO(
			    log.statusId,
			    log.createdAt,
			    log.lastVisitedWaypoint,
			    log.status,
			    log.deliveryAssignment.assignedId
			)
			from DeliveryStatusLog log
			where log.deliveryAssignment.assignedId = :assignId
			order by log.createdAt asc
			""")
	List<DeliveryStatusLogSlimResponseDTO> findLogsByAssignId(@Param("assignId") Long assignId);

	// 작성자: 고은설.
	// 기능: requestId를 가진 Assignment 엔티티 1건 가져오기
	@Query("""
			  select da
			  from DeliveryAssignment da
			  where da.deliveryRequest.requestId = :requestId
			    and da.status in (
			      com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED,
			      com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS
			    )
			    and da.assignedAt = (
			      select max(x.assignedAt)
			      from DeliveryAssignment x
			      where x.deliveryRequest.requestId = :requestId
			        and x.status in (
			          com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED,
			          com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS
			        )
			    )
			    and da.assignedId = (
			      select max(y.assignedId)
			      from DeliveryAssignment y
			      where y.deliveryRequest.requestId = :requestId
			        and y.status in (
			          com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED,
			          com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS
			        )
			        and y.assignedAt = da.assignedAt
			    )
			""")
	Optional<DeliveryAssignment> findLatestActiveByRequestId(@Param("requestId") Long requestId);

	// 작성자: 고은설.
	// 기능: 긴급신고용 더미 assignid가져오기.
	Optional<DeliveryAssignment> findTopByDriver_DriverIdOrderByAssignedAtDescAssignedIdDesc(Long driverId);

	@Query("""
			    select new com.gpt.squirrelLogistics.dto.deliveryCompleted.DeliveryCompletedCardDTO(
			        da.assignedId,
			        dr.startAddress,
			        dr.endAddress,
			        da.completedAt
			    )
			    from DeliveryAssignment da
			    join da.deliveryRequest dr
			    where da.driver.id = :driverId
			      and da.completedAt is not null
			    order by da.completedAt desc
			""")
	List<DeliveryCompletedCardDTO> findCompletedCardsByDriverId(@Param("driverId") Long driverId);

}
