import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
} from "@/types/Auth";
import { BASE_URL } from "@/constants";

const AUTH_TOKEN_KEY = "auth_token";

export class AuthService {
  static async login(
    credentials: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data: ApiResponse<AuthResponse> = await response.json();

      if (data.status === "SUCCESS" && data.data?.token) {
        // Store the JWT token and wait for it to complete
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.data.token);
        // Small delay to ensure storage is complete
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
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

  static async register(
    userData: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data: ApiResponse<AuthResponse> = await response.json();

      if (data.status === "SUCCESS" && data.data?.token) {
        // Store the JWT token and wait for it to complete
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.data.token);
        // Small delay to ensure storage is complete
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return data;
    } catch (error) {
      console.error("Registration error:", error);
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

  static async logout(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  }

  static async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;

    try {
      // Verify the token with the backend
      // Adding a timeout to prevent hanging if the server is unreachable
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`${BASE_URL}/api/protected/verifyUser`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          return data.status === "SUCCESS" && data.data?.success === true;
        }
      } catch (fetchError) {
        console.error("Fetch error during token verification:", fetchError);
        // If it's a timeout or network error, we'll just return false
        // but we won't clear the token as it might be valid when the network is back
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          console.log("Request timed out");
          return false;
        }
      }

      // If verification fails, clear the token
      await this.logout();
      return false;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  }
}
