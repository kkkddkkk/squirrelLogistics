package com.gpt.squirrelLogistics;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import com.gpt.squirrelLogistics.entity.admin.AdminUser;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;
import com.gpt.squirrelLogistics.repository.admin.AdminUserRepository;
import com.gpt.squirrelLogistics.repository.user.UserRepository;

@SpringBootTest
class SquirrelLogisticsApplicationTests {

	@Autowired
	UserRepository userRepository;
	
	@Autowired
	AdminUserRepository adminUserRepository;


	private final Random random = new Random();

	private String randomPhone() {
		return "010-" + (1000 + random.nextInt(9000)) + "-" + (1000 + random.nextInt(9000));
	}

	private String randomAccount() {
		return (10000000 + random.nextInt(90000000)) + "-" + (100000 + random.nextInt(900000));
	}

	private String randomBusinessNumber() {
		return (100 + random.nextInt(900)) + "-" + (10 + random.nextInt(90)) + "-" + (10000 + random.nextInt(90000));
	}


	//@Test
	void insertDummyUsers() {
		List<User> dummyUsers = new ArrayList<>();
		
		for (UserRoleEnum role : UserRoleEnum.values()) {
			for (int i = 1; i <= 21; i++) {
				String uuid = UUID.randomUUID().toString().substring(0, 8);
				LocalDateTime now = LocalDateTime.now();

				User user = User.builder()
						.loginId(role.name().toLowerCase() + "_user" + i + "_" + uuid)
						.name(role.name() + "유저" + i)
						.email(role.name().toLowerCase() + i + "@test.com")
						.Pnumber(randomPhone())
						.password("pw" + i + uuid)
						.account(randomAccount())
						.businessN(randomBusinessNumber())
						.birthday(LocalDate.of(1980 + random.nextInt(20), 1 + random.nextInt(12), 1 + random.nextInt(28)).atStartOfDay())
						.regDate(now)
						.modiDate(now)
						.lastLogin(now.minusDays(random.nextInt(30)))
						.role(role) // 핵심: 고정된 역할
						.build();

				dummyUsers.add(user);
			}
		}

		userRepository.saveAll(dummyUsers);
	}
	
	@Transactional
	@Commit
	@Test
	void insertDummyAdmins() {
		List<AdminUser> adminUsers = new ArrayList<>();

	    for (long userId = 43; userId <= 84; userId++) {
	        Optional<User> optionalUser = userRepository.findById(userId);

	        if (optionalUser.isPresent()) {
	            User user = optionalUser.get();

	            AdminUser adminUser = AdminUser.builder()
	                    .user(user)
	                    .build();

	            adminUsers.add(adminUser);
	        } else {
	            System.out.println("❗유저 ID " + userId + " 없음");
	        }
	    }

	    adminUserRepository.saveAll(adminUsers);
	}

}
