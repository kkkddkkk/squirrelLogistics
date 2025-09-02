package com.gpt.squirrelLogistics.service.driverAuth;

import org.springframework.http.HttpStatus;

public sealed interface AuthOutcome permits AuthOutcome.Success, AuthOutcome.Failure {
	record Success(Long driverId) implements AuthOutcome {
	}

	record Failure(HttpStatus status, AuthErrorCode code, String message) implements AuthOutcome {
	}
}
