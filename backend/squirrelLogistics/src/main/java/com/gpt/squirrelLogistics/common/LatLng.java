package com.gpt.squirrelLogistics.common;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LatLng {
    private BigDecimal lat;
    private BigDecimal lng;

    // Hibernate JPQL constructor expression에서 사용
    public LatLng(BigDecimal lat, BigDecimal lng) {
        this.lat = lat;
        this.lng = lng;
    }

    // Jackson이 사용할 팩토리 메서드
    @JsonCreator
    public static LatLng fromJson(@JsonProperty("lat") BigDecimal lat,
                                  @JsonProperty("lng") BigDecimal lng) {
        return new LatLng(lat, lng);
    }
}

