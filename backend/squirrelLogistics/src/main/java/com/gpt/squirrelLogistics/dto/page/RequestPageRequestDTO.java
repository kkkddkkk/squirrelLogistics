package com.gpt.squirrelLogistics.dto.page;


import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestPageRequestDTO {
	
	//작성자: 고은설.
	//기능: 요청 목록 검색 및 필터링 기능.
    private int page = 1;
    private int size = 10;

    private String q;      
    private String scope;    
    private String startDate;
    private String sortKey;   
    
    public Pageable toPageable() {
        // 스프링은 0-base
        return PageRequest.of(Math.max(page - 1, 0), size);
    }

}
