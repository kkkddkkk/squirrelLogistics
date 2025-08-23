package com.gpt.squirrelLogistics.enums.car;

public enum CarStatusEnum {
	OPERATIONAL("운행 가능"),  // 운행 가능
	MAINTENANCE("정비중");     // 정비중
	
	private final String displayName;
	
	CarStatusEnum(String displayName) {
		this.displayName = displayName;
	}
	
	public String getDisplayName() {
		return displayName;
	}
}
