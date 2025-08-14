package com.gpt.squirrelLogistics.dto.page;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class PageRequestDTO {
	@Builder.Default
    private int page = 1;

    @Builder.Default
    private int size = 10;

    @Builder.Default
    private Sort.Direction dir = Sort.Direction.DESC;

    @Builder.Default
    private String sort = "createAt"; // ✅ 기본 정렬 컬럼

    public Pageable toPageable() {
        // 스프링은 0-base
        return PageRequest.of(Math.max(page - 1, 0), size, dir, sort);
    }
}
