package com.gpt.squirrelLogistics.controller.payment;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import com.gpt.squirrelLogistics.dto.payment.RefundDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class RefundController {

    @Value("${portone.storeId}")
    private String storeId;

    @Value("${portone.secret}")
    private String secret;

    @Value("${portone.channelKey}")
    private String channelKey;
    
    @PostMapping("/{paymentId}/cancel")
    public void cancelPayment(@PathVariable(name="paymentId") String impUid) {
        String url = "https://api.portone.io/payments/" + impUid + "/cancel";

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "PortOne " + secret);
        headers.set("X-Channel-Key", channelKey);  // ← 이 줄 추가

        Map<String, String> body = new HashMap<>();
        body.put("reason", "고객 요청");

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            System.out.println(response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

//    private final WebClient webClient = WebClient.builder()
//            .baseUrl("https://api.portone.io/payments")
//            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
//            .build();
//
//    //전체환불
//    @PostMapping("")
//    public Mono<ResponseEntity<Map>> refund(@RequestBody RefundDTO refundDTO) {
//        return webClient.post()
//                .uri("/{paymentId}/cancel", refundDTO.getImpUid())
//                .header(HttpHeaders.AUTHORIZATION, "PortOne " + secret)
//                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
//                .bodyValue(new RefundBody(refundDTO.getReason(), refundDTO.getAmount()))
//                .retrieve()
//                .toEntity(Map.class) // JSON으로 받아오기
//                .onErrorResume(e -> {
//                    Map<String, Object> error = new HashMap<>();
//                    error.put("success", false);
//                    error.put("message", e.getMessage());
//                    return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error));
//                });
//    }
//
//    // 내부 클래스: 환불 요청 body
//    static class RefundBody {
//        private String reason;
//        private long amount;
//
//        public RefundBody(String reason, long amount) {
//            this.reason = reason;
//            this.amount = amount;
//        }
//
//        public String getReason() { return reason; }
//        public long getAmount() { return amount; }
//    }
}
