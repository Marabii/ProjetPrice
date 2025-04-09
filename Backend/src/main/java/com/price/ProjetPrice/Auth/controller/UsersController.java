package com.price.ProjetPrice.Auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.price.ProjetPrice.Auth.models.Users;
import com.price.ProjetPrice.Auth.service.UsersService;
import com.price.ProjetPrice.Shared.DTO.ApiResponse;
import com.price.ProjetPrice.Shared.Enum.ApiStatus;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api") // Ensure consistent base path
public class UsersController {
    private final UsersService userService;

    /**
     * Retrieves a list of all connected users.
     *
     * @return ApiResponse containing the list of connected users.
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<Users>>> findConnectedUsers() {
        List<Users> connectedUsers = userService.findConnectedUsers();
        ApiResponse<List<Users>> response = new ApiResponse<>(
                "Connected users retrieved successfully",
                ApiStatus.SUCCESS,
                null,
                connectedUsers);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves information of the currently authenticated user.
     *
     * @param request HttpServletRequest containing user principal.
     * @return ApiResponse containing the user information.
     */
    @GetMapping("/protected/getUserInfo")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserData(HttpServletRequest request) {
        String userEmail = request.getUserPrincipal().getName();
        Map<String, Object> userInfo = userService.getUserInfoByEmail(userEmail);
        ApiResponse<Map<String, Object>> response = new ApiResponse<>(
                "User information retrieved successfully",
                ApiStatus.SUCCESS,
                null,
                userInfo);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves information of a user by their ID.
     *
     * @param Id The ID of the user.
     * @return ApiResponse containing the user information.
     * @throws Exception If an error occurs while fetching user information.
     */
    @GetMapping("/protected/getUserInfo/{Id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserInfo(@PathVariable String Id) throws Exception {
        Map<String, Object> userInfo = userService.getUserInfoById(Id);
        ApiResponse<Map<String, Object>> response = new ApiResponse<>(
                "User information retrieved successfully",
                ApiStatus.SUCCESS,
                null,
                userInfo);
        return ResponseEntity.ok(response);
    }

    /**
     * Verifies the user's authentication status.
     *
     * @return ApiResponse indicating the verification status.
     */
    @GetMapping("/protected/verifyUser")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> verifyUser() {
        Map<String, Boolean> responseMap = new HashMap<>();
        responseMap.put("success", true);
        ApiResponse<Map<String, Boolean>> response = new ApiResponse<>(
                "User verification successful",
                ApiStatus.SUCCESS,
                null,
                responseMap);
        return ResponseEntity.ok(response);
    }
}
