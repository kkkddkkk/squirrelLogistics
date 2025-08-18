package com.gpt.squirrelLogistics.service.deliveryRequest;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;



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
    
 // 목록 - 커스텀 페이지 DTO
    PageResponseDTO<DeliveryRequestSlimResponseDTO> list(PageRequestDTO pageReq);

    // 목록 - Spring 표준 Page<T>
    Page<DeliveryRequestSlimResponseDTO> getPage(Pageable pageable);
}
