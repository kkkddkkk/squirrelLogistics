package com.gpt.squirrelLogistics.repository.deliveryAssignment;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentSlimResponseDTO;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;

public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {

//	List<DeliveryAssignment> findByCompletedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
	List<DeliveryAssignment> findByCompletedAt(LocalDateTime completedAt);

	@Query("SELECT DISTINCT FUNCTION('DATE', d.completedAt) FROM DeliveryAssignment d")
	List<Date> findOnlyCompletedAt();

	@Query("SELECT d.assignedId, r.startAddress, r.endAddress FROM DeliveryAssignment d "
			+ "JOIN d.deliveryRequest r WHERE FUNCTION('DATE', d.completedAt) = :completedAt")
	List<Object[]> findStartEndAddress(@Param("completedAt") String completedAt);

//	기사 이름, 차량종류
//	@Query("SELECT  dw.address, a.mountainous, a.caution, a.actualFee, r.rating, u.name, ve.name"
//			+ "FROM DeliveryAssignment d " + // 운송기록
//			"JOIN d.actualDelivery a " + // 실제운송
//			"JOIN DeliveryRequest re " + // 배송요청
//			"JOIN re.vehicleType ve " + // 차량종류
//			"JOIN DeliveryWaypoint dw ON dw.deliveryRequest = re " + // 경유지
//			"JOIN d.driver dr JOIN dr.user u " + // driver
//			"JOIN Reviw r ON r.deliveryAssignment = d " + "WHERE d.assignedId = :assignedId")
//	List<Object[]> findContentById(@Param("assignedId") String assignedId);

	
	//ID로 리뷰(평점, 사유) 찾기
	@Query("SELECT r.rating, r.reason FROM DeliveryAssignment d "
			+ "JOIN Review r ON r.deliveryAssignment = d WHERE d.assignedId = :assignedId")
	List<Object[]> findReviewById(@Param("assignedId") String assignedId);
	
	//ID로 실제운송기록(산간지역, 취급주의, 실제요금)
	@Query("SELECT ad.mountainous, ad.caution, ad.actualFee FROM DeliveryAssignment d "
			+ "JOIN d.actualDelivery ad WHERE d.assignedId = :assignedId")
	List<Object[]> findActualDeliveryById(@Param("assignedId") String assignedId);

	//ID로 user(기사이름), vehicleType(차량이름)
	@Query("SELECT us.name, vt.name FROM DeliveryAssignment d " + 
			"JOIN d.deliveryRequest dr "+
			"JOIN dr.vehicleType vt " + 
			"JOIN d.driver dri " +
			"JOIN dri.user us " + 
			"WHERE d.assignedId = :assignedId")
	List<Object[]> findDriverById(@Param("assignedId") String assignedId);
}
