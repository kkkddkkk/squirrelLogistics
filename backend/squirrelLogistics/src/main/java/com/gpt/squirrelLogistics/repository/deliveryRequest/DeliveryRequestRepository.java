package com.gpt.squirrelLogistics.repository.deliveryRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;

import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestCardSlimDTO;
import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;

public interface DeliveryRequestRepository extends JpaRepository<DeliveryRequest, Long> {

	// 작성자: 고은설.
	// 기능: 사용자 지정 조회 쿼리로 한건의 운송 요청에 대한 두명 이상의 운전자 동시 작업을 막기위해 로크 설정.
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000"))
	@Query("select r from DeliveryRequest r where r.requestId = :id")
	Optional<DeliveryRequest> findByIdForUpdate(@Param("id") Long id);

	// 작성자: 고은설.
	// 기능: 아직 배정되지 않았고, 지명 제안이 모두 만료된 케이스 공개로 전환.
	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query(value = """
			  UPDATE delivery_request r
			  LEFT JOIN delivery_assignment a
			    ON a.request_id = r.request_id
			   AND a.status IN ('UNKNOWN','ASSIGNED','IN_PROGRESS')
			  SET r.status = 'REGISTERED',
			      r.payment_id = NULL
			  WHERE r.status = 'PROPOSED'
			    AND r.want_to_end >= :now
			    AND a.delivery_assignment_id IS NULL
			""", nativeQuery = true)
	int reopenAndDetachPaymentForRequestsNative(@Param("now") LocalDateTime now);

	// 작성자: 고은설
	// 기능: 할당 없고 기간 지난 공개 요청 매칭 실패로 처리.
	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query(value = """
			  UPDATE delivery_request r
			  LEFT JOIN delivery_assignment a
			    ON a.request_id = r.request_id
			   AND a.status IN ('UNKNOWN','ASSIGNED','IN_PROGRESS')
			  SET r.status = 'FAILED'
			  WHERE r.status IN ('REGISTERED','PROPOSED')
			    AND r.want_to_end < :now
			    AND a.delivery_assignment_id IS NULL
			""", nativeQuery = true)
	int failExpiredUnassignedRequests(@Param("now") LocalDateTime now);

	// 작성자: 고은설.
	// 기능: 요청 목록 화면에서 필요한 데이터만 추출하기 위함.
//	@Query(value = """
//			   select new com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestCardSlimDTO(
//			    dr.requestId,
//			    dr.createAt,
//			    dr.startAddress,
//			    dr.endAddress,
//			    dr.distance,
//			    dr.estimatedFee,
//			    u.name,
//			    vt.name,
//			    count(dw)
//			   )
//			     from DeliveryRequest dr
//			left join dr.company c
//			left join c.user u
//			left join dr.vehicleType vt
//			where dr.status = com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum.REGISTERED
//			  and (dr.wantToEnd is null or dr.wantToEnd >= CURRENT_TIMESTAMP)
//			order by dr.wantToStart asc nulls last
//			""", countQuery = """
//			select count(dr)
//			from DeliveryRequest dr
//			where dr.status = com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum.REGISTERED
//			  and (dr.wantToEnd is null or dr.wantToEnd >= CURRENT_TIMESTAMP)
//			""")
//	Page<DeliveryRequestCardSlimDTO> findActiveRegisteredSlim(Pageable pageable);

	// 작성자: 고은설.
	// 기능: 유효한 목록만 가져오기 위함 2.
	@Query("""
			select distinct dr
			from DeliveryRequest dr
			 left join fetch dr.company c
			 left join fetch c.user u
			 left join fetch dr.vehicleType vt
			where dr.requestId = :id
			""")
	Optional<DeliveryRequest> findDetailHead(@Param("id") Long id);

	// 작성자: 고은설.
	// 기능: 유효한 목록만 가져오기 위함.
	@Query(value = """
			select r
			  from DeliveryRequest r
			 where r.status = com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum.REGISTERED
			   and (r.wantToEnd is null or r.wantToEnd >= CURRENT_TIMESTAMP)
			 order by r.wantToStart asc nulls last
			""", countQuery = """
			select count(r)
			  from DeliveryRequest r
			 where r.status = com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum.REGISTERED
			""")
	Page<DeliveryRequest> findActiveRegistered(Pageable pageable);

	// 작성자: 김도경
	// requestId로 estimatedFee 찾기
	@Query("SELECT r.estimatedFee FROM DeliveryRequest r WHERE r.requestId = :requestId")
	Long findEstimatedFeeById(@Param("requestId") Long requestId);

	// 작성자: 김도경
	// paymentId로 requestId 찾기
	@Query("SELECT r.requestId FROM DeliveryRequest r JOIN r.payment p WHERE p.paymentId = :paymentId")
	Long findIdByPaymentId(@Param("paymentId") Long paymentId);

	// 작성자: 정윤진
	// 기능: vehicleType, Car, Driver를 조인해서 특정 요청에 지명된 driver 정보 조회
	@Query("""
			SELECT d.driverId, d.mainLoca, d.drivable,
			       c.carId, c.carNum, c.insurance,
			       vt.vehicleTypeId, vt.name as vehicleTypeName, vt.maxWeight,
			       u.userId, u.name as driverName
			FROM DeliveryRequest dr
			JOIN dr.vehicleType vt
			JOIN DeliveryAssignment da ON da.deliveryRequest.requestId = dr.requestId
			JOIN Car c ON c.driver.driverId = da.driver.driverId
			JOIN Driver d ON c.driver.driverId = d.driverId
			JOIN User u ON d.user.userId = u.userId
			WHERE dr.requestId = :requestId
			""")
	Object[] findDriverAssignmentByRequestId(@Param("requestId") Long requestId);

