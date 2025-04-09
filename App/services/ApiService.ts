import { BASE_URL } from "@/constants";
import { AuthService } from "./AuthService";
import { ApiResponse } from "@/types/Auth";

/**
 * ApiService provides methods for making authenticated API requests
 */
export class ApiService {
  /**
   * Make a GET request to the API
   * @param endpoint The API endpoint to call
   * @param requiresAuth Whether the request requires authentication
   * @returns The API response
   */
  static async get<T>(
    endpoint: string,
    requiresAuth = true
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (requiresAuth) {
        const token = await AuthService.getToken();
        if (!token) {
          return {
            message: "Authentication required",
            status: "FAILURE",
            errors: ["No authentication token available"],
            data: null,
          };
        }
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers,
      });

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      console.error(`API GET error for ${endpoint}:`, error);
      return {
        message: "Network error occurred",
        status: "FAILURE",
        errors: [
          "Failed to connect to the server. Please check your internet connection.",
        ],
        data: null,
      };
    }
  }

  /**
   * Make a POST request to the API
   * @param endpoint The API endpoint to call
   * @param body The request body
   * @param requiresAuth Whether the request requires authentication
   * @returns The API response
   */
  static async post<T>(
    endpoint: string,
    body: any,
    requiresAuth = true
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (requiresAuth) {
        const token = await AuthService.getToken();
        if (!token) {
          return {
            message: "Authentication required",
            status: "FAILURE",
            errors: ["No authentication token available"],
            data: null,
          };
        }
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      console.error(`API POST error for ${endpoint}:`, error);
      return {
        message: "Network error occurred",
        status: "FAILURE",
        errors: [
          "Failed to connect to the server. Please check your internet connection.",
        ],
        data: null,
      };
    }
  }

  /**
   * Make a PUT request to the API
   * @param endpoint The API endpoint to call
   * @param body The request body
   * @param requiresAuth Whether the request requires authentication
   * @returns The API response
   */
  static async put<T>(
    endpoint: string,
    body: any,
    requiresAuth = true
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (requiresAuth) {
        const token = await AuthService.getToken();
        if (!token) {
          return {
            message: "Authentication required",
            status: "FAILURE",
            errors: ["No authentication token available"],
            data: null,
          };
        }
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      console.error(`API PUT error for ${endpoint}:`, error);
      return {
        message: "Network error occurred",
        status: "FAILURE",
        errors: [
          "Failed to connect to the server. Please check your internet connection.",
        ],
        data: null,
      };
    }
  }

  /**
   * Make a DELETE request to the API
   * @param endpoint The API endpoint to call
   * @param requiresAuth Whether the request requires authentication
   * @returns The API response
   */
  static async delete<T>(
    endpoint: string,
    requiresAuth = true
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (requiresAuth) {
        const token = await AuthService.getToken();
        if (!token) {
          return {
            message: "Authentication required",
            status: "FAILURE",
            errors: ["No authentication token available"],
            data: null,
          };
        }
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers,
      });

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      console.error(`API DELETE error for ${endpoint}:`, error);
      return {
        message: "Network error occurred",
        status: "FAILURE",
        errors: [
          "Failed to connect to the server. Please check your internet connection.",
        ],
        data: null,
      };
    }
  }
}
