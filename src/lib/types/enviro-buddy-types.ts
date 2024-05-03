export interface User {
    name: string;
    brand: string;
    type: string;
    user_id: string;
  }
export interface carTypes {
    carName: string;
    carRange: string;
    carType: string;
    imageUrl: string;
    userId: string;
}
export interface Counties {
    _id: string;
    county: string;
    userid: string;
}
export interface Dealers {
    address: string;
    countyId: string;
    email: string;
    latitude: number;
    longitude: number;
    name: string;
    phone: string;
    userid: string;
    website: string;
}
export interface AuthUser {
    email: string;
    password: string;
  }
export interface UserCredential {
    user: User;
  }
export interface AuthUserCredential {
    user: AuthUser;
  }
export interface ResetPassword {
    email: string;
  }
  export interface Token { 
    token: string;
    email: string;
  }
export interface TokenResponse {
    token: string;
  }
export interface UserResponse {
    user: User;
  }
  export interface UserListResponse {
    users: User[];
  }
  export interface ErrorResponse {
    error: string;
  }
  export interface SuccessResponse {
    message: string;
  }
  export interface AuthResponse {
    user: AuthUser;
  }
  export interface AuthUserResponse {
    user: AuthUser;
  }
  export interface AuthUserListResponse {
    users: AuthUser[];
  }
  export interface AuthErrorResponse {
    error: string;
  }
  export interface AuthSuccessResponse {
    message: string;
  }
  export interface AuthToken {
    token: string;
    email: string;
  }
  export interface AuthTokenResponse {
    token: string;
  }