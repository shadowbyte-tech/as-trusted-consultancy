
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Plot, User, Inquiry, Contact, Registration, State } from './definitions';
import { users, contacts, registrations, readPlots, writePlots, readInquiries, writeInquiries, readRegistrations, writeRegistrations } from './database';

// DATA ACCESS FUNCTIONS
export async function getPlots() {
  const plots = await readPlots();
  return [...plots].reverse();
}

export async function getPlotById(id: string) {
  const plots = await readPlots();
  return plots.find((plot) => plot.id === id);
}

export async function getUsers() {
    return users;
}

export async function getInquiries() {
    const inquiries = await readInquiries();
    return [...inquiries].reverse();
}

export async function getContacts() {
    return [...contacts].reverse();
}

export async function getContactById(id: string) {
    return contacts.find((contact) => contact.id === id);
}

export async function getRegistrations() {
    const registrations = await readRegistrations();
    return [...registrations].reverse();
}

export async function getNewRegistrationCount() {
    return registrations.filter(r => r.isNew).length;
}


// SERVER ACTIONS

const PlotSchema = z.object({
  plotNumber: z.string({ invalid_type_error: 'Please enter a plot number.' }).min(1, { message: 'Plot number is required.' }),
  villageName: z.string().min(1, { message: 'Village name is required.' }),
  areaName: z.string().min(1, { message: 'Area name is required.' }),
  plotSize: z.string().min(1, { message: 'Plot size is required.' }),
  plotFacing: z.enum(['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'], {
    invalid_type_error: 'Please select a plot facing direction.',
  }),
  description: z.string().optional(),
});

const ImageSchema = z.instanceof(File, { message: "Image is required." })
  .refine((file) => file.size === 0 || file.type.startsWith("image/"), "Only images are allowed.")
  .refine((file) => file.size < 4 * 1024 * 1024, "Image must be less than 4MB.");

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
          errors: { imageUrl: ["An image file is required."] },
          message: 'An image is required to create a plot.',
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
        message: 'A plot with this number already exists in the same village.',
        success: false,
    }
  }

  const imageUrl = await fileToDataUrl(validatedImage.data);

  const newPlot: Plot = {
    id: Date.now().toString(),
    ...validatedFields.data,
    imageUrl: imageUrl,
    imageHint: 'custom upload',
  };

  const plots = await readPlots();
  plots.push(newPlot);
  await writePlots(plots);

  revalidatePath('/dashboard');
  revalidatePath('/plots');
  
  return {
    success: true,
    message: 'Plot created successfully.',
    plotId: newPlot.id,
  };
}

export async function updatePlot(id: string, prevState: State, formData: FormData): Promise<State> {
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
      return { message: 'Plot not found.', success: false };
  }
  
  const updatedPlot = { ...plots[plotIndex], ...validatedFields.data };
  
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
    message: 'Plot updated successfully.',
    plotId: id,
  };
}

export async function deletePlot(id: string): Promise<{ success: boolean; message: string }> {
  try {
    let plots = await readPlots();
    const plotIndex = plots.findIndex((plot) => plot.id === id);
    
    if (plotIndex === -1) {
      return {
        success: false,
        message: 'Plot not found.'
      };
    }

    plots.splice(plotIndex, 1);
    await writePlots(plots);
    
    revalidatePath('/dashboard');
    revalidatePath('/plots');
    
    return {
      success: true,
      message: 'Plot deleted successfully.'
    };
  } catch (error) {
    console.error('Failed to delete plot:', error);
    return {
      success: false,
      message: 'Failed to delete plot. Please try again.'
    };
  }
}

// USER MANAGEMENT ACTIONS
const UserSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long." })
});

export async function createUser(prevState: State, formData: FormData): Promise<State> {
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
    
    const { email } = validatedFields.data;

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        return {
            message: 'A user with this email already exists.',
            success: false,
        };
    }

    const newUser: User = {
        id: `u${Date.now()}`,
        email: email,
        role: 'User',
    };

    users.push(newUser);
    
    console.log(`New user created: ${email}. Mock password: ${validatedFields.data.password}`);

    revalidatePath('/dashboard/users');
    
    // Server Actions can't return a redirect, they must throw it.
    // This is the correct way to navigate after a successful action.
    redirect('/dashboard/users');
}


export async function deleteUser(id: string) {
  if (users.find(u => u.id === id)?.role === 'Owner') {
      console.warn("Attempted to delete the owner account. Action prevented.");
      return;
  }
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex > -1) {
    users.splice(userIndex, 1);
  }
  revalidatePath('/dashboard/users');
}

