
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Plot, User, Inquiry, Contact, Registration, State } from './definitions';
import { 
  readPlots, 
  writePlots, 
  readInquiries, 
  writeInquiries, 
  readRegistrations, 
  writeRegistrations,
  readContacts,
  writeContacts,
  readUsers,
  writeUsers
} from './database';
import { VALIDATION, API_MESSAGES } from './constants';
import { setPassword } from './password-storage';
import bcrypt from 'bcryptjs';

// DATA ACCESS FUNCTIONS
export async function getPlots() {
  try {
    const plots = await readPlots();
    return [...plots].reverse();
  } catch (error) {
    console.error('Error fetching plots:', error);
    return [];
  }
}

export async function getPlotById(id: string) {
  try {
    const plots = await readPlots();
    return plots.find((plot) => plot.id === id);
  } catch (error) {
    console.error('Error fetching plot:', error);
    return undefined;
  }
}

export async function getUsers() {
  try {
    const users = await readUsers();
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function getInquiries() {
  try {
    const inquiries = await readInquiries();
    return [...inquiries].reverse();
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return [];
  }
}

export async function getContacts() {
  try {
    const contacts = await readContacts();
    return [...contacts].reverse();
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

export async function getContactById(id: string) {
  try {
    const contacts = await readContacts();
    return contacts.find((contact) => contact.id === id);
  } catch (error) {
    console.error('Error fetching contact:', error);
    return undefined;
  }
}

export async function getRegistrations() {
  try {
    const registrations = await readRegistrations();
    return [...registrations].reverse();
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return [];
  }
}

export async function getNewRegistrationCount() {
  try {
    const registrations = await readRegistrations();
    return registrations.filter(r => r.isNew).length;
  } catch (error) {
    console.error('Error counting new registrations:', error);
    return 0;
  }
}


// SERVER ACTIONS

const PlotSchema = z.object({
  plotNumber: z.string({ invalid_type_error: 'Please enter a plot number.' })
    .min(1, { message: 'Plot number is required.' })
    .max(VALIDATION.PLOT_NUMBER_MAX_LENGTH, { message: `Plot number must be less than ${VALIDATION.PLOT_NUMBER_MAX_LENGTH} characters.` }),
  villageName: z.string()
    .min(1, { message: 'Village name is required.' })
    .max(VALIDATION.NAME_MAX_LENGTH, { message: `Village name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters.` }),
  areaName: z.string()
    .min(1, { message: 'Area name is required.' })
    .max(VALIDATION.NAME_MAX_LENGTH, { message: `Area name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters.` }),
  plotSize: z.string().min(1, { message: 'Plot size is required.' }),
  plotFacing: z.enum(['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'], {
    invalid_type_error: 'Please select a plot facing direction.',
  }),
  description: z.string()
    .max(VALIDATION.DESCRIPTION_MAX_LENGTH, { message: `Description must be less than ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters.` })
    .optional(),
  price: z.string().optional(),
  priceNegotiable: z.string().optional(),
  status: z.enum(['Available', 'Reserved', 'Sold', 'Under Negotiation']).optional(),
});

const ImageSchema = z.instanceof(File, { message: API_MESSAGES.ERROR.IMAGE_REQUIRED })
  .refine((file) => file.size === 0 || file.type.startsWith("image/"), API_MESSAGES.ERROR.INVALID_IMAGE)
  .refine((file) => file.size < VALIDATION.IMAGE_MAX_SIZE, API_MESSAGES.ERROR.IMAGE_TOO_LARGE);

async function checkDuplicatePlot(plotNumber: string, villageName: string, currentId?: string) {
    const plots = await readPlots();
    const existingPlot = plots.find(p => p.plotNumber.toLowerCase() === plotNumber.toLowerCase() && p.villageName.toLowerCase() === villageName.toLowerCase());
    if (existingPlot && existingPlot.id !== currentId) {
        return true;
    }
    return false;
}

async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}


export async function createPlot(prevState: State, formData: FormData): Promise<State> {
  try {
    const validatedFields = PlotSchema.safeParse(Object.fromEntries(formData.entries()));
    
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Failed to create plot. Please check all text fields.',
        success: false,
      };
    }
    
    const imageFile = formData.get('imageUrl') as File;
    if (!imageFile || imageFile.size === 0) {
      return {
        errors: { imageUrl: [API_MESSAGES.ERROR.IMAGE_REQUIRED] },
        message: API_MESSAGES.ERROR.IMAGE_REQUIRED,
        success: false,
      }
    }

    const validatedImage = ImageSchema.safeParse(imageFile);
    if (!validatedImage.success) {
      const imageErrors = validatedImage.error.issues.map(issue => issue.message);
      return {
        errors: { imageUrl: imageErrors },
        message: 'Image validation failed. Please provide a valid image file.',
        success: false,
      };
    }
    
    const { plotNumber, villageName } = validatedFields.data;
    if (await checkDuplicatePlot(plotNumber, villageName)) {
      return {
        message: API_MESSAGES.ERROR.PLOT_EXISTS,
        success: false,
      }
    }

    const imageUrl = await fileToDataUrl(validatedImage.data);

    // Process price and calculate price per sqft
    const price = validatedFields.data.price ? parseFloat(validatedFields.data.price) : undefined;
    const priceNegotiable = validatedFields.data.priceNegotiable === 'true';
    const status = validatedFields.data.status || 'Available';
    
    // Calculate price per sqft if price and size are available
    let pricePerSqft: number | undefined;
    if (price && validatedFields.data.plotSize) {
      const sizeMatch = validatedFields.data.plotSize.match(/(\d+)/);
      if (sizeMatch) {
        const size = parseInt(sizeMatch[1]);
        pricePerSqft = Math.round(price / size);
      }
    }

    const newPlot: Plot = {
      id: Date.now().toString(),
      ...validatedFields.data,
      imageUrl: imageUrl,
      imageHint: 'custom upload',
      price,
      pricePerSqft,
      priceNegotiable,
      status: status as any,
    };

    const plots = await readPlots();
    plots.push(newPlot);
    await writePlots(plots);

    revalidatePath('/dashboard');
    revalidatePath('/plots');
    
    return {
      success: true,
      message: API_MESSAGES.SUCCESS.PLOT_CREATED,
      plotId: newPlot.id,
    };
  } catch (error) {
    console.error('Error creating plot:', error);
    return {
      success: false,
      message: API_MESSAGES.ERROR.INTERNAL_ERROR,
    };
  }
}

export async function updatePlot(id: string, prevState: State, formData: FormData): Promise<State> {
  try {
    const validatedFields = PlotSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Failed to update plot. Please check all text fields.',
        success: false,
      };
    }
    
    const { plotNumber, villageName } = validatedFields.data;
    if (await checkDuplicatePlot(plotNumber, villageName, id)) {
      return {
        message: 'Another plot with this number already exists in the same village.',
        success: false,
      }
    }

    const plots = await readPlots();
    const plotIndex = plots.findIndex((p) => p.id === id);
    if (plotIndex === -1) {
      return { message: API_MESSAGES.ERROR.PLOT_NOT_FOUND, success: false };
    }
    
    // Process price and calculate price per sqft
    const price = validatedFields.data.price ? parseFloat(validatedFields.data.price) : undefined;
    const priceNegotiable = validatedFields.data.priceNegotiable === 'true';
    const status = validatedFields.data.status || plots[plotIndex].status || 'Available';
    
    // Calculate price per sqft if price and size are available
    let pricePerSqft: number | undefined;
    if (price && validatedFields.data.plotSize) {
      const sizeMatch = validatedFields.data.plotSize.match(/(\d+)/);
      if (sizeMatch) {
        const size = parseInt(sizeMatch[1]);
        pricePerSqft = Math.round(price / size);
      }
    }
    
    const updatedPlot: Plot = { 
      ...plots[plotIndex], 
      ...validatedFields.data,
      price,
      pricePerSqft,
      priceNegotiable,
      status: status as any,
    };
    
    const imageFile = formData.get('imageUrl') as File;
    if (imageFile && imageFile.size > 0) {
      const validatedImage = ImageSchema.safeParse(imageFile);
      if (!validatedImage.success) {
        const imageErrors = validatedImage.error.issues.map(issue => issue.message);
        return {
          errors: { imageUrl: imageErrors },
          message: 'Image validation failed.',
          success: false,
        }
      }
      updatedPlot.imageUrl = await fileToDataUrl(validatedImage.data);
      updatedPlot.imageHint = 'custom upload';
    }

    plots[plotIndex] = updatedPlot;
    await writePlots(plots);

    revalidatePath('/dashboard');
    revalidatePath('/plots');
    revalidatePath(`/plots/${id}`);
    revalidatePath(`/plots/${id}/edit`);
    
    return {
      success: true,
      message: API_MESSAGES.SUCCESS.PLOT_UPDATED,
      plotId: id,
    };
  } catch (error) {
    console.error('Error updating plot:', error);
    return {
      success: false,
      message: API_MESSAGES.ERROR.INTERNAL_ERROR,
    };
  }
}

