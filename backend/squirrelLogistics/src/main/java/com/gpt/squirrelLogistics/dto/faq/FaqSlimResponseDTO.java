package com.gpt.squirrelLogistics.dto.faq;

import com.gpt.squirrelLogistics.enums.faq.FaqCategoryEnum;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaqSlimResponseDTO {
    private Long faqId;
    private String question;
    private FaqCategoryEnum category;
}
