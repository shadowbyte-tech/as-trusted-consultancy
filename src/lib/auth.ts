import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readUsers } from './database';
import type { User } from './definitions';
import { AuthenticationError, ValidationError } from './errors';
import { getPassword, setPassword } from './password-storage';
import { VALIDATION, JWT_CONFIG } from './constants';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

if (JWT_SECRET === 'your-secret-key-change-in-production') {
  console.warn('⚠️  WARNING: Using default JWT_SECRET. Set JWT_SECRET environment variable in production!');
}

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

/**
 * Validates password strength
 */
function validatePassword(password: string): void {
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    throw new ValidationError(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`);
  }
  if (password.length > VALIDATION.PASSWORD_MAX_LENGTH) {
    throw new ValidationError(`Password must be less than ${VALIDATION.PASSWORD_MAX_LENGTH} characters`);
  }
  // Add more password strength requirements as needed
  // e.g., require uppercase, lowercase, numbers, special characters
}

/**
 * Authenticates a user with email and password
 */
export async function authenticateUser(credentials: LoginCredentials): Promise<AuthUser | null> {
  const { email, password } = credentials;
  
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  // Find user in our database
  const users = await readUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return null;
  }

  // Get stored password hash
  const storedPassword = await getPassword(user.email);
  if (!storedPassword) {
    console.error(`No password found for user: ${user.email}`);
    return null;
  }

  // Verify password
  const isValid = await bcrypt.compare(password, storedPassword);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

/**
 * Registers a new user
 */
export async function registerUser(data: RegisterData): Promise<AuthUser | null> {
  const { email, password, name, role = 'User' } = data;
  
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  // Validate password strength
  validatePassword(password);

  // Check if user already exists
  const users = await readUsers();
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return null;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create new user
  const newUser: User = {
    id: `user_${Date.now()}`,
    email,
    role: role as 'User' | 'Owner',
  };

  // Store password
  await setPassword(email, hashedPassword);

  return {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  };
}

/**
 * Generates a JWT token for a user
 */
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_CONFIG.EXPIRES_IN }
  );
}

/**
 * Verifies a JWT token and returns the user data
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log('Invalid token');
    }
    return null;
  }
}

/**
 * Extracts and verifies the session user from a request
 */
export function getSessionUser(request: Request): AuthUser | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

/**
 * Changes a user's password
 */
export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
  const users = await readUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    throw new AuthenticationError('User not found');
  }

  // Validate new password
  validatePassword(newPassword);

  // Get stored password
  const storedPassword = await getPassword(user.email);
  if (!storedPassword) {
    throw new AuthenticationError('No password set for this user');
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, storedPassword);
  if (!isValid) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Hash and store new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await setPassword(user.email, hashedPassword);
  
  return true;
}
