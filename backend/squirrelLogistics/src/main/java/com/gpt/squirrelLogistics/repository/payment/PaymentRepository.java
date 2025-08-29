package com.gpt.squirrelLogistics.repository.payment;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.dto.payment.RecieptDTO;
import com.gpt.squirrelLogistics.entity.payment.Payment;
import java.time.LocalDateTime;
import java.util.Optional;

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

    //paymentId로 prepaidId 찾기
    @Query("select p.prepaidId from Payment p where p.paymentId = :paymentId")
    Long findPrepaidIdByPaymentId(@Param("paymentId") Long paymentId);
    
    //paymentId로 payAmount찾기
    @Query("SELECT p.payAmount FROM Payment p WHERE p.paymentId = :paymentId")
    Long findPayAmountByPaymentId(@Param("paymentId") Long paymentId);

    @Query("SELECT p.payMethod FROM Payment p WHERE p.paymentId = :paymentId")
    String findPayMethodByPaymentId(@Param("paymentId") Long paymentId);

    //paymentId로 결제일자 찾기
    @Query("SELECT p.paid FROM Payment p WHERE p.paymentId = :paymentId")
    LocalDateTime findPaidByPaymentId(@Param("paymentId") Long paymentId);
    
    //paymentId로 method찾기
    @Query("SELECT p.payMethod FROM Payment p WHERE p.paymentId = :paymentId")
    String findMethodByPaymentId(@Param("paymentId") Long paymentId);
    
    //findByImpUid
    @Query("SELECT p FROM Payment p WHERE p.impUid = :impUid")
    Optional<Payment> findByImpUid(@Param("impUid") String impUid);
    
    //paymentId로 impUid 찾기
    @Query("SELECT p.impUid FROM Payment p WHERE p.paymentId = :paymentId")
    String findimpUidPaymentId(@Param("paymentId") Long paymentId);
    
}