	// 작성자: 정윤진
	// 기능: vehicleType, Car, Driver를 조인해서 모든 지명된 요청의 driver 정보 조회
	@Query("""
			SELECT dr.requestId, dr.startAddress, dr.endAddress, dr.estimatedFee,
			       d.driverId, d.mainLoca, d.drivable,
			       c.carId, c.carNum, c.insurance,
			       vt.vehicleTypeId, vt.name as vehicleTypeName, vt.maxWeight,
			       u.userId, u.name as driverName
			FROM DeliveryRequest dr
			JOIN dr.vehicleType vt
			JOIN DeliveryAssignment da ON da.deliveryRequest.requestId = dr.requestId
			JOIN Car c ON c.driver.driverId = da.driver.driverId
			JOIN Driver d ON c.driver.driverId = d.driverId
			JOIN User u ON d.user.userId = u.userId
			WHERE dr.status = 'ASSIGNED' OR dr.status = 'IN_PROGRESS'
			ORDER BY dr.createAt DESC
			""")
	List<Object[]> findAllAssignedDriverRequests();

	// 작성자: 고은설.
	// 기능: 검색어 및 필터 기능 추가한 요청 목록 페이지 구성.
	@Query(value = """
			select new com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestCardSlimDTO(
			    dr.requestId,
			    dr.createAt,
			    dr.startAddress,
			    dr.endAddress,
			    dr.distance,
			    dr.estimatedFee,
			    u.name,
			    vt.name,
			    count(dw)
			)
			from DeliveryRequest dr
			left join dr.company c
			left join c.user u
			left join dr.vehicleType vt
			left join DeliveryWaypoint dw on dw.deliveryRequest = dr
			where dr.status = com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum.REGISTERED
			  and (dr.wantToEnd is null or dr.wantToEnd >= CURRENT_TIMESTAMP)
			  and (
			    :q is null or :q = '' or
			    (
			      (:scope is null or :scope = '' or :scope = 'ALL') and
			      ( lower(dr.startAddress) like lower(concat('%', :q, '%'))
			        or lower(dr.endAddress) like lower(concat('%', :q, '%'))
			        or lower(dr.memoToDriver) like lower(concat('%', :q, '%')) )
			    ) or
			    ( :scope = 'START' and lower(dr.startAddress) like lower(concat('%', :q, '%')) ) or
			    ( :scope = 'END'   and lower(dr.endAddress)  like lower(concat('%', :q, '%')) ) or
			    ( :scope = 'MEMO'  and lower(dr.memoToDriver) like lower(concat('%', :q, '%')) )
			  )
			  and (
			    :startFrom is null or :startTo is null or
			    dr.wantToStart between :startFrom and :startTo
			  )
			group by dr.requestId, dr.createAt, dr.startAddress, dr.endAddress, dr.distance, dr.estimatedFee, u.name, vt.name
			order by
			  case when :sortKey = 'RECENT'    then dr.createAt end desc,
			  case when :sortKey = 'FEE_DESC'  then dr.estimatedFee end desc,
			  case when :sortKey = 'DIST_ASC'  then dr.distance end asc,
			  case when :sortKey = 'DIST_DESC' then dr.distance end desc,
			  case when :sortKey = 'WP_ASC'    then count(dw) end asc,
			  case when :sortKey = 'WP_DESC'   then count(dw) end desc,
			  dr.createAt desc
			""", countQuery = """
			select count(distinct dr)
			from DeliveryRequest dr
			left join dr.company c
			left join c.user u
			where dr.status = com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum.REGISTERED
			  and (dr.wantToEnd is null or dr.wantToEnd >= CURRENT_TIMESTAMP)
			  and (
			    :q is null or :q = '' or
			    (
			      (:scope is null or :scope = '' or :scope = 'ALL') and
			      ( lower(dr.startAddress) like lower(concat('%', :q, '%'))
			        or lower(dr.endAddress) like lower(concat('%', :q, '%'))
			        or lower(dr.memoToDriver) like lower(concat('%', :q, '%')) )
			    ) or
			    ( :scope = 'START' and lower(dr.startAddress) like lower(concat('%', :q, '%')) ) or
			    ( :scope = 'END'   and lower(dr.endAddress)  like lower(concat('%', :q, '%')) ) or
			    ( :scope = 'MEMO'  and lower(dr.memoToDriver) like lower(concat('%', :q, '%')) )
			  )
			  and (
			    :startFrom is null or :startTo is null or
			    dr.wantToStart between :startFrom and :startTo
			  )
			""")
	Page<DeliveryRequestCardSlimDTO> findActiveRegisteredSlimFiltered(@Param("q") String q,
			@Param("scope") String scope, @Param("startFrom") LocalDateTime startFrom,
			@Param("startTo") LocalDateTime startTo, @Param("sortKey") String sortKey, Pageable pageable);

}
