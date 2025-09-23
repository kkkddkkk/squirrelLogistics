package com.gpt.squirrelLogistics.repository.settlement;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.entity.payment.Payment;
import com.gpt.squirrelLogistics.enums.payment.PayStatusEnum;

public interface SettlementRepository extends JpaRepository<Payment, Long> {

	interface SummaryRow {
		Long getGross();

		Long getFee();

		Integer getCompletedCount();
	}

	interface UnsettledRow {
		Integer getCount();

		Long getAmount();
	}

	interface MethodAggRow {
		String getMethod();

		Long getGross();

		Long getFee();
	}

	interface TrendRow {
		LocalDateTime getBucket();

		Long getGross();

		Long getFee();
	}

	/* ── KPI (이번달) ───────────────────────────────────────── */
	@Query(value = """
			SELECT
			  COALESCE(SUM(CASE WHEN pay_status IN ('COMPLETED','ALLCOMPLETED') THEN pay_amount ELSE 0 END),0) AS gross,
			  COALESCE(SUM(CASE WHEN pay_status IN ('COMPLETED','ALLCOMPLETED') THEN settlement_fee ELSE 0 END),0) AS fee,
			  CAST(SUM(CASE WHEN pay_status IN ('COMPLETED','ALLCOMPLETED') THEN 1 ELSE 0 END) AS SIGNED) AS completedCount
			FROM payment
			WHERE paid >= :start AND paid < :end
			""", nativeQuery = true)
	SummaryRow sumMonthly(@Param("start") LocalDateTime startKst, @Param("end") LocalDateTime endKst);

	/* ── 미정산 전체 요약 ───────────────────────────────────── */
	@Query(value = """
			SELECT
			  CAST(COUNT(*) AS SIGNED) AS count,
			  COALESCE(SUM(pay_amount),0) AS amount
			FROM payment
			WHERE pay_status IN ('COMPLETED','ALLCOMPLETED')
			  AND settlement = 0   -- BIT(1) 비교는 0/1로
			""", nativeQuery = true)
	UnsettledRow sumUnsettled();

	/* ── 결제수단별 집계 (기간) ─────────────────────────────── */
	@Query(value = """
			SELECT
			  COALESCE(NULLIF(TRIM(pay_method), ''), 'unknown') AS method,
			  COALESCE(SUM(CASE WHEN pay_status IN ('COMPLETED','ALLCOMPLETED')
			                    THEN pay_amount ELSE 0 END), 0) AS gross,
			  COALESCE(SUM(CASE WHEN pay_status IN ('COMPLETED','ALLCOMPLETED')
			                    THEN settlement_fee ELSE 0 END), 0) AS fee
			FROM payment
			WHERE paid >= :start AND paid < :end
			GROUP BY COALESCE(NULLIF(TRIM(pay_method), ''), 'unknown')
			ORDER BY method
			""", nativeQuery = true)
	List<MethodAggRow> sumByMethod(@Param("start") LocalDateTime startKst, @Param("end") LocalDateTime endKst);

	// ── 기간별 추이: 일 단위 (KST, 버킷=해당 일 00:00:00)
	@Query(value = """
			SELECT
			  bucket,
			  COALESCE(SUM(CASE WHEN pay_status IN ('COMPLETED','ALLCOMPLETED') THEN pay_amount END),0) AS gross,
			  COALESCE(SUM(CASE WHEN pay_status IN ('COMPLETED','ALLCOMPLETED') THEN settlement_fee END),0) AS fee
			FROM (
			  SELECT
			    CAST(DATE_FORMAT(paid, '%Y-%m-%d 00:00:00') AS DATETIME) AS bucket,
			    pay_amount, settlement_fee, pay_status
			  FROM payment
			  WHERE paid >= :start AND paid < :end
			) x
			GROUP BY bucket
			ORDER BY bucket
			""", nativeQuery = true)
	List<TrendRow> sumTrendDay(@Param("start") LocalDateTime startKst, @Param("end") LocalDateTime endKst);

	// ── 기간별 추이: 주 단위 (KST, 월요일 시작, 버킷=그 주 월요일 00:00:00)
	@Query(value = """
			SELECT
			  bucket,
			  COALESCE(SUM(CASE WHEN pay_status IN ('COMPLETED','ALLCOMPLETED') THEN pay_amount END),0) AS gross,
			  COALESCE(SUM(CASE WHEN pay_status IN ('COMPLETED','ALLCOMPLETED') THEN settlement_fee END),0) AS fee
			FROM (
			  SELECT
			    CAST(
			      DATE_FORMAT(DATE_SUB(DATE(paid), INTERVAL WEEKDAY(paid) DAY), '%Y-%m-%d 00:00:00')
			      AS DATETIME
			    ) AS bucket,
			    pay_amount, settlement_fee, pay_status
			  FROM payment
			  WHERE paid >= :start AND paid < :end
			) x
			GROUP BY bucket
			ORDER BY bucket
			""", nativeQuery = true)
	List<TrendRow> sumTrendWeek(@Param("start") LocalDateTime startKst, @Param("end") LocalDateTime endKst);

	// ── 기간별 추이: 월 단위 (KST, 버킷=해당 월 1일 00:00:00)
	@Query(value = """
			SELECT
			  bucket,
			  COALESCE(SUM(CASE WHEN pay_status IN ('COMPLETED','ALLCOMPLETED') THEN pay_amount END),0) AS gross,
			  COALESCE(SUM(CASE WHEN pay_status IN ('COMPLETED','ALLCOMPLETED') THEN settlement_fee END),0) AS fee
			FROM (
			  SELECT
			    CAST(DATE_FORMAT(paid, '%Y-%m-01 00:00:00') AS DATETIME) AS bucket,
			    pay_amount, settlement_fee, pay_status
			  FROM payment
			  WHERE paid >= :start AND paid < :end
			) x
			GROUP BY bucket
			ORDER BY bucket
			""", nativeQuery = true)
	List<TrendRow> sumTrendMonth(@Param("start") LocalDateTime startKst, @Param("end") LocalDateTime endKst);

	@Query(value = """
			SELECT *
			FROM payment
			WHERE paid >= :start
			  AND paid <  :end
			  AND pay_status IN (:statuses)
			  AND (
			        :method IS NULL
			     OR :method = 'all'
			     OR pay_method = :method
			     OR (:method = 'unknown' AND pay_method IS NULL)
			  )
			  AND (
			        (:settle = 'unsettled' AND settlement = 0)
			     OR (:settle = 'settled'   AND settlement = 1)
			  )
			""", countQuery = """
			SELECT COUNT(*)
			FROM payment
			WHERE paid >= :start
			  AND paid <  :end
			  AND pay_status IN (:statuses)
			  AND (
			        :method IS NULL
			     OR :method = 'all'
			     OR pay_method = :method
			     OR (:method = 'unknown' AND pay_method IS NULL)
			  )
			  AND (
			        (:settle = 'unsettled' AND settlement = 0)
			     OR (:settle = 'settled'   AND settlement = 1)
			  )
			""", nativeQuery = true)
	Page<Payment> findPaymentsPage(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end,
			@Param("statuses") List<String> statuses, @Param("method") String method, @Param("settle") String settle,
			Pageable pageable);

	// ── 특정 미결제건 추출(정산 처리로 업데이트 위함)
	@Query(value = """
			    SELECT * FROM payment
			    WHERE payment_id IN :ids
			      AND settlement = false
			      AND pay_status IN ('COMPLETED','ALLCOMPLETED')
			""", nativeQuery = true)
	List<Payment> findSettleTargets(@Param("ids") List<Long> ids);

}
