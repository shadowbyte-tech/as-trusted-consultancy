/**
 * MongoDB Database Operations
 * This replaces the JSON file-based database with MongoDB
 */

import { connectDB, Plot, User, Registration, Inquiry, Contact, Password } from './models';
import type { Plot as PlotType, User as UserType, Registration as RegistrationType, Inquiry as InquiryType, Contact as ContactType } from './definitions';

// Initialize database connection
async function initDB() {
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// PLOT OPERATIONS
export async function readPlots(): Promise<PlotType[]> {
  await initDB();
  const plots = await Plot.find({}).sort({ createdAt: -1 }).lean();
  return plots.map(plot => ({
    id: plot._id.toString(),
    plotNumber: plot.plotNumber,
    villageName: plot.villageName,
    areaName: plot.areaName,
    plotSize: plot.plotSize,
    plotFacing: plot.plotFacing,
    imageUrl: plot.imageUrl,
    imageHint: plot.imageHint,
    description: plot.description,
    price: plot.price,
    pricePerSqft: plot.pricePerSqft,
    priceNegotiable: plot.priceNegotiable,
    status: plot.status,
    images: plot.images,
  }));
}

export async function writePlots(plots: PlotType[]): Promise<void> {
  // This function is not needed with MongoDB as we update individually
  // Kept for compatibility
}

export async function createPlot(plotData: Omit<PlotType, 'id'>): Promise<PlotType> {
  await initDB();
  const plot = await Plot.create(plotData);
  return {
    id: plot._id.toString(),
    ...plotData,
  };
}

export async function updatePlot(id: string, plotData: Partial<PlotType>): Promise<PlotType | null> {
  await initDB();
  const plot = await Plot.findByIdAndUpdate(id, plotData, { new: true }).lean();
  if (!plot) return null;
  return {
    id: plot._id.toString(),
    plotNumber: plot.plotNumber,
    villageName: plot.villageName,
    areaName: plot.areaName,
    plotSize: plot.plotSize,
    plotFacing: plot.plotFacing,
    imageUrl: plot.imageUrl,
    imageHint: plot.imageHint,
    description: plot.description,
    price: plot.price,
    pricePerSqft: plot.pricePerSqft,
    priceNegotiable: plot.priceNegotiable,
    status: plot.status,
    images: plot.images,
  };
}

export async function deletePlot(id: string): Promise<boolean> {
  await initDB();
  const result = await Plot.findByIdAndDelete(id);
  return !!result;
}

// USER OPERATIONS
export async function readUsers(): Promise<UserType[]> {
  await initDB();
  const users = await User.find({}).lean();
  return users.map(user => ({
    id: user._id.toString(),
    email: user.email,
    role: user.role as 'Owner' | 'User',
  }));
}

export async function writeUsers(users: UserType[]): Promise<void> {
  // Kept for compatibility
}

export async function createUser(userData: Omit<UserType, 'id'>): Promise<UserType> {
  await initDB();
  const user = await User.create(userData);
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role as 'Owner' | 'User',
  };
}

export async function deleteUser(id: string): Promise<boolean> {
  await initDB();
  const result = await User.findByIdAndDelete(id);
  return !!result;
}

// REGISTRATION OPERATIONS
export async function readRegistrations(): Promise<RegistrationType[]> {
  await initDB();
  const registrations = await Registration.find({}).sort({ createdAt: -1 }).lean();
  return registrations.map(reg => ({
    id: reg._id.toString(),
    name: reg.name,
    phone: reg.phone,
    email: reg.email,
    notes: reg.notes,
    isNew: reg.isNew,
    createdAt: reg.createdAt.toISOString(),
  }));
}

export async function writeRegistrations(registrations: RegistrationType[]): Promise<void> {
  // Kept for compatibility
}

export async function createRegistration(regData: Omit<RegistrationType, 'id'>): Promise<RegistrationType> {
  await initDB();
  const registration = await Registration.create(regData);
  return {
    id: registration._id.toString(),
    name: registration.name,
    phone: registration.phone,
    email: registration.email,
    notes: registration.notes,
    isNew: registration.isNew,
    createdAt: registration.createdAt.toISOString(),
  };
}

export async function markRegistrationsAsRead(): Promise<void> {
  await initDB();
  await Registration.updateMany({ isNew: true }, { isNew: false });
}

// INQUIRY OPERATIONS
export async function readInquiries(): Promise<InquiryType[]> {
  await initDB();
  const inquiries = await Inquiry.find({}).sort({ receivedAt: -1 }).lean();
  return inquiries.map(inq => ({
    id: inq._id.toString(),
    plotNumber: inq.plotNumber,
    name: inq.name,
    email: inq.email,
    message: inq.message,
    receivedAt: inq.receivedAt.toISOString(),
  }));
}

export async function writeInquiries(inquiries: InquiryType[]): Promise<void> {
  // Kept for compatibility
}

export async function createInquiry(inqData: Omit<InquiryType, 'id'>): Promise<InquiryType> {
  await initDB();
  const inquiry = await Inquiry.create(inqData);
  return {
    id: inquiry._id.toString(),
    plotNumber: inquiry.plotNumber,
    name: inquiry.name,
    email: inquiry.email,
    message: inquiry.message,
    receivedAt: inquiry.receivedAt.toISOString(),
  };
}

// CONTACT OPERATIONS
export async function readContacts(): Promise<ContactType[]> {
  await initDB();
  const contacts = await Contact.find({}).sort({ createdAt: -1 }).lean();
  return contacts.map(contact => ({
    id: contact._id.toString(),
    name: contact.name,
    phone: contact.phone,
    email: contact.email,
    type: contact.type as 'Seller' | 'Buyer',
    notes: contact.notes,
  }));
}

export async function writeContacts(contacts: ContactType[]): Promise<void> {
  // Kept for compatibility
}

export async function createContact(contactData: Omit<ContactType, 'id'>): Promise<ContactType> {
  await initDB();
  const contact = await Contact.create(contactData);
  return {
    id: contact._id.toString(),
    name: contact.name,
    phone: contact.phone,
    email: contact.email,
    type: contact.type as 'Seller' | 'Buyer',
    notes: contact.notes,
  };
}

export async function updateContact(id: string, contactData: Partial<ContactType>): Promise<ContactType | null> {
  await initDB();
  const contact = await Contact.findByIdAndUpdate(id, contactData, { new: true }).lean();
  if (!contact) return null;
  return {
    id: contact._id.toString(),
    name: contact.name,
    phone: contact.phone,
    email: contact.email,
    type: contact.type as 'Seller' | 'Buyer',
    notes: contact.notes,
  };
}

export async function deleteContact(id: string): Promise<boolean> {
  await initDB();
  const result = await Contact.findByIdAndDelete(id);
  return !!result;
}

// PASSWORD OPERATIONS
export async function getPassword(email: string): Promise<string | null> {
  await initDB();
  const password = await Password.findOne({ email }).lean();
  return password ? password.hashedPassword : null;
}

export async function setPassword(email: string, hashedPassword: string): Promise<void> {
  await initDB();
  await Password.findOneAndUpdate(
    { email },
    { hashedPassword, updatedAt: new Date() },
    { upsert: true }
  );
}
