package com.gpt.squirrelLogistics.dto.deliveryRequest;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreatedRequestPaymentInfoDTO {
	
	//작성자: 고은설
	//기능: 생성된 운송 요청에 대한 요청 번호와 결제 아이디 프론트 페이지로 전달만 하는 역할.
	private Long requestId;
	private Long paymentId;
}
