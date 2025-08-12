package com.gpt.squirrelLogistics.dto.regist;

import java.util.List;

import com.gpt.squirrelLogistics.dto.term.TermRequestDTO;
import com.gpt.squirrelLogistics.dto.vehicleType.VehicleTypeResponseDTO;

public class RegisterMetaResponse {
    private List<TermRequestDTO> terms;              // 약관 (없으면 빈 배열)
    private List<VehicleTypeResponseDTO> vehicleTypes; // 차종 (없으면 기본값 채워서 반환)

    public RegisterMetaResponse() {}
    public RegisterMetaResponse(List<TermRequestDTO> terms, List<VehicleTypeResponseDTO> vehicleTypes) {
        this.terms = terms; this.vehicleTypes = vehicleTypes;
    }

    public List<TermRequestDTO> getTerms() { return terms; }
    public List<VehicleTypeResponseDTO> getVehicleTypes() { return vehicleTypes; }
    public void setTerms(List<TermRequestDTO> terms) { this.terms = terms; }
    public void setVehicleTypes(List<VehicleTypeResponseDTO> vehicleTypes) { this.vehicleTypes = vehicleTypes; }
}
