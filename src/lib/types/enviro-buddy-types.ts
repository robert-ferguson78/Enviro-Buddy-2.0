import 'firebase/firestore';
import { Timestamp } from '@firebase/firestore';

export interface SignUpUser {
    name: string;
    brand: string;
    type: string;
    email: string;
    password: string;
}
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

export interface carType {
  id: string;
  carName: string;
  carType: string;
  carRange: string;
  image: string;
  additionalImages?: string[];
}

export interface Counties {
    _id: string;
    county: string;
    userid: string;
}
export interface NewCounty {
  county: string;
}

export interface CountyData {
  _id: string;
  county: string;
}

export interface Dealer {
  _id: string;
  userId: string;
  countyId: string;
  brand: string;
  county: string;
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
export interface UserData {
  user_id: string;
  user_name: string;
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

  export interface Chat {
    id: string;
    timestamp?: Timestamp;
    unreadCount?: number;
}

  export type Review = {
    id: string;
    userId: string;
    userName: string;
    message: string;
    timestamp?: Timestamp;
  };

  export type County = {
    _id: string;
    county: string;
  };

  export interface Locals {
    user?: User;
  }