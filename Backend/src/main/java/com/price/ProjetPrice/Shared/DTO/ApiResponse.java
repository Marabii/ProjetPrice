package com.price.ProjetPrice.Shared.DTO;

import java.util.List;

import com.price.ProjetPrice.Shared.Enum.ApiStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private String message;
    private ApiStatus status;
    private List<String> errors;
    private T data;

    // Static factory method for success
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(message, ApiStatus.SUCCESS, null, data);
    }

    // Static factory method for failure
    public static <T> ApiResponse<T> failure(String message, List<String> errors) {
        return new ApiResponse<>(message, ApiStatus.FAILURE, errors, null);
    }
}
