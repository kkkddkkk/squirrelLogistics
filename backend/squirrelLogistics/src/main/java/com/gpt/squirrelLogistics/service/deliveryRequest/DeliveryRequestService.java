package com.gpt.squirrelLogistics.service.deliveryRequest;


import java.util.List;
import java.util.Optional;

import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.gpt.squirrelLogistics.dto.actualCalc.EstimateCalcDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.page.PageRequestDTO;
import com.gpt.squirrelLogistics.dto.page.PageResponseDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DriverAssignmentResponseDTO;

public interface DeliveryRequestService {
	
	//운송 요청 생성(작성자: 고은설).
    Long create(PaymentDTO paymentDTO, DeliveryRequestRequestDTO dto);	
	//개별 운송 요청 자세히 읽기(작성자: 고은설).
	DeliveryRequestResponseDTO readFull(Long requestId);
    DeliveryRequestResponseDTO readFullSafe(Long requestId, Long driverId) throws NotFoundException;
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
    
    //운송 요청 payment 명세서(작성자: 김도경)
    List<Object[]> getEstimateCalc(Long requestId);
    
    // 기사 지명 요청 정보 조회 (작성자: 정윤진)
    DriverAssignmentResponseDTO getDriverAssignmentByRequestId(Long requestId);
    
    // 모든 지명된 요청의 기사 정보 조회 (작성자: 정윤진)
    List<DriverAssignmentResponseDTO> getAllAssignedDriverRequests();
}
