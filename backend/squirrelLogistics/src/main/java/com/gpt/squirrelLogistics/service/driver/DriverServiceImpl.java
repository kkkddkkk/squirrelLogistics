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
    @Transactional(readOnly = true)
    public DriverResponseDTO getDriverProfile(Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("기사를 찾을 수 없습니다."));
        
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
        
        return DriverResponseDTO.builder()
                .driverId(driver.getDriverId())
                .mainLoca(driver.getMainLoca())
                .licenseNum(driver.getLicenseNum())
                .drivable(driver.isDrivable())
                .LicenseDT(driver.getLicenseDT() != null ? driver.getLicenseDT().atStartOfDay() : null)
                .profileImageUrl(driver.getProfileImageUrl())
                .userDTO(userDTO)
                .build();
    }

    @Override
    @Transactional
    public DriverResponseDTO updateDriverProfile(Long driverId, RegisterDriverRequest request) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("기사를 찾을 수 없습니다."));
        
        User user = driver.getUser();
        
        // User 정보 업데이트 (아이디는 변경 불가)
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPnumber(request.getPhone());
        user.setAccount(request.getAccount());
        user.setBusinessN(request.getBusinessN());
        
        // Driver 정보 업데이트
        driver.setMainLoca(request.getMainLoca());
        driver.setLicenseNum(request.getLicenseNum());
        driver.setLicenseDT(request.getLicenseDT());
        driver.setDrivable(Boolean.TRUE.equals(request.getDrivable()));
        driver.setPreferred_start_time(request.getPreferred_start_time());
        driver.setPreferred_end_time(request.getPreferred_end_time());
        
        userRepository.save(user);
        driverRepository.save(driver);
        
        return getDriverProfile(driverId);
    }

    @Override
    @Transactional
    public void changePassword(Long driverId, String currentPassword, String newPassword) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("기사를 찾을 수 없습니다."));
        
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
    public void deleteAccount(Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("기사를 찾을 수 없습니다."));
        
        User user = driver.getUser();
        
        // Driver 먼저 삭제 (외래키 제약조건)
        driverRepository.delete(driver);
        
        // User 삭제
        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean verifyPassword(Long driverId, String password) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("기사를 찾을 수 없습니다."));
        
        User user = driver.getUser();
        return passwordEncoder.matches(password, user.getPassword());
    }

    @Override
    @Transactional
    public String uploadProfileImage(Long driverId, MultipartFile image) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("기사를 찾을 수 없습니다."));
        
        try {
            // 파일 저장 경로 설정 (절대 경로 사용)
            String uploadDir = System.getProperty("user.dir") + "/uploads/profile/";
            Path uploadPath = Paths.get(uploadDir);
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // 파일명 생성 (UUID + 원본 확장자)
            String originalFilename = image.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            
            // 파일 저장
            Path filePath = uploadPath.resolve(filename);
            Files.copy(image.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            
            // DB에 이미지 URL 저장
            String imageUrl = "/api/images/profile/" + filename;
            driver.setProfileImageUrl(imageUrl);
            driverRepository.save(driver);
            
            return imageUrl;
            
        } catch (IOException e) {
            log.error("프로필 이미지 업로드 실패", e);
            throw new RuntimeException("이미지 업로드에 실패했습니다.", e);
        }
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