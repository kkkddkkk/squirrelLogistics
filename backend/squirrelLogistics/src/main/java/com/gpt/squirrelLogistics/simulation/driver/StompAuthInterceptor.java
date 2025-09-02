package com.gpt.squirrelLogistics.simulation.driver;

import java.util.List;
import java.util.Optional;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import com.gpt.squirrelLogistics.service.driverAuth.AuthOutcome;
import com.gpt.squirrelLogistics.service.driverAuth.DriverTokenValidService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Component
@Log4j2
@RequiredArgsConstructor
public class StompAuthInterceptor implements ChannelInterceptor{
	private final DriverTokenValidService tokenValidService; // 토큰 검증하는 서비스 (직접 구현했을 가능성 높음)

	 @Override
	    public Message<?> preSend(Message<?> message, MessageChannel channel) {
	        StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
	        if (acc != null && StompCommand.CONNECT.equals(acc.getCommand())) {
	            String auth = Optional.ofNullable(acc.getFirstNativeHeader("Authorization")).orElse("");
	            String token = auth.startsWith("Bearer ") ? auth.substring(7) : null;


	            if (token == null) {
	                return null;
	            }

	            if (tokenValidService.isCompanyToken(token)) {
	                acc.setUser(new UsernamePasswordAuthenticationToken("COMPANY", "", List.of()));
	                return message;
	            }

	            AuthOutcome outcome = tokenValidService.resolve(token);
	            if (outcome instanceof AuthOutcome.Success s) {
	                Long driverId = s.driverId();
	                acc.setUser(new UsernamePasswordAuthenticationToken(String.valueOf(driverId), "", List.of()));
	                return message;
	            } else {
	                log.warn("[STOMP CONNECT] Invalid token -> connection rejected");
	                return null;
	            }
	        }
	        
	        if (acc != null && StompCommand.DISCONNECT.equals(acc.getCommand())) {
	            var user = acc.getUser();
	            log.info("[STOMP DISCONNECT] user={}, sessionId={}", 
	                     user != null ? user.getName() : "anonymous", 
	                     acc.getSessionId());
	        }
	        
	        return message;
	    }
}
