package com.gpt.squirrelLogistics.service.company;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gpt.squirrelLogistics.dto.company.CompanyResponseDTO;
import com.gpt.squirrelLogistics.entity.company.Company;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import com.gpt.squirrelLogistics.repository.user.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import com.gpt.squirrelLogistics.dto.delivery.DeliveryListResponseDTO;
import com.gpt.squirrelLogistics.repository.deliveryRequest.DeliveryRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class CompanyServiceImpl implements CompanyService {
    
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final DeliveryRequestRepository deliveryRequestRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public CompanyResponseDTO getCompanyByUserId(Long userId) {
        try {
            // userId로 User 조회
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return null;
            }
            
            // User의 Company 조회
            Company company = user.getCompany();
            if (company == null) {
                return null;
            }
            
            // CompanyResponseDTO로 변환
            return CompanyResponseDTO.builder()
                .companyId(company.getCompanyId())
                .address(company.getAddress())
                .mainLoca(company.getMainLoca())
                .build();
                
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    @Override
    public boolean verifyCredentials(String loginId, String password) {
        try {
            log.info("=== 본인인증 시작 ===");
            log.info("loginId: {}, password: {}", loginId, password != null ? "***" : "null");
            
            if (loginId == null || loginId.trim().isEmpty()) {
                log.warn("로그인 ID가 null이거나 비어있음");
                return false;
            }
            
            if (password == null || password.trim().isEmpty()) {
                log.warn("비밀번호가 null이거나 비어있음");
                return false;
            }
            
            // loginId로 User 조회
            User user = userRepository.findByLoginId(loginId.trim())
                .orElse(null);
            
            if (user == null) {
                log.warn("해당 로그인 ID로 가입된 사용자를 찾을 수 없음: {}", loginId);
                return false;
            }
            
            // 비밀번호 검증
            boolean isValid = passwordEncoder.matches(password.trim(), user.getPassword());
            
            if (isValid) {
                log.info("=== 본인인증 성공 - userId: {} ===", user.getUserId());
            } else {
                log.warn("=== 본인인증 실패 - 비밀번호 불일치 ===");
            }
            
            return isValid;
            
        } catch (Exception e) {
            log.error("=== 본인인증 실패 ===", e);
            return false;
        }
    }
    
    @Override
    public String requestPasswordReset(String email) {
        try {
            log.info("=== 비밀번호 재설정 요청 시작 ===");
            log.info("email: {}", email);
            
            if (email == null || email.trim().isEmpty()) {
                log.warn("이메일이 null이거나 비어있음");
                return null;
            }
            
            // 이메일로 User 조회
            User user = userRepository.findByEmail(email.trim())
                .orElse(null);
            
            if (user == null) {
                log.warn("해당 이메일로 가입된 사용자를 찾을 수 없음: {}", email);
                return null;
            }
            
            // 재설정 토큰 생성 (UUID 사용)
            String resetToken = java.util.UUID.randomUUID().toString();
            
            // TODO: 토큰을 데이터베이스에 저장하고 만료 시간 설정
            // 현재는 간단하게 토큰만 반환
            
            log.info("=== 비밀번호 재설정 요청 성공 - userId: {}, token: {} ===", user.getUserId(), resetToken);
            return resetToken;
            
        } catch (Exception e) {
            log.error("=== 비밀번호 재설정 요청 실패 ===", e);
            return null;
        }
    }
    
    @Override
    public boolean validateResetToken(String token) {
        try {
            log.info("=== 비밀번호 재설정 토큰 검증 시작 ===");
            log.info("token: {}", token);
            
            if (token == null || token.trim().isEmpty()) {
                log.warn("토큰이 null이거나 비어있음");
                return false;
            }
            
            // TODO: 데이터베이스에서 토큰 유효성 검증
            // 현재는 간단하게 토큰이 비어있지 않으면 유효하다고 가정
            boolean isValid = !token.trim().isEmpty();
            if (isValid) {
                log.info("=== 토큰 검증 성공 ===");
            } else {
                log.warn("=== 토큰 검증 실패 ===");
            }
            return isValid;
        } catch (Exception e) {
            log.error("=== 토큰 검증 실패 ===", e);
            return false;
        }
    }
    
    @Override
    @Transactional
    public String saveMainAddress(Long companyId, String mainLoca) {
        try {
            Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));
            
            company.setMainLoca(mainLoca);
            companyRepository.save(company);
            
            return "기본 주소가 저장되었습니다: " + mainLoca;
        } catch (Exception e) {
            throw new RuntimeException("기본 주소 저장 실패: " + e.getMessage());
        }
    }
    
    @Override
    public String getMainAddress(Long companyId) {
        try {
            Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));
            
            return company.getMainLoca();
        } catch (Exception e) {
            throw new RuntimeException("기본 주소 조회 실패: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional
    public String deleteMainAddress(Long companyId) {
        try {
            Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));
            
            company.setMainLoca(null);
            companyRepository.save(company);
            
            return "기본 주소가 삭제되었습니다.";
        } catch (Exception e) {
            throw new RuntimeException("기본 주소 삭제 실패: " + e.getMessage());
        }
    }

    /**
     * 회사별 배송 목록 조회 (driverName → name, estimatedFee → payAmount, deliveryStatus → status 적용)
     */
    @Override
    public Page<DeliveryListResponseDTO> getCompanyDeliveriesWithFilters(
            Long companyId, String name, String status, Pageable pageable) {
        
        try {
            log.info("=== 배송 목록 조회 시작 - companyId: {}, name: {}, status: {} ===", companyId, name, status);
            
            // 1. 통합 쿼리로 모든 배송 정보를 한 번에 조회
            List<Object[]> deliveryDataList = deliveryRequestRepository.findCompanyDeliveriesWithAllInfo(companyId, name, status);
            
            if (deliveryDataList == null || deliveryDataList.isEmpty()) {
                log.warn("회사 ID {}에 대한 배송 정보가 없습니다.", companyId);
                return new PageImpl<>(new ArrayList<>(), pageable, 0L);
            }
            
            log.info("통합 쿼리 결과: {}건", deliveryDataList.size());
            
            // 2. 각 배송 데이터를 DTO로 변환
            List<DeliveryListResponseDTO> deliveryList = new ArrayList<>();
            
            for (Object[] deliveryData : deliveryDataList) {
                if (deliveryData == null || deliveryData.length < 12) {
                    log.warn("배송 데이터가 불완전합니다: length={}, data={}", 
                        deliveryData != null ? deliveryData.length : 0, deliveryData);
                    continue;
                }
                
                try {
                    // 데이터 파싱 - 통합 쿼리 결과 순서에 맞춤
                    Long requestId = (Long) deliveryData[0];
                    LocalDateTime createAt = (LocalDateTime) deliveryData[1];
                    LocalDateTime wantToStart = (LocalDateTime) deliveryData[2];
                    LocalDateTime wantToEnd = (LocalDateTime) deliveryData[3];
                    Long driverId = (Long) deliveryData[4];
                    String nameValue = (String) deliveryData[5];      // u.name
                    Object statusValue = deliveryData[6];            // da.status (Enum일 수 있음)
                    String payMethod = (String) deliveryData[7];     // p.payMethod
                    Long payAmount = (Long) deliveryData[8];         // p.payAmount
                    Long actualFee = (Long) deliveryData[9];         // ad.actualFee
                    String startAddress = (String) deliveryData[10]; // dr.startAddress
                    String endAddress = (String) deliveryData[11];   // dr.endAddress
                    
                                         // 디버깅을 위한 로그
                     log.info("=== 원본 데이터 파싱 - requestId: {} ===", requestId);
                     log.info("driverId: {}, nameValue: '{}', statusValue: '{}', payMethod: '{}', payAmount: {}", 
                         driverId, nameValue, statusValue, payMethod, payAmount);
                     log.info("actualFee: {}, startAddress: '{}', endAddress: '{}'", 
                         actualFee, startAddress, endAddress);
                    
                                         // cargoType 별도 조회
                     String cargoType = null;
                     try {
                         List<String> cargoTypes = deliveryRequestRepository.findCargoTypesByRequestId(requestId);
                         if (cargoTypes != null && !cargoTypes.isEmpty()) {
                             cargoType = String.join(", ", cargoTypes);
                         }
                         log.info("cargoType 조회 결과: {}", cargoType);
                     } catch (Exception e) {
                         log.warn("cargoType 조회 실패 - requestId: {}, error: {}", requestId, e.getMessage());
                     }
                     
                     // Payment 정보 별도 조회 (통합 쿼리에서 null인 경우)
                     if (payMethod == null || payAmount == null) {
                         try {
                             // 1차: DeliveryAssignment의 Payment 정보 조회
                             Object[] paymentInfo = deliveryRequestRepository.findPaymentInfoByRequestId(requestId);
                             if (paymentInfo != null && paymentInfo.length >= 2) {
                                 if (payAmount == null && paymentInfo[0] != null) {
                                     payAmount = (Long) paymentInfo[0];
                                     log.info("DeliveryAssignment Payment에서 조회된 payAmount: {}", payAmount);
                                 }
                                 if (payMethod == null && paymentInfo[1] != null) {
                                     payMethod = (String) paymentInfo[1];
                                     log.info("DeliveryAssignment Payment에서 조회된 payMethod: {}", payMethod);
                                 }
                             }
                             
                             // 2차: DeliveryRequest의 Payment 정보 조회 (1차에서 null인 경우)
                             if ((payMethod == null || payAmount == null)) {
                                 Object[] prepaidPaymentInfo = deliveryRequestRepository.findPrepaidPaymentInfoByRequestId(requestId);
                                 if (prepaidPaymentInfo != null && prepaidPaymentInfo.length >= 2) {
                                     if (payAmount == null && prepaidPaymentInfo[0] != null) {
                                         payAmount = (Long) prepaidPaymentInfo[0];
                                         log.info("DeliveryRequest Payment에서 조회된 payAmount: {}", payAmount);
                                     }
                                     if (payMethod == null && prepaidPaymentInfo[1] != null) {
                                         payMethod = (String) prepaidPaymentInfo[1];
                                         log.info("DeliveryRequest Payment에서 조회된 payMethod: {}", payMethod);
                                     }
                                 }
                             }
                         } catch (Exception e) {
                             log.warn("Payment 정보 별도 조회 실패 - requestId: {}, error: {}", requestId, e.getMessage());
                         }
                     }
                     
                     // ActualDelivery 정보 별도 조회 (통합 쿼리에서 null인 경우)
                     if (actualFee == null) {
                         try {
                             Object[] actualDeliveryInfo = deliveryRequestRepository.findActualDeliveryInfoByRequestId(requestId);
                             if (actualDeliveryInfo != null && actualDeliveryInfo.length >= 1 && actualDeliveryInfo[0] != null) {
                                 actualFee = (Long) actualDeliveryInfo[0];
                                 log.info("별도 조회된 actualFee: {}", actualFee);
                             }
                         } catch (Exception e) {
                             log.warn("ActualDelivery 정보 별도 조회 실패 - requestId: {}, error: {}", requestId, e.getMessage());
                         }
                     }
                    
                    // null 체크 및 기본값 설정
                    if (nameValue == null || nameValue.trim().isEmpty()) {
                        nameValue = null;
                    }
                    
                    // 상태 한글 변환
                    String mappedStatus;
                    if (statusValue == null) {
                        mappedStatus = null;
                    } else {
                        // StatusEnum인 경우 name() 메서드로 문자열 변환
                        if (statusValue instanceof Enum) {
                            mappedStatus = mapDeliveryStatus(((Enum<?>) statusValue).name());
                        } else {
                            mappedStatus = mapDeliveryStatus(statusValue.toString());
                        }
                    }
                    
                    if (payMethod == null || payMethod.trim().isEmpty()) {
                        payMethod = null;
                    }
                    if (cargoType == null || cargoType.trim().isEmpty()) {
                        cargoType = null;
                    }
                    
                                         // payAmount가 null인 경우 0으로 설정
                     if (payAmount == null) {
                         payAmount = 0L;
                     }
                     
                     // 금액 로직
                     Long displayFee = 0L;
                     if ("배송완료".equals(mappedStatus) && actualFee != null && actualFee > 0) {
                         displayFee = actualFee;
                         log.info("배송완료 상태: actualFee 사용 - {}", actualFee);
                     } else if (payAmount != null && payAmount > 0) {
                         displayFee = payAmount;
                         log.info("예상금액 사용 - {}", payAmount);
                     } else {
                         // DeliveryRequest의 estimatedFee 사용
                         try {
                             Long estimatedFee = deliveryRequestRepository.findEstimatedFeeById(requestId);
                             if (estimatedFee != null && estimatedFee > 0) {
                                 displayFee = estimatedFee;
                                 log.info("DeliveryRequest estimatedFee 사용 - {}", estimatedFee);
                             } else {
                                 log.warn("유효한 금액 정보가 없음 - payAmount: {}, actualFee: {}, estimatedFee: {}", 
                                     payAmount, actualFee, estimatedFee);
                             }
                         } catch (Exception e) {
                             log.warn("estimatedFee 조회 실패 - requestId: {}, error: {}", requestId, e.getMessage());
                         }
                     }
                    
                    log.info("=== DTO 생성 - requestId: {} ===", requestId);
                    log.info("기사명: '{}', 배송상태: '{}', 결제방법: '{}'", nameValue, mappedStatus, payMethod);
                    log.info("금액: displayFee={}, payAmount={}, actualFee={}", displayFee, payAmount, actualFee);
                    
                    // DTO 생성
                    DeliveryListResponseDTO dto = DeliveryListResponseDTO.builder()
                        .requestId(requestId)
                        .cargoType(cargoType)
                        .createAt(createAt)
                        .wantToStart(wantToStart)
                        .wantToEnd(wantToEnd)
                        .driverId(driverId != null ? driverId : 0L)
                        .name(nameValue)                 // ✅ name
                        .status(mappedStatus)            // ✅ status
                        .payMethod(payMethod)
                        .payAmount(payAmount != null ? payAmount : 0L) // ✅ payAmount
                        .actualFee(actualFee != null ? actualFee : 0L)
                        .displayFee(displayFee)
                        .startAddress(startAddress)
                        .endAddress(endAddress)
                        .build();
                    
                    deliveryList.add(dto);
                    
                } catch (Exception e) {
                    log.error("DTO 생성 중 오류 발생: {}", e.getMessage(), e);
                }
            }
            
            log.info("=== 배송 목록 조회 완료 - 총 {}건 ===", deliveryList.size());
            return new PageImpl<>(deliveryList, pageable, deliveryList.size());
            
        } catch (Exception e) {
            log.error("배송 목록 조회 실패: {}", e.getMessage(), e);
            throw new RuntimeException("배송 목록 조회 실패: " + e.getMessage());
        }
    }
    
    // 필터링된 배송 요청 ID 목록 조회
    private List<Long> getFilteredRequestIds(Long companyId, String name, String status) {
        try {
                         // 기사명 + 상태 모두 필터
             if (name != null && !name.trim().isEmpty() &&
                 status != null && !status.trim().isEmpty()) {
                 List<Long> result = deliveryRequestRepository
                         .findRequestIdsByNameAndStatus(companyId, name.trim(), status);
                 return result != null ? result : new ArrayList<>();
             }
             // 기사명만 필터
             else if (name != null && !name.trim().isEmpty()) {
                 List<Long> result = deliveryRequestRepository
                         .findRequestIdsByName(companyId, name.trim());
                 return result != null ? result : new ArrayList<>();
             }
            // 상태만 필터
            else if (status != null && !status.trim().isEmpty()) {
                List<Long> result = deliveryRequestRepository
                        .findRequestIdsByStatus(companyId, status);
                return result != null ? result : new ArrayList<>();
            }
            // 필터 없음: 전체
            else {
                List<Object[]> allRequests = deliveryRequestRepository
                        .findDeliveryRequestsBasicByCompany(companyId);
                if (allRequests == null || allRequests.isEmpty()) {
                    log.warn("회사 ID {}에 대한 배송 요청이 없습니다.", companyId);
                    return new ArrayList<>();
                }
                return allRequests.stream()
                        .filter(info -> info != null && info.length > 0 && info[0] != null)
                        .map(info -> (Long) info[0])
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.error("필터링된 배송 요청 ID 조회 실패: companyId={}, name={}, status={}", 
                    companyId, name, status, e);
            return new ArrayList<>();
        }
    }
    
    @Override
    public boolean completePasswordReset(String email, String newPassword) {
        try {
            log.info("=== 비밀번호 재설정 완료 시작 ===");
            log.info("email: {}, newPassword: {}", email, newPassword != null ? "***" : "null");
            
            if (email == null || email.trim().isEmpty()) {
                log.warn("이메일이 null이거나 비어있음");
                return false;
            }
            if (newPassword == null || newPassword.trim().isEmpty()) {
                log.warn("새 비밀번호가 null이거나 비어있음");
                return false;
            }
            
            // 이메일로 User 조회
            User user = userRepository.findByEmail(email.trim())
                .orElse(null);
            if (user == null) {
                log.warn("해당 이메일로 가입된 사용자를 찾을 수 없음: {}", email);
                return false;
            }
            
            // 비밀번호 업데이트
            user.setPassword(passwordEncoder.encode(newPassword.trim()));
            userRepository.save(user);
            
            log.info("=== 비밀번호 재설정 완료 성공 - userId: {} ===", user.getUserId());
            return true;
        } catch (Exception e) {
            log.error("=== 비밀번호 재설정 완료 실패 ===", e);
            return false;
        }
    }
    
    @Override
    @Transactional
    public boolean deleteUserAccount(Long userId) {
        try {
            log.info("=== 회원탈퇴 시작 ===");
            log.info("userId: {}", userId);
            if (userId == null) {
                log.warn("사용자 ID가 null입니다.");
                return false;
            }
            
            // 사용자 존재 여부 확인
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                log.warn("해당 사용자 ID로 가입된 사용자를 찾을 수 없음: {}", userId);
                return false;
            }
            
            // 사용자 정보 완전 삭제
            userRepository.deleteById(userId);
            log.info("=== 회원탈퇴 완료 성공 - userId: {} ===", userId);
            return true;
        } catch (Exception e) {
            log.error("=== 회원탈퇴 실패 ===", e);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean withdrawAccount(Long userId) {
        try {
            log.info("=== 회원탈퇴 시작 (role 변경) ===");
            log.info("userId: {}", userId);
            if (userId == null) {
                log.warn("사용자 ID가 null입니다.");
                return false;
            }
            
            // 사용자 존재 여부 확인
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                log.warn("해당 사용자 ID로 가입된 사용자를 찾을 수 없음: {}", userId);
                return false;
            }
            
            // role을 ETC로 변경
            user.setRole(UserRoleEnum.ETC);
            userRepository.save(user);
            
            log.info("=== 회원탈퇴 완료 성공 (role 변경) - userId: {}, newRole: ETC ===", userId);
            return true;
        } catch (Exception e) {
            log.error("=== 회원탈퇴 실패 (role 변경) ===", e);
            return false;
        }
    }
    
    // 배송상태를 한글로 변환
    private String mapDeliveryStatus(String rawStatus) {
        log.info("배송상태 변환 시작 - rawStatus: '{}'", rawStatus);
        if (rawStatus == null || rawStatus.trim().isEmpty()) {
            log.warn("배송상태가 null이거나 비어있음");
            return null;
        }
        String s = rawStatus.trim();
        switch (s) {
            case "COMPLETED":          return "배송완료";
            case "ASSIGNED":           return "주문접수";
            case "IN_PROGRESS":        return "배송중";
            case "INPROGRESS":         return "배송중";
            case "CANCELED":           return "취소";
            case "FAILED":             return "배송실패";
            case "PAYMENTCOMPLETED":   return "정산완료";
            case "UNKNOWN":            return "미확인";
            default:                   return null; // 알 수 없는 상태는 null 반환
        }
    }

    @Override
    @Transactional
    public boolean completeSocialVerification(Long userId, String provider) {
        try {
            log.info("=== 소셜 사용자 재인증 완료 처리 시작 ===");
            log.info("userId: {}, provider: {}", userId, provider);
            
            if (userId == null || provider == null) {
                log.warn("필수 파라미터 누락 - userId: {}, provider: {}", userId, provider);
                return false;
            }
            
            // 사용자 존재 여부 확인
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                log.warn("해당 사용자 ID로 가입된 사용자를 찾을 수 없음: {}", userId);
                return false;
            }
            
            // 소셜 로그인 사용자인지 확인
            if (!user.isSns_login()) {
                log.warn("로컬 사용자 - 소셜 재인증 불가: {}", userId);
                return false;
            }
            
            // 소셜 재인증 완료 처리 (예: 마지막 재인증 시간 업데이트 등)
            // 현재는 단순히 성공으로 처리
            log.info("=== 소셜 사용자 재인증 완료 성공 - userId: {}, provider: {} ===", userId, provider);
            return true;
            
        } catch (Exception e) {
            log.error("=== 소셜 사용자 재인증 완료 처리 실패 ===", e);
            return false;
        }
    }
}
