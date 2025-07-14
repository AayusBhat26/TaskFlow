/**
 * User Service API Client
 * Handles communication with the user service microservice
 */

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

export interface UserServiceResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface UserData {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  completedOnboarding: boolean;
  preferences?: {
    theme: string;
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      desktop: boolean;
      reminders: boolean;
    };
    privacy: {
      profileVisibility: string;
      activityStatus: boolean;
    };
  };
}

class UserServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = USER_SERVICE_URL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<UserServiceResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP Error: ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication endpoints
  async register(userData: {
    email: string;
    password: string;
    username: string;
  }): Promise<UserServiceResponse<{ user: UserData }>> {
    return this.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<UserServiceResponse<{ user: UserData; accessToken: string; refreshToken: string }>> {
    return this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken(refreshToken: string): Promise<UserServiceResponse<{ accessToken: string }>> {
    return this.makeRequest('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(refreshToken: string): Promise<UserServiceResponse> {
    return this.makeRequest('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // User profile endpoints
  async getProfile(userId: string, token?: string): Promise<UserServiceResponse<{ user: UserData }>> {
    return this.makeRequest('/api/users/profile', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async updateProfile(
    profileData: Partial<UserData>,
    token: string
  ): Promise<UserServiceResponse<{ user: UserData }>> {
    return this.makeRequest('/api/users/profile', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(profileData),
    });
  }

  async updatePassword(
    passwordData: {
      currentPassword: string;
      newPassword: string;
    },
    token: string
  ): Promise<UserServiceResponse> {
    return this.makeRequest('/api/users/password', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(passwordData),
    });
  }

  // Health check
  async healthCheck(): Promise<UserServiceResponse> {
    return this.makeRequest('/api/health');
  }
}

export const userService = new UserServiceClient();
