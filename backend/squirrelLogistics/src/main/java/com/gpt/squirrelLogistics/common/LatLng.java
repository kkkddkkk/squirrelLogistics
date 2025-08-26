package com.gpt.squirrelLogistics.common;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LatLng {
	private BigDecimal lat;
	private BigDecimal lng;
}
