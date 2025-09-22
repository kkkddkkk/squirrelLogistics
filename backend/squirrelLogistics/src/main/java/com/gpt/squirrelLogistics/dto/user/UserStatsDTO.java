package com.gpt.squirrelLogistics.dto.user;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserStatsDTO {
    private long totalUsers;          // 전체 회원 수
    private long newUsersThisMonth;   // 이번 달 신규
    private long activeToday;         // 오늘 접속(마지막 로그인)
    private Map<String, Long> countsByRole; // 역할별 분포
    private List<Daily> dailySignups; // 이번 달 일별 가입 추이

    @Data @AllArgsConstructor
    public static class Daily {
        private LocalDate date;
        private long count;
    }
}