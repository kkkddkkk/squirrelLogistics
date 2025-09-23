package com.gpt.squirrelLogistics.dto.settlement;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import com.gpt.squirrelLogistics.dto.page.RequestPageRequestDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UnsettledPageRequestDTO extends RequestPageRequestDTO {
	
	private String from;            // ISO8601 (예: 2025-09-01T00:00:00Z 또는 +09:00)
    private String to;              // ISO8601
    private String method = "all";  // all | unknown | kakaopay | ...
    private String settle;          // all | unsettled | settled

    public LocalDateTime getStartKst() {
        if (from == null) return null;
        ZonedDateTime z = ZonedDateTime.parse(from);
        return z.withZoneSameInstant(ZoneId.of("Asia/Seoul")).toLocalDateTime();
    }

    public LocalDateTime getEndKst() {
        if (to == null) return null;
        ZonedDateTime z = ZonedDateTime.parse(to);
        return z.withZoneSameInstant(ZoneId.of("Asia/Seoul")).toLocalDateTime();
    }
}
