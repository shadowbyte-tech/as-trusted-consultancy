# Database Migration Guide

## Overview

This guide helps you migrate from file-based JSON storage to a production-ready PostgreSQL database using Prisma ORM.

## Why Migrate?

### Current Limitations (File-Based Storage):
- ❌ No concurrent access handling
- ❌ No transactions
- ❌ No data integrity guarantees
- ❌ Poor performance with large datasets
- ❌ No indexing
- ❌ No relationships enforcement
- ❌ Not scalable

### Benefits of PostgreSQL + Prisma:
- ✅ ACID transactions
- ✅ Concurrent access handling
- ✅ Data integrity and constraints
- ✅ Excellent performance with indexing
- ✅ Scalable to millions of records
- ✅ Relationship enforcement
- ✅ Type-safe database queries
- ✅ Easy migrations

## Step-by-Step Migration

### Step 1: Install Prisma

```bash
npm install prisma @prisma/client
npm install -D prisma
```

### Step 2: Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema
- `.env` - Updated with `DATABASE_URL`

### Step 3: Configure Database Connection

Update `.env`:
```env
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/as_consultancy?schema=public"
```

**For local development:**
```bash
# Install PostgreSQL locally or use Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

**For production:**
- Use managed PostgreSQL (AWS RDS, Google Cloud SQL, Heroku Postgres, Supabase, etc.)

### Step 4: Define Prisma Schema

Replace `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}

enum Role {
  OWNER
  USER
}

model Plot {
  id          String      @id @default(cuid())
  plotNumber  String
  villageName String
  areaName    String
  plotSize    String
  plotFacing  PlotFacing
  imageUrl    String      @db.Text
  imageHint   String      @default("custom upload")
  description String?     @db.Text
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  inquiries   Inquiry[]

  @@unique([plotNumber, villageName])
  @@index([villageName])
  @@index([areaName])
}

enum PlotFacing {
  NORTH
  SOUTH
  EAST
  WEST
  NORTH_EAST
  NORTH_WEST
  SOUTH_EAST
  SOUTH_WEST
}

model Inquiry {
  id         String   @id @default(cuid())
  plotNumber String
  plot       Plot?    @relation(fields: [plotNumber], references: [plotNumber])
  name       String
  email      String
  message    String   @db.Text
  receivedAt DateTime @default(now())

  @@index([plotNumber])
  @@index([receivedAt])
}

model Contact {
  id        String      @id @default(cuid())
  name      String
  phone     String
  email     String      @unique
  type      ContactType
  notes     String?     @db.Text
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  @@index([email])
  @@index([type])
}

enum ContactType {
  SELLER
  BUYER
}