export async function changeUserPassword(userId: string, newPassword: string) {
  const user = users.find(u => u.id === userId);
  if(user) {
    console.log(`Password for user ${user.email} changed to: ${newPassword}`);
  }
  return { success: true, message: 'Password updated successfully.' };
}

export async function verifyUserCredentials(email: string, password: string): Promise<{ success: boolean; message?: string; role?: User['role'] }> {
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return { success: false, message: 'No user found with this email.' };
  }

  if (user.role === 'Owner') {
    return { success: false, message: 'Owners must use the Owner Sign In page.' };
  }

  // NOTE: In a real application, you would securely hash and compare passwords.
  // For this demo, we accept any password for a valid user email.
  console.log(`Login attempt for ${email} with mock password: ${password}`);

  return { success: true, role: user.role };
}

// INQUIRY ACTIONS
const InquirySchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    email: z.string().email('A valid email is required.'),
    message: z.string().min(10, 'Message must be at least 10 characters.'),
    plotNumber: z.string(),
});

export async function saveInquiry(formData: FormData): Promise<{ success: boolean; message: string }> {
    const validatedFields = InquirySchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
        plotNumber: formData.get('plotNumber'),
    });

    if (!validatedFields.success) {
        console.error(validatedFields.error);
        return { success: false, message: 'Invalid form data.' };
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

    return { success: true, message: 'Inquiry submitted successfully.' };
}

// CONTACT ACTIONS
const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  phone: z.string().min(1, 'Phone number is required.'),
  email: z.string().email('Please enter a valid email.'),
  type: z.enum(['Seller', 'Buyer'], { invalid_type_error: 'Please select a contact type.' }),
  notes: z.string().optional(),
});

export async function createContact(prevState: State, formData: FormData): Promise<State> {
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
  
  const existingContact = contacts.find(c => c.email.toLowerCase() === validatedFields.data.email.toLowerCase());
  if (existingContact) {
      return {
          message: 'A contact with this email already exists.',
          success: false,
      }
  }

  const newContact: Contact = {
    id: `con-${Date.now()}`,
    ...validatedFields.data,
  };

  contacts.push(newContact);
  
  revalidatePath('/dashboard/contacts');
  redirect('/dashboard/contacts');
}

export async function updateContact(id: string, prevState: State, formData: FormData): Promise<State> {
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
  
  const existingContact = contacts.find(c => c.email.toLowerCase() === validatedFields.data.email.toLowerCase() && c.id !== id);
  if (existingContact) {
      return {
          message: 'Another contact with this email already exists.',
          success: false,
      }
  }

  const contactIndex = contacts.findIndex((c) => c.id === id);

  if (contactIndex === -1) {
    return { message: 'Contact not found.', success: false };
  }
  
  contacts[contactIndex] = { id, ...validatedFields.data };
  
  revalidatePath('/dashboard/contacts');
  redirect('/dashboard/contacts');
}


export async function deleteContact(id: string) {
  const contactIndex = contacts.findIndex((c) => c.id === id);
  if (contactIndex > -1) {
      contacts.splice(contactIndex, 1);
  }
  revalidatePath('/dashboard/contacts');
}

// REGISTRATION ACTIONS
const RegistrationSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  phone: z.string().min(1, 'A valid phone number is required.'),
  email: z.string().email('A valid email is required.'),
  notes: z.string().optional(),
});

export async function createRegistration(prevState: State, formData: FormData): Promise<State> {
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
      message: `This email address has already been registered. Thank you for your interest.`
    };
  }

  const newRegistration: Registration = {
    id: `reg-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...validatedFields.data,
    isNew: true, // Mark as a new registration
  };

  currentRegistrations.push(newRegistration);
  await writeRegistrations(currentRegistrations);
  revalidatePath('/dashboard/registrations');
  revalidatePath('/dashboard', 'layout'); // Revalidate layout to update notification count

  return {
    success: true,
    message: 'Thank you for registering your interest! We will get in touch with you shortly.',
    registration: newRegistration,
  };
}

export async function markRegistrationsAsRead() {
    const newRegistrationIds = registrations.filter(r => r.isNew).map(r => r.id);
    if (newRegistrationIds.length > 0) {
        registrations.forEach(r => {
            if (r.isNew) {
                r.isNew = false;
            }
        });
        revalidatePath('/dashboard', 'layout');
    }
}

    
