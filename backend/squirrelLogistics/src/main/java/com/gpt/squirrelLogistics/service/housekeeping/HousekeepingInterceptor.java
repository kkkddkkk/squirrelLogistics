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

	// 작성자: 고은설.
	// 기능: 운송 요청 및 운송 할당 정보 CRUD 관련 요청 엔드포인트 본 로직 수행 전 호출되는 인터셉터.
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		log.info("start housekeepingService");
		housekeepingService.sweep();
		return true;
	}

}
