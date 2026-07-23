package com.tranvuthien.portfolio.web;

import com.tranvuthien.portfolio.dto.ApiError;
import com.tranvuthien.portfolio.exception.NotFoundException;
import com.tranvuthien.portfolio.exception.UnauthorizedException;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.List;

/**
 * Maps every exception to the {@link ApiError} JSON shape. Extending
 * {@link ResponseEntityExceptionHandler} keeps Spring MVC's own 4xx exceptions
 * (type mismatch, missing parameter/part, unsupported method/media type,
 * unknown static resource, ...) at their proper status instead of letting the
 * generic 500 handler swallow them.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException e,
                                                                  HttpHeaders headers, HttpStatusCode status,
                                                                  WebRequest request) {
        List<String> errors = e.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .toList();
        return ResponseEntity.badRequest().body(ApiError.of(400, "Validation failed", errors));
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException e,
                                                                  HttpHeaders headers, HttpStatusCode status,
                                                                  WebRequest request) {
        return ResponseEntity.badRequest().body(ApiError.of(400, "Malformed request body"));
    }

    @Override
    protected ResponseEntity<Object> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e,
                                                                          HttpHeaders headers, HttpStatusCode status,
                                                                          WebRequest request) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiError.of(413, "File too large (max 2 MB)"));
    }

    /** Fallback for the remaining framework exceptions the base class resolves. */
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception e, Object body, HttpHeaders headers,
                                                             HttpStatusCode statusCode, WebRequest request) {
        if (statusCode.is5xxServerError()) {
            log.error("Framework exception", e);
        }
        HttpStatus status = HttpStatus.resolve(statusCode.value());
        String message = status != null ? status.getReasonPhrase() : "Request failed";
        return ResponseEntity.status(statusCode).headers(headers).body(ApiError.of(statusCode.value(), message));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException e) {
        List<String> errors = e.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .toList();
        return ResponseEntity.badRequest().body(ApiError.of(400, "Validation failed", errors));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(ApiError.of(400, e.getMessage()));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiError.of(404, e.getMessage()));
    }

    @ExceptionHandler({BadCredentialsException.class, LockedException.class, UnauthorizedException.class})
    public ResponseEntity<ApiError> handleAuth(RuntimeException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiError.of(401, e.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiError.of(403, "Forbidden"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception e) {
        log.error("Unhandled exception", e);
        return ResponseEntity.internalServerError().body(ApiError.of(500, "Internal server error"));
    }
}
