
package com.gpt.squirrelLogistics;

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
import com.gpt.squirrelLogistics.repository.user.UserRepository;

@SpringBootTest
class SquirrelLogisticsApplicationTests {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private CompanyRepository companyRepository;

	@Test
	@Commit
	void contextLoads() {

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

			Random r = new Random();
			String licenseNum = String.format("%02d-%02d-%06d", r.nextInt(100), r.nextInt(100), r.nextInt(1_000_000));

			Optional<User> optionalUser = userRepository.findById((long) i);
			User user = optionalUser.orElse(null);

			Company company = Company.builder().address("주소" + i).mainLoca(mainLoca).user(user).build();

			Driver driver = Driver.builder().mainLoca(mainLoca).licenseNum(licenseNum).build();

			companyRepository.save(company);
		}
	}

}