export async function deletePlot(id: string): Promise<{ success: boolean; message: string }> {
  try {
    let plots = await readPlots();
    const plotIndex = plots.findIndex((plot) => plot.id === id);
    
    if (plotIndex === -1) {
      return {
        success: false,
        message: API_MESSAGES.ERROR.PLOT_NOT_FOUND
      };
    }

    plots.splice(plotIndex, 1);
    await writePlots(plots);
    
    revalidatePath('/dashboard');
    revalidatePath('/plots');
    
    return {
      success: true,
      message: API_MESSAGES.SUCCESS.PLOT_DELETED
    };
  } catch (error) {
    console.error('Failed to delete plot:', error);
    return {
      success: false,
      message: API_MESSAGES.ERROR.INTERNAL_ERROR
    };
  }
}

// USER MANAGEMENT ACTIONS
const UserSchema = z.object({
  email: z.string()
    .email({ message: "Please enter a valid email address." })
    .max(VALIDATION.EMAIL_MAX_LENGTH, { message: `Email must be less than ${VALIDATION.EMAIL_MAX_LENGTH} characters.` }),
  password: z.string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, { message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long.` })
    .max(VALIDATION.PASSWORD_MAX_LENGTH, { message: `Password must be less than ${VALIDATION.PASSWORD_MAX_LENGTH} characters.` })
});

export async function createUser(prevState: State, formData: FormData): Promise<State> {
  try {
    const validatedFields = UserSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password')
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Failed to create user.',
        success: false,
      };
    }
    
    const { email, password } = validatedFields.data;

    const users = await readUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return {
        message: API_MESSAGES.ERROR.USER_EXISTS,
        success: false,
      };
    }

    const newUser: User = {
      id: `u${Date.now()}`,
      email: email,
      role: 'User',
    };

    // Hash and store password
    const hashedPassword = await bcrypt.hash(password, 10);
    await setPassword(email, hashedPassword);

    users.push(newUser);
    await writeUsers(users);
    
    revalidatePath('/dashboard/users');
    redirect('/dashboard/users');
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      message: API_MESSAGES.ERROR.INTERNAL_ERROR,
    };
  }
}


export async function deleteUser(id: string) {
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === id);
    
    if (user?.role === 'Owner') {
      console.warn("Attempted to delete the owner account. Action prevented.");
      return;
    }
    
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex > -1) {
      users.splice(userIndex, 1);
      await writeUsers(users);
    }
    
    revalidatePath('/dashboard/users');
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

export async function changeUserPassword(userId: string, newPassword: string) {
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await setPassword(user.email, hashedPassword);
      return { success: true, message: API_MESSAGES.SUCCESS.PASSWORD_CHANGED };
    }
    
    return { success: false, message: API_MESSAGES.ERROR.USER_NOT_FOUND };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, message: API_MESSAGES.ERROR.INTERNAL_ERROR };
  }
}

export async function verifyUserCredentials(email: string, password: string): Promise<{ success: boolean; message?: string; role?: User['role'] }> {
  try {
    const users = await readUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, message: 'No user found with this email.' };
    }

    if (user.role === 'Owner') {
      return { success: false, message: 'Owners must use the Owner Sign In page.' };
    }

    // NOTE: In a real application, you would securely hash and compare passwords.
    // For this demo, we accept any password for a valid user email.
    console.log(`Login attempt for ${email}`);

    return { success: true, role: user.role };
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return { success: false, message: API_MESSAGES.ERROR.INTERNAL_ERROR };
  }
}

// INQUIRY ACTIONS
const InquirySchema = z.object({
  name: z.string()
    .min(1, 'Name is required.')
    .max(VALIDATION.NAME_MAX_LENGTH, `Name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters.`),
  email: z.string()
    .email('A valid email is required.')
    .max(VALIDATION.EMAIL_MAX_LENGTH, `Email must be less than ${VALIDATION.EMAIL_MAX_LENGTH} characters.`),
  message: z.string()
    .min(VALIDATION.MESSAGE_MIN_LENGTH, `Message must be at least ${VALIDATION.MESSAGE_MIN_LENGTH} characters.`)
    .max(VALIDATION.MESSAGE_MAX_LENGTH, `Message must be less than ${VALIDATION.MESSAGE_MAX_LENGTH} characters.`),
  plotNumber: z.string(),
});

export async function saveInquiry(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const validatedFields = InquirySchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      plotNumber: formData.get('plotNumber'),
    });

    if (!validatedFields.success) {
      console.error(validatedFields.error);
      return { success: false, message: API_MESSAGES.ERROR.INVALID_INPUT };
    }

    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      receivedAt: new Date().toISOString(),
      ...validatedFields.data,
    };
    
    const inquiries = await readInquiries();
    inquiries.push(newInquiry);
    await writeInquiries(inquiries);

    revalidatePath('/dashboard/inquiries');

    return { success: true, message: API_MESSAGES.SUCCESS.INQUIRY_SUBMITTED };
  } catch (error) {
    console.error('Error saving inquiry:', error);
    return { success: false, message: API_MESSAGES.ERROR.INTERNAL_ERROR };
  }
}

// CONTACT ACTIONS
const ContactSchema = z.object({
  name: z.string()
    .min(1, 'Name is required.')
    .max(VALIDATION.NAME_MAX_LENGTH, `Name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters.`),
  phone: z.string()
    .min(1, 'Phone number is required.')
    .max(VALIDATION.PHONE_MAX_LENGTH, `Phone must be less than ${VALIDATION.PHONE_MAX_LENGTH} characters.`),
  email: z.string()
    .email('Please enter a valid email.')
    .max(VALIDATION.EMAIL_MAX_LENGTH, `Email must be less than ${VALIDATION.EMAIL_MAX_LENGTH} characters.`),
  type: z.enum(['Seller', 'Buyer'], { invalid_type_error: 'Please select a contact type.' }),
  notes: z.string()
    .max(VALIDATION.NOTES_MAX_LENGTH, `Notes must be less than ${VALIDATION.NOTES_MAX_LENGTH} characters.`)
    .optional(),
});

export async function createContact(prevState: State, formData: FormData): Promise<State> {
  try {
    const validatedFields = ContactSchema.safeParse({
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      type: formData.get('type'),
      notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Failed to create contact.',
        success: false,
      };
    }
    
    const contacts = await readContacts();
    const existingContact = contacts.find(c => c.email.toLowerCase() === validatedFields.data.email.toLowerCase());
    if (existingContact) {
      return {
        message: API_MESSAGES.ERROR.CONTACT_EXISTS,
        success: false,
      }
    }

    const newContact: Contact = {
      id: `con-${Date.now()}`,
      ...validatedFields.data,
    };

    contacts.push(newContact);
    await writeContacts(contacts);
    
    revalidatePath('/dashboard/contacts');
    redirect('/dashboard/contacts');
  } catch (error) {
    console.error('Error creating contact:', error);
    return {
      success: false,
      message: API_MESSAGES.ERROR.INTERNAL_ERROR,
    };
  }
}

export async function updateContact(id: string, prevState: State, formData: FormData): Promise<State> {
  try {
    const validatedFields = ContactSchema.safeParse({
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      type: formData.get('type'),
      notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Failed to update contact.',
        success: false,
      };
    }
    
    const contacts = await readContacts();
    const existingContact = contacts.find(c => c.email.toLowerCase() === validatedFields.data.email.toLowerCase() && c.id !== id);
    if (existingContact) {
      return {
        message: 'Another contact with this email already exists.',
        success: false,
      }
    }

    const contactIndex = contacts.findIndex((c) => c.id === id);

    if (contactIndex === -1) {
      return { message: API_MESSAGES.ERROR.CONTACT_NOT_FOUND, success: false };
    }
    
    contacts[contactIndex] = { id, ...validatedFields.data };
    await writeContacts(contacts);
    
    revalidatePath('/dashboard/contacts');
    redirect('/dashboard/contacts');
  } catch (error) {
    console.error('Error updating contact:', error);
    return {
      success: false,
      message: API_MESSAGES.ERROR.INTERNAL_ERROR,
    };
  }
}


export async function deleteContact(id: string) {
  try {
    const contacts = await readContacts();
    const contactIndex = contacts.findIndex((c) => c.id === id);
    if (contactIndex > -1) {
      contacts.splice(contactIndex, 1);
      await writeContacts(contacts);
    }
    revalidatePath('/dashboard/contacts');
  } catch (error) {
    console.error('Error deleting contact:', error);
  }
}

// REGISTRATION ACTIONS
const RegistrationSchema = z.object({
  name: z.string()
    .min(1, 'Name is required.')
    .max(VALIDATION.NAME_MAX_LENGTH, `Name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters.`),
  phone: z.string()
    .min(1, 'A valid phone number is required.')
    .max(VALIDATION.PHONE_MAX_LENGTH, `Phone must be less than ${VALIDATION.PHONE_MAX_LENGTH} characters.`),
  email: z.string()
    .email('A valid email is required.')
    .max(VALIDATION.EMAIL_MAX_LENGTH, `Email must be less than ${VALIDATION.EMAIL_MAX_LENGTH} characters.`),
  notes: z.string()
    .max(VALIDATION.NOTES_MAX_LENGTH, `Notes must be less than ${VALIDATION.NOTES_MAX_LENGTH} characters.`)
    .optional(),
});

export async function createRegistration(prevState: State, formData: FormData): Promise<State> {
  try {
    const validatedFields = RegistrationSchema.safeParse({
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Failed to submit registration. Please check the fields.',
        success: false,
      };
    }
    
    const { email } = validatedFields.data;
    const currentRegistrations = await readRegistrations();
    const existingRegistration = currentRegistrations.find(r => r.email.toLowerCase() === email.toLowerCase());
    if (existingRegistration) {
      return {
        success: false,
        message: API_MESSAGES.ERROR.REGISTRATION_EXISTS
      };
    }

    const newRegistration: Registration = {
      id: `reg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...validatedFields.data,
      isNew: true,
    };

    currentRegistrations.push(newRegistration);
    await writeRegistrations(currentRegistrations);
    revalidatePath('/dashboard/registrations');
    revalidatePath('/dashboard', 'layout');

    return {
      success: true,
      message: API_MESSAGES.SUCCESS.REGISTRATION_SUBMITTED,
      registration: newRegistration,
    };
  } catch (error) {
    console.error('Error creating registration:', error);
    return {
      success: false,
      message: API_MESSAGES.ERROR.INTERNAL_ERROR,
    };
  }
}

export async function markRegistrationsAsRead() {
  try {
    const registrations = await readRegistrations();
    const hasNewRegistrations = registrations.some(r => r.isNew);
    
    if (hasNewRegistrations) {
      registrations.forEach(r => {
        if (r.isNew) {
          r.isNew = false;
        }
      });
      await writeRegistrations(registrations);
      revalidatePath('/dashboard', 'layout');
    }
  } catch (error) {
    console.error('Error marking registrations as read:', error);
  }
}

    
