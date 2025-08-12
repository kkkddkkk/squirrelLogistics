package com.gpt.squirrelLogistics.user.service;

import java.time.LocalDate;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.user.Car;
import com.gpt.squirrelLogistics.user.Company;
import com.gpt.squirrelLogistics.user.Driver;
import com.gpt.squirrelLogistics.user.Role;
import com.gpt.squirrelLogistics.user.User;
import com.gpt.squirrelLogistics.user.VehicleType;
import com.gpt.squirrelLogistics.user.dto.RegisterCompanyRequest;
import com.gpt.squirrelLogistics.user.dto.RegisterDriverRequest;
import com.gpt.squirrelLogistics.user.dto.RegisterResponse;
import com.gpt.squirrelLogistics.user.repository.CarRepository;
import com.gpt.squirrelLogistics.user.repository.CompanyRepository;
import com.gpt.squirrelLogistics.user.repository.DriverRepository;
import com.gpt.squirrelLogistics.user.repository.UserRepository;
import com.gpt.squirrelLogistics.user.repository.VehicleTypeRepository;

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
    user.setPhone(req.getPhone());
    user.setPassword(passwordEncoder.encode(req.getPassword()));
    user.setRole(Role.DRIVER);
    user.setAccount(req.getAccount());
    user.setBirthday(req.getBirthday());
    user.setBusinessN(req.getBusinessN());

    Driver d = new Driver();
    d.setUser(user);
    d.setMainLoca(req.getMainLoca());
    d.setLicenseNum(req.getLicenseNum());
    d.setLicenseDT(req.getLicenseDT());
    d.setDrivable(Boolean.TRUE.equals(req.getDrivable()));
    user.setDriver(d);

    userRepo.save(user); // cascade로 Driver 저장

    if (req.getVehicleTypeId() != null && req.getCarNum() != null) {
      VehicleType vt = vtRepo.findById(req.getVehicleTypeId())
          .orElseThrow(() -> new IllegalArgumentException("차량종류 없음"));
      Car car = new Car();
      car.setVehicleType(vt);
      car.setDriver(d);
      car.setCarNum(req.getCarNum());
      car.setRegDate(LocalDate.now());
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
    user.setPhone(req.getPhone());
    user.setPassword(passwordEncoder.encode(req.getPassword()));
    user.setRole(Role.COMPANY);
    user.setAccount(req.getAccount());
    user.setBusinessN(req.getBusinessN());

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