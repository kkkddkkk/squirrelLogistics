package com.gpt.squirrelLogistics.monitoring;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class TimedEndpointAspect {
	 @Around("@annotation(timedEndpoint)")
	    public Object timeSpecificMethods(ProceedingJoinPoint pjp, TimedEndpoint timedEndpoint) throws Throwable {
	        long start = System.nanoTime();
	        boolean success = true;
	        try {
	            return pjp.proceed();
	        } catch (Throwable t) {
	            success = false;
	            throw t;
	        } finally {
	            long end = System.nanoTime();
	            long elapsedMs = (end - start) / 1_000_000;
	            // 클래스명.메서드명() 과 커스텀 이름을 함께 찍어주기
	            String where = pjp.getSignature().toShortString();
	            log.info("[TIMER] name={} method={} success={} elapsed_ms={}",
	                    timedEndpoint.value(), where, success, elapsedMs);
	        }
	    }
}
