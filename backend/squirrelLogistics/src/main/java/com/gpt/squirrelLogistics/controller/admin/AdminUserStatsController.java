package com.gpt.squirrelLogistics.controller.admin;

import com.gpt.squirrelLogistics.dto.user.UserStatsDTO;
import com.gpt.squirrelLogistics.service.admin.UserStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class AdminUserStatsController {

    private final UserStatsService userStatsService;

    // 예: GET /api/admin/users/stats?month=2025-09 (없으면 현재월)
    @GetMapping("/stats")
    public UserStatsDTO stats(@RequestParam(name="month", required=false) String month) {
        YearMonth ym = (month == null || month.isBlank())
                ? YearMonth.now()
                : YearMonth.parse(month); // "yyyy-MM"
        return userStatsService.getMonthStats(ym);
    }
}
