package com.gpt.squirrelLogistics.service.admin;

import java.time.LocalDateTime;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.dto.user.AdminUserUpsertReq;
import com.gpt.squirrelLogistics.dto.user.UserDTO;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;
import com.gpt.squirrelLogistics.repository.user.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {

    private final UserRepository userRepository;

    @Transactional
    public Page<UserDTO> search(String q, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "userId"));
        Page<User> result;
        if (q == null || q.isBlank()) {
            result = userRepository.findAll(pageable);
        } else {
            // name/email/loginId/pnumber like 검색
            result = userRepository.findAll((root, cq, cb) -> {
                String like = "%" + q.toLowerCase() + "%";
                return cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("email")), like),
                        cb.like(cb.lower(root.get("loginId")), like),
                        cb.like(cb.lower(root.get("Pnumber")), like)
                );
            }, pageable);
        }
        return result.map(AdminUserMapper::toDto);
    }

    public UserDTO create(AdminUserUpsertReq req) {
        if (userRepository.existsByLoginId(req.loginId())) throw new DuplicateKeyException("이미 존재하는 로그인ID입니다.");
        if (userRepository.existsByEmail(req.email()))   throw new DuplicateKeyException("이미 존재하는 이메일입니다.");

        User u = User.builder()
                .loginId(req.loginId())
                .name(req.name())
                .email(req.email())
                .Pnumber(req.pnumber())
                .account(req.account())
                .businessN(req.businessN())
                .birthday(AdminUserMapper.parseBirthday(req.birthday()))
                .regDate(LocalDateTime.now())
                .modiDate(LocalDateTime.now())
                .lastLogin(null)
                .sns_login(false)
                .role(req.role() != null ? req.role() : UserRoleEnum.COMPANY)
                .build();

        return AdminUserMapper.toDto(userRepository.save(u));
    }

    public UserDTO update(Long id, AdminUserUpsertReq req) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. id=" + id));

        // 중복 검증
        if (!u.getLoginId().equalsIgnoreCase(req.loginId()) && userRepository.existsByLoginId(req.loginId()))
            throw new DuplicateKeyException("이미 존재하는 로그인ID입니다.");
        if (!u.getEmail().equalsIgnoreCase(req.email()) && userRepository.existsByEmail(req.email()))
            throw new DuplicateKeyException("이미 존재하는 이메일입니다.");

        u.setLoginId(req.loginId());
        u.setName(req.name());
        u.setEmail(req.email());
        u.setPnumber(req.pnumber());
        u.setAccount(req.account());
        u.setBusinessN(req.businessN());
        u.setBirthday(AdminUserMapper.parseBirthday(req.birthday()));
        u.setRole(req.role() != null ? req.role() : u.getRole());
        u.setModiDate(LocalDateTime.now());

        return AdminUserMapper.toDto(u);
    }

    public void delete(Long id) {
        if (userRepository.existsById(id)) userRepository.deleteById(id);
    }
}