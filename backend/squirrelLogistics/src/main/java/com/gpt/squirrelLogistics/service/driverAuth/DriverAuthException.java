package com.gpt.squirrelLogistics.service.driverAuth;

import org.springframework.http.HttpStatus;

public class DriverAuthException extends RuntimeException{

	private final AuthErrorCode code;
    private final HttpStatus httpStatus;

    public DriverAuthException(AuthErrorCode code, HttpStatus status, String message) {
        super(message);
        this.code = code;
        this.httpStatus = status;
    }
    
    public AuthErrorCode getCode() { return code; }
    public HttpStatus getHttpStatus() { return httpStatus; }
}