model Registration {
  id        String   @id @default(cuid())
  name      String
  phone     String
  email     String   @unique
  notes     String?  @db.Text
  isNew     Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@index([isNew])
  @@index([createdAt])
}
```

### Step 5: Create Migration

```bash
npx prisma migrate dev --name init
```

This creates the database tables.

### Step 6: Generate Prisma Client

```bash
npx prisma generate
```

### Step 7: Create Migration Script

Create `scripts/migrate-data.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function migrateData() {
  console.log('Starting data migration...');

  try {
    // Migrate Users
    console.log('Migrating users...');
    const usersData = JSON.parse(
      await fs.readFile(path.join(process.cwd(), 'src/lib/user-data.json'), 'utf-8')
    );
    const passwordsData = JSON.parse(
      await fs.readFile(path.join(process.cwd(), 'src/lib/password-data.json'), 'utf-8')
    );

    for (const user of usersData) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          password: passwordsData[user.email] || await bcrypt.hash('password', 10),
          role: user.role === 'Owner' ? 'OWNER' : 'USER',
        },
      });
    }
    console.log(`✓ Migrated ${usersData.length} users`);

    // Migrate Plots
    console.log('Migrating plots...');
    const plotsData = JSON.parse(
      await fs.readFile(path.join(process.cwd(), 'src/lib/plot-data.json'), 'utf-8')
    );

    for (const plot of plotsData) {
      await prisma.plot.create({
        data: {
          id: plot.id,
          plotNumber: plot.plotNumber,
          villageName: plot.villageName,
          areaName: plot.areaName,
          plotSize: plot.plotSize,
          plotFacing: plot.plotFacing.replace('-', '_').toUpperCase(),
          imageUrl: plot.imageUrl,
          imageHint: plot.imageHint || 'custom upload',
          description: plot.description,
        },
      });
    }
    console.log(`✓ Migrated ${plotsData.length} plots`);

    // Migrate Inquiries
    console.log('Migrating inquiries...');
    const inquiriesData = JSON.parse(
      await fs.readFile(path.join(process.cwd(), 'src/lib/inquiry-data.json'), 'utf-8')
    );

    for (const inquiry of inquiriesData) {
      await prisma.inquiry.create({
        data: {
          id: inquiry.id,
          plotNumber: inquiry.plotNumber,
          name: inquiry.name,
          email: inquiry.email,
          message: inquiry.message,
          receivedAt: new Date(inquiry.receivedAt),
        },
      });
    }
    console.log(`✓ Migrated ${inquiriesData.length} inquiries`);

    // Migrate Contacts
    console.log('Migrating contacts...');
    const contactsData = JSON.parse(
      await fs.readFile(path.join(process.cwd(), 'src/lib/contact-data.json'), 'utf-8')
    );

    for (const contact of contactsData) {
      await prisma.contact.create({
        data: {
          id: contact.id,
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          type: contact.type.toUpperCase(),
          notes: contact.notes,
        },
      });
    }
    console.log(`✓ Migrated ${contactsData.length} contacts`);

    // Migrate Registrations
    console.log('Migrating registrations...');
    const registrationsData = JSON.parse(
      await fs.readFile(path.join(process.cwd(), 'src/lib/registration-data.json'), 'utf-8')
    );

    for (const registration of registrationsData) {
      await prisma.registration.create({
        data: {
          id: registration.id,
          name: registration.name,
          phone: registration.phone,
          email: registration.email,
          notes: registration.notes,
          isNew: registration.isNew ?? true,
          createdAt: new Date(registration.createdAt),
        },
      });
    }
    console.log(`✓ Migrated ${registrationsData.length} registrations`);

    console.log('✅ Data migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
```

Run migration:
```bash
npx tsx scripts/migrate-data.ts
```

### Step 8: Update Database Layer

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Step 9: Update Actions

Replace file operations with Prisma queries. Example for plots:

```typescript
// OLD (File-based)
export async function getPlots() {
  const plots = await readPlots();
  return [...plots].reverse();
}

// NEW (Prisma)
export async function getPlots() {
  return await prisma.plot.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

// OLD (File-based)
export async function createPlot(data: PlotData) {
  const plots = await readPlots();
  const newPlot = { id: Date.now().toString(), ...data };
  plots.push(newPlot);
  await writePlots(plots);
  return newPlot;
}

// NEW (Prisma)
export async function createPlot(data: PlotData) {
  return await prisma.plot.create({
    data: {
      ...data,
      plotFacing: data.plotFacing.replace('-', '_').toUpperCase(),
    },
  });
}
```

### Step 10: Update Auth

Replace password storage with Prisma:

```typescript
// OLD (File-based)
import { getPassword, setPassword } from './password-storage';

// NEW (Prisma)
export async function authenticateUser(credentials: LoginCredentials) {
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });
  
  if (!user) return null;
  
  const isValid = await bcrypt.compare(credentials.password, user.password);
  if (!isValid) return null;
  
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
```

### Step 11: Test Thoroughly

```bash
# Run type checking
npm run typecheck

# Run linter
npm run lint

# Start development server
npm run dev

# Test all features:
# - Login/Register
# - Create/Update/Delete plots
# - Submit inquiries
# - Manage contacts
# - View registrations
```

### Step 12: Deploy

1. **Set up production database**:
   - AWS RDS, Google Cloud SQL, or Heroku Postgres
   - Get connection string

2. **Set environment variable**:
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/dbname"
   ```

3. **Run migrations on production**:
   ```bash
   npx prisma migrate deploy
   ```

4. **Deploy application**:
   - Vercel, AWS, Google Cloud, etc.

## Rollback Plan

If migration fails:

1. **Keep JSON files as backup**:
   ```bash
   # Backup before migration
   cp -r src/lib/*.json backups/
   ```

2. **Revert code changes**:
   ```bash
   git checkout main
   ```

3. **Restore JSON files**:
   ```bash
   cp backups/*.json src/lib/
   ```

## Performance Optimization

After migration:

1. **Add indexes** for frequently queried fields
2. **Use connection pooling** (PgBouncer)
3. **Implement caching** (Redis)
4. **Optimize queries** with Prisma's query optimization
5. **Monitor performance** with Prisma Studio

## Monitoring

```bash
# Open Prisma Studio to view/edit data
npx prisma studio
```

## Common Issues

### "Connection refused"
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Check firewall rules

### "Migration failed"
- Check schema syntax
- Verify database permissions
- Check for data conflicts

### "Slow queries"
- Add indexes
- Use `select` to limit fields
- Implement pagination

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

## Support

For migration issues:
1. Check Prisma logs
2. Verify database connection
3. Test queries in Prisma Studio
4. Review migration files in `prisma/migrations/`
