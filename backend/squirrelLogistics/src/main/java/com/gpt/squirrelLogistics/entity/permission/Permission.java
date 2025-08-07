package com.gpt.squirrelLogistics.entity.permission;
import java.time.LocalDate;

import com.gpt.squirrelLogistics.entity.admin.AdminUser;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "permission")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "permission_id")
	private Long permissionId; //권한 아이디.
  
	@ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "admin_id", nullable = false) 
    private AdminUser adminUser; //관리자 아이디.
 
    @Column(length = 100)
	private String accessType; //권한 타입.
    
	private LocalDate modiDate; //수정일.

}
