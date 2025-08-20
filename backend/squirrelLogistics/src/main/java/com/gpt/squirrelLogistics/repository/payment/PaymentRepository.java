package com.gpt.squirrelLogistics.repository.payment;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.entity.payment.Payment;
import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    //작성자: 고은설.
    //기능: 자동 환불처리 일괄 정리.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
      UPDATE payment p
      JOIN delivery_request r ON r.payment_id = p.payment_id
      LEFT JOIN delivery_assignment a
        ON a.request_id = r.request_id
       AND a.status IN ('UNKNOWN','ASSIGNED','IN_PROGRESS')
      SET p.pay_status = 'REFUNDED'
      WHERE r.status = 'PROPOSED'
        AND p.refund_date < :now
        AND a.delivery_assignment_id IS NULL
        AND p.pay_status <> 'REFUNDED'
    """, nativeQuery = true)
    int refundForRequestsWithoutActiveProposals(@Param("now") LocalDateTime now);
    
    //prepaidId로 paymentId 찾기 찾기
    @Query(value = "SELECT payment_id FROM payment WHERE prepaid_id = :prepaidId", nativeQuery = true)
    Long findPaymentIdByPrepaidId(@Param("prepaidId") Long prepaidId);
    
    @Query("select p.prepaidId from Payment p where p.paymentId = :paymentId")
    Long findPrepaidIdByPaymentId(@Param("paymentId") Long paymentId);;
    
}
