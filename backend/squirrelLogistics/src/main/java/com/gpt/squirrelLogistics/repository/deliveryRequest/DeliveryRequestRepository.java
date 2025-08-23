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
    
    @Query("SELECT r.estimatedFee FROM DeliveryRequest r WHERE r.requestId = :requestId")
    Long findEstimatedFeeById(@Param("requestId") Long requestId);
    
    // 작성자: 정윤진
    // 기능: vehicleType, Car, Driver를 조인해서 특정 요청에 지명된 driver 정보 조회
    @Query("""
        SELECT d.driverId, d.mainLoca, d.drivable, 
               c.carId, c.carNum, c.isInsurance,
               vt.vehicleTypeId, vt.name as vehicleTypeName, vt.maxWeight,
               u.userId, u.name as driverName
        FROM DeliveryRequest dr
        JOIN VehicleType vt ON dr.vehicleTypeId = vt.vehicleTypeId
        JOIN Car c ON c.vehicleType.vehicleTypeId = vt.vehicleTypeId
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
               c.carId, c.carNum, c.isInsurance,
               vt.vehicleTypeId, vt.name as vehicleTypeName, vt.maxWeight,
               u.userId, u.name as driverName
        FROM DeliveryRequest dr
        JOIN VehicleType vt ON dr.vehicleTypeId = vt.vehicleTypeId
        JOIN Car c ON c.vehicleType.vehicleTypeId = vt.vehicleTypeId
        JOIN Driver d ON c.driver.driverId = d.driverId
        JOIN User u ON d.user.userId = u.userId
        WHERE dr.status = 'ASSIGNED' OR dr.status = 'IN_PROGRESS'
        ORDER BY dr.createAt DESC
        """)
    List<Object[]> findAllAssignedDriverRequests();
    
}
