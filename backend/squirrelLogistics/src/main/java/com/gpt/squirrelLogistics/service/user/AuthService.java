package com.gpt.squirrelLogistics.service.user;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.dto.regist.RegisterCompanyRequest;
import com.gpt.squirrelLogistics.dto.regist.RegisterDriverRequest;
import com.gpt.squirrelLogistics.dto.regist.RegisterResponse;
import com.gpt.squirrelLogistics.entity.car.Car;
import com.gpt.squirrelLogistics.entity.company.Company;
import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.enums.car.CarStatusEnum;
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;
import com.gpt.squirrelLogistics.repository.car.CarRepository;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.repository.user.UserRepository;
import com.gpt.squirrelLogistics.repository.vehicleType.VehicleTypeRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final UserRepository userRepo;
  private final DriverRepository driverRepo;
  private final CompanyRepository companyRepo;
  private final VehicleTypeRepository vtRepo;
  private final CarRepository carRepo;
  private final PasswordEncoder passwordEncoder;

  @Transactional
  public RegisterResponse registerDriver(RegisterDriverRequest req) {
    validateDup(req.getLoginId(), req.getEmail());

    User user = new User();
    user.setLoginId(req.getLoginId());
    user.setName(req.getName());
    user.setEmail(req.getEmail());
    user.setPnumber(req.getPhone());
    user.setPassword(passwordEncoder.encode(req.getPassword()));
    user.setRole(UserRoleEnum.DRIVER);
    user.setAccount(req.getAccount());
    user.setBirthday(req.getBirthday());
    user.setBusinessN(req.getBusinessN());
    user.setRegDate(LocalDateTime.now());
    user.setSns_login(false);

    Driver d = new Driver();
    d.setUser(user);
    d.setMainLoca(req.getMainLoca());
    d.setLicenseNum(req.getLicenseNum());
    d.setLicenseDT(req.getLicenseDT());
    d.setDrivable(Boolean.TRUE.equals(req.getDrivable()));
    d.setPreferred_start_time(req.getPreferred_start_time());
    d.setPreferred_end_time(req.getPreferred_end_time());
    user.setDriver(d);

    userRepo.save(user); // cascade로 Driver 저장

    if (req.getVehicleTypeId() != null && req.getCarNum() != null) {
      VehicleType vt = vtRepo.findById(req.getVehicleTypeId())
          .orElseThrow(() -> new IllegalArgumentException("차량종류 없음"));
      Car car = new Car();
      car.setVehicleType(vt);
      car.setDriver(d);
      car.setCarStatus(CarStatusEnum.OPERATIONAL);
      car.setCarNum(req.getCarNum());
      car.setRegDate(LocalDateTime.now());
      carRepo.save(car);
    }

    return new RegisterResponse(user.getUserId(), user.getLoginId(), user.getRole());
  }

  @Transactional
  public RegisterResponse registerCompany(RegisterCompanyRequest req) {
    validateDup(req.getLoginId(), req.getEmail());

    User user = new User();
    user.setLoginId(req.getLoginId());
    user.setName(req.getName());
    user.setEmail(req.getEmail());
    user.setPnumber(req.getPhone());
    user.setPassword(passwordEncoder.encode(req.getPassword()));
    user.setRole(UserRoleEnum.COMPANY);
    user.setAccount(req.getAccount());
    user.setBusinessN(req.getBusinessN());
    user.setSns_login(false);
    user.setRegDate(LocalDateTime.now());

    Company c = new Company();
    c.setUser(user);
    c.setAddress(req.getAddress());
    user.setCompany(c);

    userRepo.save(user);

    return new RegisterResponse(user.getUserId(), user.getLoginId(), user.getRole());
  }

  private void validateDup(String loginId, String email) {
    if (userRepo.existsByLoginId(loginId)) throw new IllegalStateException("중복 아이디");
    if (userRepo.existsByEmail(email))     throw new IllegalStateException("중복 이메일");
  }
  public boolean existsLoginId(String loginId) {
	  return userRepo.existsByLoginId(loginId);
  }
  public boolean existsByEmail(String email) {
	  return userRepo.existsByEmail(email);
  }
}