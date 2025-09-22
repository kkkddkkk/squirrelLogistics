package com.gpt.squirrelLogistics.service.admin;

import com.gpt.squirrelLogistics.dto.user.UserStatsDTO;
import com.gpt.squirrelLogistics.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserStatsService {

    private final UserRepository userRepository;

    public UserStatsDTO getMonthStats(YearMonth ym) {
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end   = ym.plusMonths(1).atDay(1).atStartOfDay();

        long total = userRepository.totalUsers();
        long newThisMonth = userRepository.countNewUsersBetween(start, end);

        LocalDate today = LocalDate.now();
        LocalDateTime tStart = today.atStartOfDay();
        LocalDateTime tEnd   = tStart.plusDays(1);
        long activeToday = userRepository.countActiveBetween(tStart, tEnd);

        Map<String, Long> roleMap = userRepository.countGroupByRole().stream()
                .collect(Collectors.toMap(
                        arr -> String.valueOf(arr[0]),
                        arr -> ((Number) arr[1]).longValue()
                ));

        List<UserStatsDTO.Daily> daily = userRepository.dailySignups(start, end).stream()
                .map(arr -> new UserStatsDTO.Daily(
                        ((java.sql.Date) arr[0]).toLocalDate(),
                        ((Number) arr[1]).longValue()))
                .toList();

        return UserStatsDTO.builder()
                .totalUsers(total)
                .newUsersThisMonth(newThisMonth)
                .activeToday(activeToday)
                .countsByRole(roleMap)
                .dailySignups(daily)
                .build();
    }
}
