# Database Enhancement Guide

## Overview

This guide documents the enhanced database schema for the AS Trusted Consultancy platform. These enhancements add advanced features while maintaining full backward compatibility with existing data structures.

## Table of Contents

1. [Enhanced Type Definitions](#enhanced-type-definitions)
2. [Database Operations](#database-operations)
3. [Server Actions](#server-actions)
4. [Migration Guide](#migration-guide)
5. [API Examples](#api-examples)
6. [Backward Compatibility](#backward-compatibility)
7. [Future Roadmap](#future-roadmap)

## Enhanced Type Definitions

### EnhancedPlot

The `EnhancedPlot` type extends the base `Plot` type with additional fields for better plot management:

```typescript
type EnhancedPlot = {
  // Base fields (from Plot type)
  id: string;
  plotNumber: string;
  villageName: string;
  areaName: string;
  plotSize: string;
  plotFacing: 'North' | 'South' | 'East' | 'West' | 'North-East' | 'North-West' | 'South-East' | 'South-West';
  description?: string;
  
  // Status & Pricing
  status: 'Available' | 'Reserved' | 'Sold' | 'Under Negotiation';
  price?: number;
  pricePerSqft?: number;
  priceNegotiable: boolean;
  priceVisibility: 'public' | 'registered' | 'inquiry';
  
  // Images
  images: string[];
  thumbnailUrl?: string;
  imageHint?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  
  // Additional Details
  plotLength?: string;
  plotWidth?: string;
  plotArea?: number;
  plotType?: 'Residential' | 'Commercial' | 'Agricultural';
  
  // Features & Amenities
  amenities?: string[];
  roadAccess?: boolean;
  electricityAvailable?: boolean;
  waterSupply?: boolean;
  
  // Vastu
  vastuScore?: number;
  vastuAnalysis?: string;
  
  // Location
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  
  // Legal
  surveyNumber?: string;
  plotApproved?: boolean;
  documentStatus?: string;
};
```

**Key Features:**
- **Status Tracking**: Track plot availability in real-time
- **Pricing Options**: Support for price visibility levels and negotiability
- **Multiple Images**: Array of image URLs for better visual representation
- **Rich Metadata**: Track creation, updates, and view counts
- **Amenities**: Track available facilities and utilities
- **Vastu Analysis**: Support for Vastu scoring and analysis
- **Geolocation**: GPS coordinates and Google Maps integration
- **Legal Information**: Document status and approval tracking

### EnhancedInquiry

Enhanced inquiry type with status tracking and priority management:

```typescript
type EnhancedInquiry = {
  id: string;
  plotNumber: string;
  plotId: string;
  
  // User Information
  name: string;
  email: string;
  phone: string;
  
  // Inquiry Details
  message: string;
  subject?: string;
  
  // Status Tracking
  status: 'New' | 'Read' | 'Responded' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  
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
```

**Key Features:**
- **Status Management**: Track inquiry lifecycle from new to closed
- **Priority Levels**: Prioritize inquiries based on urgency
- **Response Tracking**: Record responses and response times
- **Follow-up System**: Schedule and track follow-up actions

### Favorite

User favorites system for saving interesting plots:

```typescript
type Favorite = {
  id: string;
  userId: string;
  plotId: string;
  addedAt: string;
  notes?: string;
};
```

### Comparison

Side-by-side plot comparison feature:

```typescript
type Comparison = {
  id: string;
  userId: string;
  plotIds: string[]; // Max 4 plots
  createdAt: string;
  expiresAt?: string; // Auto-expire after 7 days
};
```

### SearchHistory

Track user search patterns:

```typescript
type SearchHistory = {
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
```

### EnhancedUser

Extended user type with preferences and activity tracking:

```typescript
type EnhancedUser = {
  id: string;
  email: string;
  role: 'Owner' | 'Agent' | 'User' | 'Admin';
  
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
```

### EnhancedRegistration

Extended registration with preferences and status:

```typescript
type EnhancedRegistration = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  createdAt: string;
  isNew?: boolean;
  
  // Preferences
  preferences?: {
    budget?: { min: number; max: number };
    preferredSize?: string;
    preferredFacing?: string[];
    preferredLocations?: string[];
  };
  
  // Status Tracking
  status: 'New' | 'Contacted' | 'Active' | 'Inactive';
  lastContactedAt?: string;
};
```

## Database Operations

### Favorites

```typescript
import { readFavorites, writeFavorites } from '@/lib/enhanced-database';

// Read all favorites
const favorites = await readFavorites();

// Write favorites
await writeFavorites(updatedFavorites);
```

### Comparisons

```typescript
import { readComparisons, writeComparisons } from '@/lib/enhanced-database';

// Read all comparisons
const comparisons = await readComparisons();

// Write comparisons
await writeComparisons(updatedComparisons);
```

### Search History

```typescript
import { readSearchHistory, writeSearchHistory } from '@/lib/enhanced-database';

// Read search history
const history = await readSearchHistory();

// Write search history
await writeSearchHistory(updatedHistory);
```

## Server Actions

### Favorites Management

```typescript
import { 
  addToFavorites, 
  removeFromFavorites, 
  getUserFavorites 
} from '@/lib/enhanced-actions';

// Add to favorites
const result = await addToFavorites('user123', 'plot456', 'Nice location');

// Remove from favorites
await removeFromFavorites('user123', 'plot456');

// Get user's favorites
const favorites = await getUserFavorites('user123');
```

### Comparison Management

```typescript
import { 
  addToComparison, 
  removeFromComparison, 
  getUserComparison 
} from '@/lib/enhanced-actions';

// Add to comparison (max 4 plots)
const result = await addToComparison('user123', 'plot456');

// Remove from comparison
await removeFromComparison('user123', 'plot456');

// Get user's comparison
const comparison = await getUserComparison('user123');
```

### Plot Status Management

```typescript
import { updatePlotStatus, incrementPlotViewCount } from '@/lib/enhanced-actions';

// Update plot status
await updatePlotStatus('plot456', 'Reserved');

// Increment view count
await incrementPlotViewCount('plot456');
```

## Migration Guide

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed migration instructions.

## API Examples

### Example 1: Adding a Plot to Favorites

```typescript
'use server';

async function handleAddToFavorites(userId: string, plotId: string) {
  const result = await addToFavorites(userId, plotId, 'Interested in this plot');
  
  if (result.success) {
    return { message: 'Added to favorites!' };
  } else {
    return { error: result.message };
  }
}
```

### Example 2: Building a Comparison List

```typescript
'use client';

import { addToComparison } from '@/lib/enhanced-actions';

export default function CompareButton({ plotId }: { plotId: string }) {
  async function handleAddToCompare() {
    const userId = 'current-user-id'; // Get from session
    const result = await addToComparison(userId, plotId);
    
    if (result.success) {
      alert('Added to comparison!');
    } else {
      alert(result.message);
    }
  }
  
  return <button onClick={handleAddToCompare}>Compare</button>;
}
```

### Example 3: Tracking Plot Views

```typescript
'use server';

import { incrementPlotViewCount } from '@/lib/enhanced-actions';

export async function trackPlotView(plotId: string) {
  await incrementPlotViewCount(plotId);
}
```

### Example 4: Managing Plot Status

```typescript
'use server';

import { updatePlotStatus } from '@/lib/enhanced-actions';

export async function markPlotAsReserved(plotId: string) {
  const result = await updatePlotStatus(plotId, 'Reserved');
  
  if (result.success) {
    return { message: 'Plot marked as reserved' };
  } else {
    return { error: result.message };
  }
}
```

## Backward Compatibility

### Design Principles

1. **Non-Breaking Changes**: All new fields are optional or have default values
2. **Additive Only**: Existing fields are never removed or renamed
3. **Type Safety**: TypeScript ensures type compatibility
4. **Migration Support**: Automatic migration utilities provided

### Compatibility Notes

- **Existing Plot Data**: All existing plot data continues to work without modification
- **Image Fields**: Both `imageUrl` (legacy) and `images` (new) are supported
- **Status Field**: Defaults to 'Available' for existing plots
- **View Count**: Defaults to 0 for existing plots
- **Timestamps**: Auto-generated on first migration

### Migration Strategy

The migration is **opt-in** and **non-destructive**:

1. Existing code continues to work with base types
2. New features use enhanced types
3. Migration utility converts existing data to enhanced format
4. Original data structure is preserved

## Future Roadmap

### Phase 2: UI Components
- Favorites page and components
- Comparison view
- Advanced search interface
- Plot status management UI

### Phase 3: Advanced Features
- Search history analytics
- User preference recommendations
- Email notifications for status changes
- SMS alerts for inquiries

### Phase 4: Analytics
- Plot view tracking dashboard
- Popular searches analysis
- Conversion rate tracking
- User engagement metrics

### Phase 5: Integration
- Google Maps integration
- Payment gateway for reservations
- Document management system
- CRM integration

## Best Practices

### 1. Type Safety

Always import and use the proper types:

```typescript
import type { EnhancedPlot, Favorite } from '@/lib/enhanced-definitions';
```

### 2. Error Handling

All database operations should handle errors:

```typescript
try {
  const favorites = await readFavorites();
  // Process favorites
} catch (error) {
  console.error('Failed to read favorites:', error);
  // Handle error appropriately
}
```

### 3. Revalidation

Always revalidate paths after mutations:

```typescript
import { revalidatePath } from 'next/cache';

await writeFavorites(updatedFavorites);
revalidatePath('/favorites');
```

### 4. Validation

Use Zod schemas for runtime validation:

```typescript
const result = EnhancedPlotSchema.safeParse(data);
if (!result.success) {
  // Handle validation errors
}
```

## Support

For questions or issues:
- Review the [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- Check existing issues in the repository
- Contact the development team

## License

This enhancement is part of the AS Trusted Consultancy platform and follows the same license terms.
