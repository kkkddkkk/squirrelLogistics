package com.gpt.squirrelLogistics.service.term;

import com.gpt.squirrelLogistics.dto.term.TermRequestDTO;
import com.gpt.squirrelLogistics.dto.term.TermResponseDTO;
import com.gpt.squirrelLogistics.entity.term.Term;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.repository.term.TermRepository;
import com.gpt.squirrelLogistics.repository.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class TermService {

    private final TermRepository termRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<TermResponseDTO> search(String q, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "termId"));
        return termRepository.search(q, pageable).map(TermMapper::toResponseDTO);
    }

    @Transactional(readOnly = true)
    public TermResponseDTO get(Long id) {
        Term t = termRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("약관을 찾을 수 없습니다. id=" + id));
        return TermMapper.toResponseDTO(t);
    }

    public TermResponseDTO create(TermRequestDTO req) {
        User user = null;
        if (req.getUserId() != null) {
            user = userRepository.findById(req.getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. id=" + req.getUserId()));
        }

        Term term = Term.builder()
                .termName(req.getTermName())
                .termContent(req.getTermContent())
                .isRequired(req.isRequired())
                .user(user) // null 허용
                .build();

        Term saved = termRepository.save(term);
        return TermMapper.toResponseDTO(saved);
    }

    public TermResponseDTO update(Long id, TermRequestDTO req) {
        Term term = termRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("약관을 찾을 수 없습니다. id=" + id));

        User user = null;
        if (req.getUserId() != null) {
            user = userRepository.findById(req.getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. id=" + req.getUserId()));
        }

        TermMapper.applyRequestToEntity(req, term, user); // updateDT는 @PreUpdate로 갱신
        return TermMapper.toResponseDTO(term);
    }

    public void delete(Long id) {
        if (termRepository.existsById(id)) termRepository.deleteById(id);
    }
}
