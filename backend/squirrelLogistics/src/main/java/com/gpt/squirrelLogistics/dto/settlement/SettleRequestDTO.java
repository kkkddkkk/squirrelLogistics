package com.gpt.squirrelLogistics.dto.settlement;

import java.util.List;
import java.util.Map;

public record SettleRequestDTO(List<Long> ids, Map<Long, Long> merchantFeeOverrideById,
		Map<Long, Long> driverFeeOverrideById) {
}
