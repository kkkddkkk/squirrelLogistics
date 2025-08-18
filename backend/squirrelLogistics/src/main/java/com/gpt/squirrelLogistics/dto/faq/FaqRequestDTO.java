package com.gpt.squirrelLogistics.dto.faq;

import com.gpt.squirrelLogistics.enums.faq.FaqCategoryEnum;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaqRequestDTO {
    @NotBlank(message = "질문은 필수입니다.")
    private String question;

    @NotBlank(message = "답변은 필수입니다.")
    private String answer;

    private FaqCategoryEnum category; // nullable 허용
}
