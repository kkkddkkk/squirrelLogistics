package com.gpt.squirrelLogistics.user.dto;

public class VehicleTypeDto {
    private Long id;
    private String name;

    public VehicleTypeDto() {}
    public VehicleTypeDto(Long id, String name) {
        this.id = id; this.name = name;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
}
