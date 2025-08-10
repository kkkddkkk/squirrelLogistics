package com.gpt.squirrelLogistics.user.dto;

import java.time.LocalDate;

public class TermDto {
    private Long id;
    private String termName;
    private String termContent; // LOB -> String
    private Boolean isRequired;
    private LocalDate createDT;
    private LocalDate updateDT;

    public TermDto() {}

    public TermDto(Long id, String termName, String termContent,
                   Boolean isRequired, LocalDate createDT, LocalDate updateDT) {
        this.id = id;
        this.termName = termName;
        this.termContent = termContent;
        this.isRequired = isRequired;
        this.createDT = createDT;
        this.updateDT = updateDT;
    }

    // getters/setters ...
    public Long getId() { return id; }
    public String getTermName() { return termName; }
    public String getTermContent() { return termContent; }
    public Boolean getIsRequired() { return isRequired; }
    public LocalDate getCreateDT() { return createDT; }
    public LocalDate getUpdateDT() { return updateDT; }

    public void setId(Long id) { this.id = id; }
    public void setTermName(String termName) { this.termName = termName; }
    public void setTermContent(String termContent) { this.termContent = termContent; }
    public void setIsRequired(Boolean isRequired) { this.isRequired = isRequired; }
    public void setCreateDT(LocalDate createDT) { this.createDT = createDT; }
    public void setUpdateDT(LocalDate updateDT) { this.updateDT = updateDT; }
}