package com.gpt.squirrelLogistics.user.dto;

import java.util.List;

public class RegisterMetaResponse {
    private List<TermDto> terms;              // 약관 (없으면 빈 배열)
    private List<VehicleTypeDto> vehicleTypes; // 차종 (없으면 기본값 채워서 반환)

    public RegisterMetaResponse() {}
    public RegisterMetaResponse(List<TermDto> terms, List<VehicleTypeDto> vehicleTypes) {
        this.terms = terms; this.vehicleTypes = vehicleTypes;
    }

    public List<TermDto> getTerms() { return terms; }
    public List<VehicleTypeDto> getVehicleTypes() { return vehicleTypes; }
    public void setTerms(List<TermDto> terms) { this.terms = terms; }
    public void setVehicleTypes(List<VehicleTypeDto> vehicleTypes) { this.vehicleTypes = vehicleTypes; }
}
