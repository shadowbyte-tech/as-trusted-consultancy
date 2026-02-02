import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users } from './database';
import type { User } from './definitions';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

// Mock password storage for demo users
const userPasswords: Record<string, string> = {
  'swamy@consult.com': '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
  'user@consult.com': '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
};

export async function authenticateUser(credentials: LoginCredentials): Promise<AuthUser | null> {
  const { email, password } = credentials;
  
  // Find user in our database
  const user = users.find(u => u.email === email);
  if (!user) {
    return null;
  }

  // For demo users, check against mock passwords
  const storedPassword = userPasswords[email];
  if (storedPassword) {
    const isValid = await bcrypt.compare(password, storedPassword);
    if (!isValid) {
      return null;
    }
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

export async function registerUser(data: RegisterData): Promise<AuthUser | null> {
  const { email, password, name, role = 'User' } = data;
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return null;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // In a real implementation, you'd save this to your database
  // For now, we'll create a mock user
  const newUser: User = {
    id: `user_${Date.now()}`,
    email,
    role: role as 'User' | 'Owner',
  };

  // Store the password (in production, this would be in a secure database)
  userPasswords[email] = hashedPassword;

  return {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  };
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function getSessionUser(request: Request): AuthUser | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
  const user = users.find(u => u.id === userId);
  if (!user) {
    return false;
  }

  const storedPassword = userPasswords[user.email];
  if (!storedPassword) {
    return false;
  }

  const isValid = await bcrypt.compare(currentPassword, storedPassword);
  if (!isValid) {
    return false;
  }

  // Hash new password and update
  userPasswords[user.email] = await bcrypt.hash(newPassword, 10);
  return true;
}
