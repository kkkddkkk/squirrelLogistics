package com.gpt.squirrelLogistics.dto.admin;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserRequsetDTO {

	private Long userId; //회원 아이디.
}
