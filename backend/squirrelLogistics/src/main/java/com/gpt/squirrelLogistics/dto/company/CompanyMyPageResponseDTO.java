package com.gpt.squirrelLogistics.dto.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 물류회사 마이페이지 회원정보 응답 DTO
 * User와 Company 테이블의 정보를 조합하여 제공
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyMyPageResponseDTO {
    
    // User 테이블 정보
    private Long userId;           // 회원 ID
    private String loginId;        // 로그인 ID
    private String name;           // 이름
    private String email;          // 이메일
    private String Pnumber;        // 연락처 (소문자 p로 변경)
    private String account;        // 계좌번호
    private String businessN;      // 사업자 등록번호
    
    // Company 테이블 정보
    private Long companyId;        // 회사 ID
    private String address;        // 주소
    private String mainLoca;       // 기본 주소
}
