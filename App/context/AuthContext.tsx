import React, { createContext, useState, useContext, useEffect } from "react";
import { AuthService } from "@/services/AuthService";
import { BASE_URL } from "@/constants";

// Define user interface
export interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  createdAt?: string;
  contacts?: any[];
}

// Define the shape of our context
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({}),
  register: async () => ({}),
  logout: async () => {},
  refreshAuthState: async () => {},
  user: null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // Check if the user is authenticated on mount
  useEffect(() => {
    refreshAuthState();
  }, []);

  // Function to refresh the authentication state
  const refreshAuthState = async () => {
    setIsLoading(true);
    try {
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Fetch real user data from the API
        try {
          const token = await AuthService.getToken();

          // Add timeout to prevent hanging if server is unreachable
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          try {
            const response = await fetch(
              `${BASE_URL}/api/protected/getUserInfo`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                signal: controller.signal,
              }
            );

            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              if (data.status === "SUCCESS" && data.data) {
                setUser(data.data as User);
              } else {
                // Create a placeholder user if API fails but token exists
                setUser({
                  _id: "local-user",
                  name: "User",
                  email: "user@example.com",
                });
              }
            } else {
              // Create a placeholder user if API fails but token exists
              setUser({
                _id: "local-user",
                name: "User",
                email: "user@example.com",
              });
            }
          } catch (fetchError) {
            console.error(
              "Fetch error during user data retrieval:",
              fetchError
            );
            // Create a placeholder user if API fails but token exists
            setUser({
              _id: "local-user",
              name: "User",
              email: "user@example.com",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Create a placeholder user if API fails but token exists
          setUser({
            _id: "local-user",
            name: "User",
            email: "user@example.com",
          });
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await AuthService.login({ email, password });
      if (response.status === "SUCCESS") {
        setIsAuthenticated(true);
        // Set a basic user object immediately for better UX
        setUser({
          _id: "temp-user",
          name: email.split("@")[0], // Use part of email as name
          email: email,
        });

        // Fetch real user data after login
        try {
          const token = await AuthService.getToken();

          // Add timeout to prevent hanging if server is unreachable
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          try {
            const userResponse = await fetch(
              `${BASE_URL}/api/protected/getUserInfo`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                signal: controller.signal,
              }
            );

            clearTimeout(timeoutId);

            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData.status === "SUCCESS" && userData.data) {
                setUser(userData.data as User);
              }
            }
          } catch (fetchError) {
            console.error(
              "Fetch error during user data retrieval after login:",
              fetchError
            );
            // We already set a basic user above, so no need to do anything here
          }
        } catch (error) {
          console.error("Error fetching user data after login:", error);
          // We already set a basic user above, so no need to do anything here
        }
      }
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await AuthService.register({ name, email, password });
      if (response.status === "SUCCESS") {
        setIsAuthenticated(true);
        // Set a basic user object immediately for better UX
        setUser({
          _id: "temp-user",
          name: name,
          email: email,
        });

        // Fetch real user data after registration
        try {
          const token = await AuthService.getToken();

          // Add timeout to prevent hanging if server is unreachable
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          try {
            const userResponse = await fetch(
              `${BASE_URL}/api/protected/getUserInfo`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                signal: controller.signal,
              }
            );

            clearTimeout(timeoutId);

            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData.status === "SUCCESS" && userData.data) {
                setUser(userData.data as User);
              }
            }
          } catch (fetchError) {
            console.error(
              "Fetch error during user data retrieval after registration:",
              fetchError
            );
            // We already set a basic user above, so no need to do anything here
          }
        } catch (error) {
          console.error("Error fetching user data after registration:", error);
          // We already set a basic user above, so no need to do anything here
        }
      }
      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Provide the auth context value
  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    register,
    logout,
    refreshAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
