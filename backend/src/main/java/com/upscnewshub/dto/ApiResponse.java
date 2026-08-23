package com.upscnewshub.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success = true;
    private String message;
    private T data;
    private String errorCode;
    private String path;
    private LocalDateTime timestamp = LocalDateTime.now();

    public ApiResponse() {}

    public ApiResponse(boolean success, String message, T data, String errorCode, String path, LocalDateTime timestamp) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errorCode = errorCode;
        this.path = path;
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public static <T> ApiResponse<T> success(T data) {
        return new Builder<T>().success(true).data(data).build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new Builder<T>().success(true).message(message).data(data).build();
    }

    public static <T> ApiResponse<T> error(String message, String errorCode, String path) {
        return new Builder<T>().success(false).message(message).errorCode(errorCode).path(path).build();
    }

    public static <T> Builder<T> builder() { return new Builder<>(); }

    public static class Builder<T> {
        private boolean success = true;
        private String message;
        private T data;
        private String errorCode;
        private String path;
        private LocalDateTime timestamp = LocalDateTime.now();

        public Builder<T> success(boolean success) { this.success = success; return this; }
        public Builder<T> message(String message) { this.message = message; return this; }
        public Builder<T> data(T data) { this.data = data; return this; }
        public Builder<T> errorCode(String errorCode) { this.errorCode = errorCode; return this; }
        public Builder<T> path(String path) { this.path = path; return this; }
        public Builder<T> timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }

        public ApiResponse<T> build() {
            return new ApiResponse<>(success, message, data, errorCode, path, timestamp);
        }
    }
}
