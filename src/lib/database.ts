
/**
 * @file Custom data layer for the application.
 * This provides a file-based data storage solution for development and small-scale deployments.
 * For production, consider migrating to PostgreSQL, MongoDB, or another production database.
 *
 * The data is exported from this file and imported into the server actions.
 * This ensures that all server actions are operating on the same data array in memory.
 */
import fs from 'fs/promises';
import path from 'path';
import type { Plot, User, Inquiry, Contact, Registration } from './definitions';

const plotDataPath = path.join(process.cwd(), 'src', 'lib', 'plot-data.json');
const inquiryDataPath = path.join(process.cwd(), 'src', 'lib', 'inquiry-data.json');

export async function readPlots(): Promise<Plot[]> {
  try {
    const fileContent = await fs.readFile(plotDataPath, 'utf-8');
    const plots = JSON.parse(fileContent);
    return plots as Plot[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Failed to read plot data:', error);
    return [];
  }
}

export async function writePlots(plots: Plot[]): Promise<void> {
  try {
    await fs.writeFile(plotDataPath, JSON.stringify(plots, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write plot data:', error);
  }
}

export async function readInquiries(): Promise<Inquiry[]> {
  try {
    const fileContent = await fs.readFile(inquiryDataPath, 'utf-8');
    const inquiries = JSON.parse(fileContent);
    return inquiries as Inquiry[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Failed to read inquiry data:', error);
    return [];
  }
}

export async function writeInquiries(inquiries: Inquiry[]): Promise<void> {
  try {
    await fs.writeFile(inquiryDataPath, JSON.stringify(inquiries, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write inquiry data:', error);
  }
}


// --- USERS DATA ---
// The owner is the only default user.
export const users: User[] = [
  { id: 'u1', email: 'swamy@consult.com', role: 'Owner' },
  { id: 'u2', email: 'user@consult.com', role: 'User' },
];

// --- CONTACTS DATA ---
export const contacts: Contact[] = [
    { id: 'con-1', name: 'Ravi Kumar', phone: '+91 98765 43210', email: 'ravi.k@example.com', type: 'Seller', notes: 'Has a 2400 sqft plot in Greenwood. Wants to sell quickly.' },
    { id: 'con-2', name: 'Priya Sharma', phone: '+91 87654 32109', email: 'priya.s@example.com', type: 'Buyer', notes: 'Looking for a North-facing plot in Sunrise Valley. Budget is flexible.' },
];

// --- REGISTRATIONS DATA ---
export const registrations: Registration[] = [
    { id: 'reg-1', name: 'Arjun Mehra', phone: '+91 99887 76655', email: 'arjun.m@example.com', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Interested in investment properties.', isNew: true },
    { id: 'reg-2', name: 'Sneha Patel', phone: '+91 88776 65544', email: 'sneha.p@example.com', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), notes: 'First-time home buyer, needs guidance on the process.', isNew: true },
];
