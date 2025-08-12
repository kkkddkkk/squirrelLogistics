package com.gpt.squirrelLogistics;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.gpt.squirrelLogistics.repository.user.UserRepository;

@EntityScan(basePackages = {
  "com.gpt.squirrelLogistics.user", // 당신 엔티티 패키지
})
@EnableJpaRepositories(basePackages = {
  "com.gpt.squirrelLogistics.user.repository" // 당신 레포 패키지
})
@SpringBootTest
public class DatabaseInitTest {

    @Autowired
    private UserRepository userRepository;

//    @Test
//    void createTableAndInsertTest() {
//        // User 엔티티 저장 → 테이블 자동 생성
//        User user = new User();
//        user.setLoginId("testuser");
//        user.setName("홍길동");
//        user.setEmail("test@example.com");
//        user.setPassword("1234");
//        user.setRole(Role.DRIVER);
//
//        userRepository.save(user);
//    }
//    @Test
//    void check() {
//        String enc = "$2a$10$G6HQHALgoXMVd7sHuC4DOeFElW39SNL5Wk/BBM4iQoe.ODZhZPUUa";
//        System.out.println(new BCryptPasswordEncoder().matches("1234", enc));
//    }
    
    @Test
    void admin() {
    	System.out.println(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder()
                .encode("1234"));
    }
    
    
}