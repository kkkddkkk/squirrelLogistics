package com.gpt.squirrelLogistics.service.housekeeping;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Component
@Log4j2
@RequiredArgsConstructor
public class HousekeepingInterceptor implements HandlerInterceptor {

	private final HousekeepingService housekeepingService;

	private static final java.util.concurrent.locks.ReentrantLock LOCK = new java.util.concurrent.locks.ReentrantLock();
	private static final long MIN_INTERVAL_MS = 15_000; // 15초에 한 번만
	private static volatile long lastRun = 0L;

	@Override
	public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
		// 읽기 요청은 스킵 => 하려다가 필요해서 일단 다시 넣음.
//		if ("GET".equalsIgnoreCase(req.getMethod()))
//			return true;

		long now = System.currentTimeMillis();
		if (now - lastRun < MIN_INTERVAL_MS)
			return true;
		if (!LOCK.tryLock())
			return true;

		try {
			if (System.currentTimeMillis() - lastRun < MIN_INTERVAL_MS)
				return true;
			lastRun = now;

			// 비동기 실행: 요청 처리와 분리
			java.util.concurrent.CompletableFuture.runAsync(housekeepingService::sweep);
		} finally {
			LOCK.unlock();
		}
		return true;
	}

}
