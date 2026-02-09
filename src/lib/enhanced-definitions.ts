/**
 * Enhanced type definitions for the AS Trusted Consultancy platform
 * These types extend the base definitions with additional fields and features
 * while maintaining backward compatibility.
 */

// Enhanced Plot Type with new fields
export type PlotStatus = 'Available' | 'Reserved' | 'Sold' | 'Under Negotiation';
export type PriceVisibility = 'public' | 'registered' | 'inquiry';

export type EnhancedPlot = {
  // Existing fields from Plot type
  id: string;
  plotNumber: string;
  villageName: string;
  areaName: string;
  plotSize: string;
  plotFacing: 'North' | 'South' | 'East' | 'West' | 'North-East' | 'North-West' | 'South-East' | 'South-West';
  description?: string;
  
  // NEW: Critical additions
  status: PlotStatus;
  price?: number;
  pricePerSqft?: number;
  priceNegotiable: boolean;
  priceVisibility: PriceVisibility;
  
  // NEW: Multiple images support
  images: string[];
  thumbnailUrl?: string;
  imageHint?: string; // For backward compatibility
  
  // NEW: Metadata
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  
  // NEW: Additional details
  plotLength?: string;
  plotWidth?: string;
  plotArea?: number;
  plotType?: 'Residential' | 'Commercial' | 'Agricultural';
  
  // NEW: Features & Amenities
  amenities?: string[];
  roadAccess?: boolean;
  electricityAvailable?: boolean;
  waterSupply?: boolean;
  
  // NEW: Vastu Analysis
  vastuScore?: number;
  vastuAnalysis?: string;
  
  // NEW: Location
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  
  // NEW: Legal
  surveyNumber?: string;
  plotApproved?: boolean;
  documentStatus?: string;
};

// Enhanced Inquiry Type
export type InquiryStatus = 'New' | 'Read' | 'Responded' | 'Closed';
export type InquiryPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type EnhancedInquiry = {
  id: string;
  plotNumber: string;
  plotId: string;
  
  // User information
  name: string;
  email: string;
  phone: string;
  
  // Inquiry details
  message: string;
  subject?: string;
  
  // Status tracking
  status: InquiryStatus;
  priority: InquiryPriority;
  
  // Response
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
  
  // Metadata
  receivedAt: string;
  source?: string;
  notes?: string;
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: string;
};

// NEW: Favorites System
export type Favorite = {
  id: string;
  userId: string;
  plotId: string;
  addedAt: string;
  notes?: string;
};

// NEW: Comparison System
export type Comparison = {
  id: string;
  userId: string;
  plotIds: string[];
  createdAt: string;
  expiresAt?: string;
};

// NEW: Search History
export type SearchHistory = {
  id: string;
  userId: string;
  query: string;
  filters: {
    priceMin?: number;
    priceMax?: number;
    sizeMin?: number;
    sizeMax?: number;
    facing?: string[];
    status?: PlotStatus[];
    location?: string;
  };
  resultsCount: number;
  createdAt: string;
};

// Enhanced User Type
export type UserRole = 'Owner' | 'Agent' | 'User' | 'Admin';

export type UserPreferences = {
  priceRange?: { min: number; max: number };
  sizeRange?: { min: number; max: number };
  preferredFacing?: string[];
  preferredLocations?: string[];
  plotType?: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
};

export type EnhancedUser = {
  id: string;
  email: string;
  role: UserRole;
  
  // Profile
  name: string;
  phone?: string;
  avatar?: string;
  
  // Authentication
  passwordHash?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Preferences
  preferences?: UserPreferences;
  
  // Activity
  lastLogin?: string;
  loginCount: number;
  createdAt: string;
  updatedAt: string;
  
  // Status
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
};

// Enhanced Registration Type
export type EnhancedRegistration = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  createdAt: string;
  isNew?: boolean;
  
  // NEW: User preferences
  preferences?: {
    budget?: { min: number; max: number };
    preferredSize?: string;
    preferredFacing?: string[];
    preferredLocations?: string[];
  };
  
  // NEW: Status tracking
  status: 'New' | 'Contacted' | 'Active' | 'Inactive';
  lastContactedAt?: string;
};
