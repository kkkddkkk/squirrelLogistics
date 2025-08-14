package com.gpt.squirrelLogistics.dto.page;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import lombok.Builder;
import lombok.Getter;

@Getter
public class PageResponseDTO<E> {
	private List<E> dtoList;
    private List<Integer> pageNumList;
    private PageRequestDTO pageRequestDTO;

    private boolean prev, next;
    private int totalCount;   
    private int prevPage, nextPage, totalPage, current;

    @Builder(builderMethodName = "withAll")
    public PageResponseDTO(List<E> dtoList, PageRequestDTO pageRequestDTO, long totalCount) {
        this.dtoList = dtoList;
        this.pageRequestDTO = pageRequestDTO;
        this.totalCount = (int) totalCount; 

      
        int size = Math.max(1, pageRequestDTO.getSize());
        int currentPage = Math.max(1, pageRequestDTO.getPage());
        int blockSize = 10;

        int last = (int) Math.ceil(this.totalCount / (double) size); 
        if (last == 0) {

            last = 1;
        }

        int end = (int) (Math.ceil(currentPage / (double) blockSize)) * blockSize;
        int start = end - (blockSize - 1);

        end = Math.min(end, last);
        start = Math.max(1, start);

        this.prev = start > 1;
        this.next = end < last;

        this.pageNumList = IntStream.rangeClosed(start, end)
                .boxed()
                .collect(Collectors.toList());

        this.prevPage = this.prev ? (start - 1) : start;
        this.nextPage = this.next ? (end + 1) : end;

        this.totalPage = last;                
        this.current = Math.min(currentPage, last);
    }
}
