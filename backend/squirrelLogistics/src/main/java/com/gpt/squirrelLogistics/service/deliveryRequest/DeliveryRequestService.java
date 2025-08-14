package com.gpt.squirrelLogistics.service.deliveryRequest;

import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.page.PageRequestDTO;
import com.gpt.squirrelLogistics.dto.page.PageResponseDTO;

public interface DeliveryRequestService {
	
	//운송 요청 생성(작성자: 고은설).
	Long create(DeliveryRequestRequestDTO dto);
	
	//개별 운송 요청 자세히 읽기(작성자: 고은설).
	DeliveryRequestResponseDTO readFull(Long requestId);
	
	//개별 운송 요청 간략하게 읽기(작성자 고은설).
	DeliveryRequestSlimResponseDTO readSlim(Long requestId);

	//운송 요청 수정, 상태 변경(작성자: 고은설).
    void update(Long requestId, DeliveryRequestRequestDTO dto);
    
    //운송 요청 삭제(작성자: 고은설).
    void delete(Long requestId);
    
    //운송 요청 목록 포기, 페이지네이션 포함(작성자: 고은설).
    PageResponseDTO<DeliveryRequestSlimResponseDTO> list(PageRequestDTO pageReq);
}
