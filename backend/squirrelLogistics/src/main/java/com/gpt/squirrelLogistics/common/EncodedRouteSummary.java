package com.gpt.squirrelLogistics.common;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EncodedRouteSummary {
    private long distance;         // meters
    private String encodedPolyline;
}
