import { ApiService } from './ApiService';

// Define the User interface
export interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  userStatus: 'ONLINE' | 'OFFLINE';
  createdAt: string;
  updatedAt: string;
}

/**
 * UserService provides methods for user-related API calls
 */
export class UserService {
  /**
   * Get the current user's information
   * @returns The user information
   */
  static async getCurrentUser() {
    return ApiService.get<{ user: User }>('/api/protected/getUserInfo');
  }

  /**
   * Get a list of all connected users
   * @returns List of connected users
   */
  static async getConnectedUsers() {
    return ApiService.get<User[]>('/api/users');
  }

  /**
   * Update the user's profile
   * @param userData The user data to update
   * @returns The updated user
   */
  static async updateProfile(userData: Partial<User>) {
    return ApiService.put<User>('/api/protected/updateProfile', userData);
  }
}
