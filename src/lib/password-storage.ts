/**
 * Password storage for demo purposes
 * In production, use a proper database with secure password hashing
 */
import fs from 'fs/promises';
import path from 'path';

const passwordDataPath = path.join(process.cwd(), 'src', 'lib', 'password-data.json');

interface PasswordStore {
  [email: string]: string; // email -> hashed password
}

// Default demo passwords (hashed with bcrypt)
const defaultPasswords: PasswordStore = {
  'swamy@consult.com': '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
  'user@consult.com': '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
};

export async function readPasswords(): Promise<PasswordStore> {
  try {
    const fileContent = await fs.readFile(passwordDataPath, 'utf-8');
    return JSON.parse(fileContent) as PasswordStore;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist, return default passwords
      return { ...defaultPasswords };
    }
    console.error('Failed to read password data:', error);
    return { ...defaultPasswords };
  }
}

export async function writePasswords(passwords: PasswordStore): Promise<void> {
  try {
    await fs.mkdir(path.dirname(passwordDataPath), { recursive: true });
    await fs.writeFile(passwordDataPath, JSON.stringify(passwords, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write password data:', error);
  }
}

export async function getPassword(email: string): Promise<string | null> {
  const passwords = await readPasswords();
  return passwords[email] || null;
}

export async function setPassword(email: string, hashedPassword: string): Promise<void> {
  const passwords = await readPasswords();
  passwords[email] = hashedPassword;
  await writePasswords(passwords);
}

export async function deletePassword(email: string): Promise<void> {
  const passwords = await readPasswords();
  delete passwords[email];
  await writePasswords(passwords);
}
