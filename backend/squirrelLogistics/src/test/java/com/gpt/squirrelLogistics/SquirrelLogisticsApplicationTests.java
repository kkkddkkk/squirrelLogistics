
package com.gpt.squirrelLogistics;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;

import com.gpt.squirrelLogistics.entity.company.Company;
import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.repository.user.UserRepository;

@SpringBootTest
class SquirrelLogisticsApplicationTests {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private DriverRepository driverRepository;

	@Test
	@Commit
	void contextLoads() {
<<<<<<< HEAD

		String mainLoca;
		boolean drivable = true;
		for (int i = 22; i <= 42; i++) {

			if (i > 10) {
				mainLoca = "서울시 ";
				if (i % 2 == 0) {
					mainLoca += "강서구";
				} else {
					mainLoca += "동작구";
				}
			} else {
				mainLoca = "경기도 ";
				if (i % 2 == 0) {
					mainLoca += "안산시";
				} else {
					mainLoca += "수원시";
					drivable = false;
				}
			}
			Random random = new Random();
			LocalDateTime LicenseDT = LocalDate.of(1980 + random.nextInt(20), 1 + random.nextInt(12), 1 + random.nextInt(28)).atStartOfDay();

			Random r = new Random();
			String licenseNum = String.format("%02d-%02d-%06d", r.nextInt(100), r.nextInt(100), r.nextInt(1_000_000));

			Optional<User> optionalUser = userRepository.findById((long) i);
			User user = optionalUser.orElse(null);

			Driver driver = Driver.builder().
					mainLoca(mainLoca).
					licenseNum(licenseNum).
					LicenseDT(LicenseDT).
					user(user).
					drivable(drivable).
					build();

			driverRepository.save(driver);
		}
=======
<<<<<<< Updated upstream
=======

		}
>>>>>>> Stashed changes
>>>>>>> feature/review+report/GPT-30
	}


