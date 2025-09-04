package com.gpt.squirrelLogistics.service.driver;

import com.gpt.squirrelLogistics.dto.driver.DriverResponseDTO;
import com.gpt.squirrelLogistics.dto.regist.RegisterDriverRequest;
import com.gpt.squirrelLogistics.dto.user.UserDTO;
import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;

@Service
@RequiredArgsConstructor
@Log4j2
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public DriverResponseDTO getDriverProfile(Long userId) {
        log.info("DriverProfile 조회 시작 - userId: {}", userId);
        
        // findDriverByUserId 메서드 사용
        Driver driver = findDriverByUserId(userId);
        User user = driver.getUser();
        
        // UserDTO 생성
        UserDTO userDTO = UserDTO.builder()
                .userId(user.getUserId())
                .loginId(user.getLoginId())
                .name(user.getName())
                .email(user.getEmail())
                .Pnumber(user.getPnumber())
                .account(user.getAccount())
                .businessN(user.getBusinessN())
                .birthday(user.getBirthday() != null ? user.getBirthday().toString() : null)
                .regDate(user.getRegDate())
                .modiDate(user.getModiDate())
                .lastLogin(user.getLastLogin())
                .role(user.getRole())
                .build();
        
        log.info("UserDTO 생성 완료 - Pnumber: {}", userDTO.getPnumber());
        
        // 프로필 이미지: 파일명만 반환 (프론트에서 전체 URL 구성)
//        String profileImageFileName = null;
//        if (driver.getProfileImageUrl() != null && !driver.getProfileImageUrl().isEmpty()) {
//            // 전체 URL이 저장되어 있다면 파일명만 추출
//            if (driver.getProfileImageUrl().startsWith("/api/")) {
//                profileImageFileName = driver.getProfileImageUrl().substring(driver.getProfileImageUrl().lastIndexOf("/") + 1);
//            } else {
//                // 이미 파일명만 저장되어 있는 경우
//                profileImageFileName = driver.getProfileImageUrl();
//            }
//        }
        String profileImageFileName = null;
        if(driver.getProfileImageName() != null && !driver.getProfileImageName().isEmpty()) {
        	profileImageFileName = driver.getProfileImageName();
        }else {
        	profileImageFileName = "default_profile.png";
        }
        
        return DriverResponseDTO.builder()
                .driverId(driver.getDriverId())
                .mainLoca(driver.getMainLoca())
                .licenseNum(driver.getLicenseNum())
                .drivable(driver.isDrivable())
                .LicenseDT(driver.getLicenseDT() != null ? driver.getLicenseDT().atStartOfDay() : null)
                .profileImageName(profileImageFileName)
                .userDTO(userDTO)
                .build();
    }

    @Override
    @Transactional
    public DriverResponseDTO updateDriverProfile(Long userId, RegisterDriverRequest request) {
        Driver driver = findDriverByUserId(userId);
        User user = driver.getUser();
        
         log.info("프로필 수정 시작 - userId: {}, request: {}", userId, request);
        
        // User 정보 업데이트 (null이 아닌 경우에만 업데이트)
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPnumber(request.getPhone());
        }
        if (request.getAccount() != null) {
            user.setAccount(request.getAccount());
        }
        if (request.getBusinessN() != null) {
            user.setBusinessN(request.getBusinessN());
        }
        if (request.getBirthday() != null) {
            user.setBirthday(request.getBirthday());
        }
        
        // Driver 정보 업데이트 (null이 아닌 경우에만 업데이트)
        if (request.getMainLoca() != null) {
            driver.setMainLoca(request.getMainLoca());
        }
        if (request.getLicenseNum() != null) {
            driver.setLicenseNum(request.getLicenseNum());
        }
        if (request.getLicenseDT() != null) {
            driver.setLicenseDT(request.getLicenseDT());
        }
        if (request.getDrivable() != null) {
            driver.setDrivable(request.getDrivable());
        }
        if (request.getPreferred_start_time() != null) {
            driver.setPreferred_start_time(request.getPreferred_start_time());
        }
        if (request.getPreferred_end_time() != null) {
            driver.setPreferred_end_time(request.getPreferred_end_time());
        }
        
        userRepository.save(user);
        driverRepository.save(driver);
        
        log.info("프로필 수정 완료 - userId: {}", userId);
        
        return getDriverProfile(userId);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        Driver driver = findDriverByUserId(userId);
        User user = driver.getUser();
        
        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }
        
        // 새 비밀번호로 변경
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteAccount(Long userId) {
        Driver driver = findDriverByUserId(userId);
        User user = driver.getUser();
        
        log.info("회원탈퇴 처리 시작 - userId: {}, name: {}", userId, user.getName());
        
        // ✅ 하드 삭제 대신 소프트 삭제 (role 변경 + 개인정보 마스킹)
        
        // 1. User 정보 비활성화 및 마스킹
        user.setRole(com.gpt.squirrelLogistics.enums.user.UserRoleEnum.ETC);  // 역할을 ETC로 변경
        user.setName("탈퇴한사용자");  // 이름 마스킹
        user.setEmail("deleted_" + userId + "@deleted.com");  // 이메일 마스킹
        user.setPnumber("***-****-****");  // 전화번호 마스킹
        user.setLoginId("deleted_" + userId + "_" + System.currentTimeMillis());  // 로그인 차단
        user.setPassword("{deleted}");  // 로그인 차단
        user.setAccount(null);  // 계좌정보 삭제
        user.setBusinessN(null);  // 사업자번호 삭제
        user.setBirthday(null);  // 생년월일 삭제
        user.setModiDate(java.time.LocalDateTime.now());  // 수정일시 업데이트
        
        // 2. Driver 정보 비활성화
        driver.setDrivable(false);  // 운전 불가능으로 설정
        driver.setMainLoca("탈퇴한사용자");  // 선호지역 마스킹
        driver.setLicenseNum("***-***-***");  // 면허번호 마스킹
        driver.setLicenseDT(null);  // 면허유효기간 삭제
        driver.setProfileImageUrl(null);  // 프로필 이미지 삭제
        driver.setProfileImagePath(null);
        driver.setProfileImageName(null);
        
        // 3. 데이터베이스 저장 (삭제가 아닌 업데이트)
        userRepository.save(user);
        driverRepository.save(driver);
        
        log.info("회원탈퇴 처리 완료 - userId: {}, 개인정보 마스킹 및 role ETC 변경 완료", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean verifyPassword(Long userId, String password) {
        log.info("비밀번호 확인 시작 - userId: {}", userId);
        
        Driver driver = findDriverByUserId(userId);
        User user = driver.getUser();
        
        log.info("사용자 정보 - loginId: {}, name: {}", user.getLoginId(), user.getName());
        log.info("입력된 비밀번호: {}", password);
        log.info("저장된 비밀번호 해시: {}", user.getPassword());
        
        boolean isValid = passwordEncoder.matches(password, user.getPassword());
        log.info("비밀번호 확인 결과: {}", isValid);
        
        return isValid;
    }

    @Override
    @Transactional
    public String uploadProfileImage(Long userId, MultipartFile image) {
        Driver driver = findDriverByUserId(userId);
        
        try {
            // 파일 저장 경로 설정 (절대 경로 사용)
            String uploadDir = System.getProperty("user.dir") + "/uploads/profile/";
            Path uploadPath = Paths.get(uploadDir);
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // 기존 이미지 파일 삭제
            String existingImageUrl = driver.getProfileImageUrl();
            if (existingImageUrl != null && !existingImageUrl.isEmpty()) {
                try {
                    String existingFilename = existingImageUrl.substring(existingImageUrl.lastIndexOf("/") + 1);
                    Path existingFilePath = Paths.get(uploadDir, existingFilename);
                    if (Files.exists(existingFilePath)) {
                        Files.delete(existingFilePath);
                        log.info("기존 프로필 이미지 파일 삭제: {}", existingFilename);
                    }
                } catch (IOException e) {
                    log.error("기존 프로필 이미지 파일 삭제 실패", e);
                }
            }
            
            // 파일명 생성 (UUID + 원본 확장자)
            String originalFilename = image.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            
            // 파일 저장
            Path filePath = uploadPath.resolve(filename);
            Files.copy(image.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            
            // DB에 파일명만 저장
            driver.setProfileImageUrl(filename);
            driverRepository.save(driver);
            
            // 프론트엔드에는 파일명만 반환 (프론트에서 전체 URL 구성)
            return filename;
            
        } catch (IOException e) {
            log.error("프로필 이미지 업로드 실패", e);
            throw new RuntimeException("이미지 업로드에 실패했습니다.", e);
        }
    }

    @Override
    @Transactional
    public void deleteProfileImage(Long userId) {
        Driver driver = findDriverByUserId(userId);
        String existingImageUrl = driver.getProfileImageUrl();
        
        if (existingImageUrl != null && !existingImageUrl.isEmpty()) {
            try {
                String uploadDir = System.getProperty("user.dir") + "/uploads/profile/";
                String filename = existingImageUrl.substring(existingImageUrl.lastIndexOf("/") + 1);
                Path filePath = Paths.get(uploadDir, filename);
                
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                    log.info("기존 프로필 이미지 파일 삭제: {}", filename);
                }
            } catch (IOException e) {
                log.error("기존 프로필 이미지 파일 삭제 실패", e);
            }
        }
        
        driver.setProfileImageUrl(null);
        driverRepository.save(driver);
        log.info("프로필 이미지 삭제 완료 - userId: {}", userId);
    }

    // 공통 메서드: userId로 Driver 찾기 (없으면 생성)
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public Driver findDriverByUserId(Long userId) {
        log.info("findDriverByUserId 호출 - userId: {}", userId);
        
        // 먼저 User가 존재하는지 확인
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.error("userId {}에 해당하는 User가 존재하지 않습니다.", userId);
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다. userId: " + userId);
        }
        
        log.info("User 찾음: User ID {}, Name: {}, Role: {}, SNS로그인: {}", user.getUserId(), user.getName(), user.getRole(), user.isSns_login());
        
        // User의 Driver 정보 직접 접근 (양방향 관계 활용)
        Driver driver = user.getDriver();
        
        // Driver 엔티티가 없으면 생성 (구글/카카오 로그인 사용자 등)
        if (driver == null) {
            log.info("Driver 엔티티가 없어서 새로 생성합니다. userId: {}, role: {}", userId, user.getRole());
            
            // ✅ SNS 로그인 사용자가 ETC 역할인 경우 DRIVER로 자동 변경
            if (user.isSns_login() && user.getRole() == com.gpt.squirrelLogistics.enums.user.UserRoleEnum.ETC) {
                log.info("SNS 로그인 사용자의 역할을 ETC에서 DRIVER로 변경합니다. userId: {}", userId);
                user.setRole(com.gpt.squirrelLogistics.enums.user.UserRoleEnum.DRIVER);
                userRepository.save(user);
            }
            
            driver = new Driver();
            driver.setUser(user);
            driver.setDrivable(true); // 기본값으로 운전 가능 설정
            driver = driverRepository.save(driver);
            log.info("Driver 엔티티 생성 완료. driverId: {}", driver.getDriverId());
        }
        
        return driver;
    }

    // 테스트용 더미 데이터 생성 메서드
    @Transactional
    public void createDummyDriver() {
        // 이미 존재하는지 확인
        if (driverRepository.count() > 0) {
            return;
        }

        // User 생성
        User user = User.builder()
                .loginId("testdriver")
                .name("테스트기사")
                .email("test@example.com")
                .Pnumber("010-1234-5678")
                .password(passwordEncoder.encode("1234"))
                .account("123-456-789")
                .businessN("123-45-67890")
                .birthday(LocalDate.of(1990, 1, 1))
                .role(UserRoleEnum.DRIVER)
                .build();

        userRepository.save(user);

        // Driver 생성
        Driver driver = Driver.builder()
                .mainLoca("서울")
                .licenseNum("12-345678-90")
                .LicenseDT(LocalDate.of(2030, 12, 31))
                .drivable(true)
                .preferred_start_time(LocalTime.of(9, 0))
                .preferred_end_time(LocalTime.of(18, 0))
                .user(user)
                .build();

        driverRepository.save(driver);
    }

}
