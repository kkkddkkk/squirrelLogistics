package com.gpt.squirrelLogistics.service.term;

import com.gpt.squirrelLogistics.dto.term.TermRequestDTO;
import com.gpt.squirrelLogistics.dto.term.TermResponseDTO;
import com.gpt.squirrelLogistics.dto.user.UserDTO;
import com.gpt.squirrelLogistics.entity.term.Term;
import com.gpt.squirrelLogistics.entity.user.User;

public class TermMapper {

    public static TermResponseDTO toResponseDTO(Term t) {
        User u = t.getUser();
        UserDTO userDTO = null;
        if (u != null) {
            userDTO = UserDTO.builder()
                    .userId(u.getUserId())
                    .loginId(u.getLoginId())
                    .name(u.getName())
                    .email(u.getEmail())
                    .Pnumber(u.getPnumber())
                    .role(u.getRole())
                    .regDate(u.getRegDate())
                    .modiDate(u.getModiDate())
                    .lastLogin(u.getLastLogin())
                    .build();
        }

        return TermResponseDTO.builder()
                .termId(t.getTermId())
                .termName(t.getTermName())
                .termContent(t.getTermContent())
                .isRequired(t.isRequired())
                .createDT(t.getCreateDT())
                .updateDT(t.getUpdateDT())
                .userDTO(userDTO)
                .build();
    }

    public static void applyRequestToEntity(TermRequestDTO req, Term entity, User userOrNull) {
        entity.update(req.getTermName(), req.getTermContent(), req.isRequired(), userOrNull);
    }
}