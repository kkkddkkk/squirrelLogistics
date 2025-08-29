//package com.gpt.squirrelLogistics.controller.payment;
//
//import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.client.RestTemplate;
//import org.springframework.web.reactive.function.client.WebClient;
//
//import com.fasterxml.jackson.core.JsonProcessingException;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.gpt.squirrelLogistics.dto.payment.RefundDTO;
//import com.gpt.squirrelLogistics.repository.payment.PaymentRepository;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.log4j.Log4j2;
//import reactor.core.publisher.Mono;
//
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.HttpEntity;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.HttpMethod;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//
//@RestController
//@Log4j2
//@RequiredArgsConstructor
//@RequestMapping("/api/payments")
//public class RefundController {
//
//	@Value("${portone.impKey}")
//	private String impKey;
//
//	@Value("${portone.secret}")
//	private String secret;
//
//	private final PaymentRepository paymentRepository;
//
//    private RestTemplate restTemplate = new RestTemplate();
//
//    public String getAccessToken() {
//        String url = "https://api.iamport.kr/users/getToken";
//
//        Map<String, String> body = new HashMap<>();
//        body.put("imp_key", impKey);
//        body.put("imp_secret", secret);
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//
//        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
//        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
//
//        Map responseBody = response.getBody();
//        Map responseData = (Map) responseBody.get("response");
//        return (String) responseData.get("access_token");
//    }
//    
//    @PostMapping("/cancel")
//    public ResponseEntity<?> refundPayment(@RequestBody Map<String, Object> request) {
//        String accessToken = getAccessToken();
//        String impUid = (String) request.get("imp_uid"); // 결제 고유 ID
//        Integer amount = (Integer) request.get("amount"); // 환불 금액
//
//        String url = "https://api.iamport.kr/payments/cancel";
//
//        Map<String, Object> body = new HashMap<>();
//        body.put("imp_uid", impUid);
//        body.put("amount", amount); // 부분 환불 시 금액 지정
//        // body.put("reason", "테스트 환불"); // 필요 시 환불 사유 추가
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//        headers.setBearerAuth(accessToken);
//
//        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
//        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
//
//        return ResponseEntity.ok(response.getBody());
//    }
//}
