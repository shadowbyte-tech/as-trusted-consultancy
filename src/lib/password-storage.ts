/**
 * Password storage using MongoDB
 * Replaces file-based storage for production deployment
 */
import { getPassword as getPasswordDB, setPassword as setPasswordDB } from './mongodb-database';

export async function getPassword(email: string): Promise<string | null> {
  return getPasswordDB(email);
}

export async function setPassword(email: string, hashedPassword: string): Promise<void> {
  return setPasswordDB(email, hashedPassword);
}

export async function deletePassword(email: string): Promise<void> {
  // MongoDB will handle this through user deletion
  // No separate action needed
}
