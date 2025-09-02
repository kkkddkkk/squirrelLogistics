package com.gpt.squirrelLogistics.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.Getter;

@Component
@Getter
public class PaymentConfig {
    
    // 기존 결제 방법용 (카드, 카카오페이, 휴대폰)
    @Value("${portone.impKey}")
    private String defaultImpKey;
    
    @Value("${portone.secret}")
    private String defaultSecret;
    
    @Value("${portone.channelKey}")
    private String defaultChannelKey;
    
    // 토스페이용
    @Value("${portone.tosspay.impKey}")
    private String tossImpKey;
    
    @Value("${portone.tosspay.secret}")
    private String tossSecret;
    
    /**
     * 결제 방법에 따라 적절한 I'mport 계정 정보를 반환
     * @param paymentMethod 결제 방법
     * @return PaymentAccountInfo
     */
    public PaymentAccountInfo getPaymentAccountInfo(String paymentMethod) {
        if ("tosspay".equals(paymentMethod)) {
            return new PaymentAccountInfo(tossImpKey, tossSecret, null);
        } else {
            return new PaymentAccountInfo(defaultImpKey, defaultSecret, defaultChannelKey);
        }
    }
    
    /**
     * 결제 계정 정보를 담는 내부 클래스
     */
    public static class PaymentAccountInfo {
        private final String impKey;
        private final String secret;
        private final String channelKey;
        
        public PaymentAccountInfo(String impKey, String secret, String channelKey) {
            this.impKey = impKey;
            this.secret = secret;
            this.channelKey = channelKey;
        }
        
        public String getImpKey() { return impKey; }
        public String getSecret() { return secret; }
        public String getChannelKey() { return channelKey; }
    }
}
