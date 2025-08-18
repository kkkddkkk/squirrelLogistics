package com.gpt.squirrelLogistics.entity.faq;

import com.gpt.squirrelLogistics.enums.faq.FaqCategoryEnum;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "faq")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Faq {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "faq_id")
    private Long id;

    @Column(name = "admin_id")
    private Long adminId; // 추후 AdminUser FK 연동 예정

    @Column(length = 500, nullable = false)
    private String question;

    @Lob
    private String answer;

    @Enumerated(EnumType.STRING)
    @Column(length = 80)
    private FaqCategoryEnum category;

    // DB 컬럼 created_at/updated_at에 매핑
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }
}
