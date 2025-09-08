export interface User {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
}

export interface Note {
  createdBy: string | undefined;
  createdByName?: string;
  id: string;
  title: string;
  content: string;
  photoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  likes: string[];
  comments: {
    _id: string;
    text: string;
    userId: string;
    userName: string;
    createdAt: string;
  }[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SignupData {
  fullName: string;
  email: string;
  dateOfBirth: string;
  otp: string;
}

export interface SigninData {
  email: string;
  otp: string;
}