package com.iims.iims.profile.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND) // This annotation ensures a 404 status code is returned
public class ProfileNotFoundException extends RuntimeException {
    public ProfileNotFoundException(String message) {
        super(message);
    }
}