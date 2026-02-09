# Migration Guide: Enhanced Database Schema

## Overview

This guide provides step-by-step instructions for migrating your AS Trusted Consultancy platform to use the enhanced database schema. The migration is **backward compatible** and **non-destructive**.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Understanding the Migration](#understanding-the-migration)
3. [Migration Steps](#migration-steps)
4. [Verification](#verification)
5. [Rollback Procedure](#rollback-procedure)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

## Prerequisites

Before starting the migration:

- [ ] Backup all data files in `src/lib/`
- [ ] Review the [DATABASE_ENHANCEMENT_GUIDE.md](./DATABASE_ENHANCEMENT_GUIDE.md)
- [ ] Ensure TypeScript compilation passes: `npm run typecheck`
- [ ] Test the existing application to ensure it's working correctly

## Understanding the Migration

### What Gets Migrated?

The migration enhances existing plot data with new fields:

**Added Fields:**
- `status`: Default = 'Available'
- `priceNegotiable`: Default = true
- `priceVisibility`: Default = 'inquiry'
- `images`: Array containing the existing `imageUrl`
- `thumbnailUrl`: Copy of existing `imageUrl`
- `createdAt`: Current timestamp
- `updatedAt`: Current timestamp
- `viewCount`: Default = 0

**Preserved Fields:**
- All existing fields remain unchanged
- `imageUrl` and `imageHint` are preserved for compatibility

### What Doesn't Change?

- Existing data files are updated in place
- File structure remains the same
- API endpoints continue to work
- No breaking changes to existing code

## Migration Steps

### Step 1: Check Current Status

First, check if migration is needed:

```typescript
import { checkMigrationStatus } from '@/lib/migrations/migrate-to-enhanced';

const status = await checkMigrationStatus();
console.log(status);
// Output: { needsMigration: true, plotCount: 10, enhancedCount: 0 }
```

### Step 2: Backup Data Files

**Critical:** Always backup before migration!

```bash
# Navigate to project root
cd /path/to/as-trusted-consultancy

# Create backup directory
mkdir -p backups/$(date +%Y%m%d_%H%M%S)

# Backup all data files
cp src/lib/plot-data.json backups/$(date +%Y%m%d_%H%M%S)/
cp src/lib/inquiry-data.json backups/$(date +%Y%m%d_%H%M%S)/
cp src/lib/registration-data.json backups/$(date +%Y%m%d_%H%M%S)/
```

### Step 3: Run Migration

Create a migration script or use the built-in function:

**Option A: Programmatic Migration**

```typescript
// scripts/migrate.ts
import { migratePlotsToEnhanced } from '@/lib/migrations/migrate-to-enhanced';

async function runMigration() {
  console.log('Starting migration...');
  
  const result = await migratePlotsToEnhanced();
  
  if (result.success) {
    console.log(`✓ Successfully migrated ${result.migratedCount} plots`);
  } else {
    console.error('✗ Migration failed:');
    result.errors?.forEach(error => console.error(`  - ${error}`));
  }
}

runMigration();
```

**Option B: Manual Migration (for debugging)**

```typescript
import { readPlots, writePlots } from '@/lib/database';
import type { Plot } from '@/lib/definitions';
import type { EnhancedPlot } from '@/lib/enhanced-definitions';

const plots = await readPlots();

const enhancedPlots = plots.map((plot: Plot): EnhancedPlot => ({
  ...plot,
  status: 'Available',
  priceNegotiable: true,
  priceVisibility: 'inquiry',
  images: plot.imageUrl ? [plot.imageUrl] : [],
  thumbnailUrl: plot.imageUrl,
  imageHint: plot.imageHint || 'legacy upload',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  viewCount: 0,
}));

await writePlots(enhancedPlots as any);
```

### Step 4: Verify Migration

After migration, verify the data:

```typescript
import { checkMigrationStatus } from '@/lib/migrations/migrate-to-enhanced';
import { readPlots } from '@/lib/database';

// Check status
const status = await checkMigrationStatus();
console.log('Migration complete:', !status.needsMigration);
console.log('Enhanced plots:', status.enhancedCount);

// Verify a sample plot
const plots = await readPlots();
const samplePlot = plots[0] as any;

console.log('Sample plot check:');
console.log('- Has status:', 'status' in samplePlot);
console.log('- Has images:', 'images' in samplePlot);
console.log('- Has viewCount:', 'viewCount' in samplePlot);
console.log('- Has timestamps:', 'createdAt' in samplePlot && 'updatedAt' in samplePlot);
```

### Step 5: Test Application

Run the application and test key features:

```bash
npm run dev
```

**Test Checklist:**
- [ ] Browse plots page
- [ ] View individual plot details
- [ ] Create new plot
- [ ] Edit existing plot
- [ ] Search and filter plots
- [ ] Submit inquiry
- [ ] Check dashboard

### Step 6: Deploy New Features (Optional)

Once migration is verified, you can start using enhanced features:

```typescript
// Use favorites
import { addToFavorites } from '@/lib/enhanced-actions';
await addToFavorites('user123', 'plot456');

// Use comparisons
import { addToComparison } from '@/lib/enhanced-actions';
await addToComparison('user123', 'plot456');

// Track views
import { incrementPlotViewCount } from '@/lib/enhanced-actions';
await incrementPlotViewCount('plot456');

// Update status
import { updatePlotStatus } from '@/lib/enhanced-actions';
await updatePlotStatus('plot456', 'Reserved');
```

## Verification

### Data Integrity Checks

Run these checks to ensure migration was successful:

```typescript
import { readPlots } from '@/lib/database';

async function verifyMigration() {
  const plots = await readPlots();
  
  const checks = {
    totalPlots: plots.length,
    hasStatus: plots.every((p: any) => 'status' in p),
    hasImages: plots.every((p: any) => 'images' in p && Array.isArray(p.images)),
    hasViewCount: plots.every((p: any) => typeof p.viewCount === 'number'),
    hasTimestamps: plots.every((p: any) => 'createdAt' in p && 'updatedAt' in p),
    preservedImageUrl: plots.every((p: any) => 'imageUrl' in p),
  };
  
  console.table(checks);
  
  return Object.values(checks).every(Boolean);
}

const isValid = await verifyMigration();
console.log('Migration valid:', isValid);
```

### TypeScript Compilation

Ensure no type errors:

```bash
npm run typecheck
```

### Linting

Check code quality:

```bash
npm run lint
```

## Rollback Procedure

If you need to rollback the migration:

### Step 1: Stop the Application

```bash
# Stop the development server
# Press Ctrl+C or kill the process
```

### Step 2: Restore Backup

```bash
# Find your backup
ls -la backups/

# Restore from backup (replace TIMESTAMP with your backup timestamp)
cp backups/TIMESTAMP/plot-data.json src/lib/
cp backups/TIMESTAMP/inquiry-data.json src/lib/
cp backups/TIMESTAMP/registration-data.json src/lib/
```

### Step 3: Restart Application

```bash
npm run dev
```

### Step 4: Verify Rollback

Check that the application works with the restored data.

## Troubleshooting

### Issue: Migration Script Fails

**Symptom:** Migration returns errors

**Solution:**
1. Check backup exists
2. Review error messages in result.errors
3. Verify file permissions
4. Ensure plot-data.json is valid JSON

```typescript
// Debug individual plot issues
import { readPlots } from '@/lib/database';

const plots = await readPlots();
plots.forEach((plot, index) => {
  try {
    JSON.stringify(plot);
    console.log(`Plot ${index} OK`);
  } catch (error) {
    console.error(`Plot ${index} has issues:`, error);
  }
});
```

### Issue: TypeScript Errors After Migration

**Symptom:** Type errors in components using Plot type

**Solution:**
The migration maintains backward compatibility. If you see errors:

1. Ensure you're importing the correct type:
```typescript
import type { Plot } from '@/lib/definitions'; // Base type
// OR
import type { EnhancedPlot } from '@/lib/enhanced-definitions'; // Enhanced type
```

2. Use type assertions if needed:
```typescript
const plot = plots[0] as EnhancedPlot;
```

### Issue: Missing Fields After Migration

**Symptom:** New fields don't appear in data

**Solution:**
1. Verify migration completed successfully
2. Check the plot data file directly:
```bash
cat src/lib/plot-data.json | jq '.[0]'
```
3. Re-run migration if needed

### Issue: Application Performance Issues

**Symptom:** Slower load times after migration

**Solution:**
This is unlikely due to the migration itself. However:

1. Check file sizes:
```bash
ls -lh src/lib/*.json
```

2. Consider pagination if you have many plots
3. Optimize image loading with lazy loading

## FAQ

### Q: Will the migration affect my existing plots?

**A:** No, all existing plot data is preserved. New fields are added with default values.

### Q: Do I need to migrate all at once?

**A:** The migration processes all plots in a single operation, but this is safe and quick.

### Q: Can I continue using the old Plot type?

**A:** Yes! The base `Plot` type remains unchanged. Enhanced features use `EnhancedPlot`.

### Q: What if I don't need all the new fields?

**A:** That's fine! All new fields are optional. You can use only what you need.

### Q: How do I add custom fields?

**A:** Extend the `EnhancedPlot` type:
```typescript
type MyCustomPlot = EnhancedPlot & {
  customField: string;
};
```

### Q: Can I run the migration multiple times?

**A:** Yes, the migration is idempotent. Running it multiple times won't create duplicates or issues.

### Q: How do I migrate inquiries and registrations?

**A:** Currently, only plots are migrated. Inquiry and registration enhancements are schema additions that work with existing data without migration.

### Q: What happens to images?

**A:** The existing `imageUrl` is preserved and copied into the new `images` array. Both fields are maintained for compatibility.

### Q: Is production deployment affected?

**A:** Deploy as usual. Run the migration in production after deployment:
```bash
# In production environment
npm run migrate # (if you've added this script)
```

### Q: How do I verify the migration worked?

**A:** Use the verification steps in the [Verification](#verification) section above.

## Post-Migration Checklist

After successful migration:

- [ ] Verify all plots load correctly
- [ ] Test creating new plots
- [ ] Test editing existing plots
- [ ] Verify images display properly
- [ ] Check that search/filter works
- [ ] Test dashboard functionality
- [ ] Review application logs for errors
- [ ] Update documentation if needed
- [ ] Notify team of successful migration
- [ ] Archive backup files (keep for at least 30 days)

## Support

If you encounter issues not covered in this guide:

1. Check the [DATABASE_ENHANCEMENT_GUIDE.md](./DATABASE_ENHANCEMENT_GUIDE.md)
2. Review existing issues in the repository
3. Create a new issue with:
   - Error messages
   - Steps to reproduce
   - Expected vs actual behavior
   - Backup status

## Next Steps

After successful migration:

1. Explore new features in [DATABASE_ENHANCEMENT_GUIDE.md](./DATABASE_ENHANCEMENT_GUIDE.md)
2. Implement UI components for new features
3. Add tests for enhanced functionality
4. Update user documentation
5. Train team on new features

---

**Last Updated:** February 2026
**Version:** 1.0.0
**Compatibility:** Node.js 20+, Next.js 15+
