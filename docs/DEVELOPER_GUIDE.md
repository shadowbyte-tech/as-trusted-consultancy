# Developer Guide

## Quick Reference

### Project Structure

```
src/
├── ai/                      # AI flows (Genkit)
│   ├── flows/              # Individual AI flows
│   └── genkit.ts           # Genkit configuration
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── auth/          # Authentication endpoints
│   ├── dashboard/         # Owner dashboard
│   ├── plots/             # Plot pages
│   └── ...                # Other pages
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   └── ...               # Custom components
├── lib/                   # Core library code
│   ├── constants.ts      # Application constants
│   ├── errors.ts         # Error handling
│   ├── auth.ts           # Authentication logic
│   ├── database.ts       # Data persistence
│   ├── actions.ts        # Server actions
│   ├── definitions.ts    # TypeScript types
│   └── password-storage.ts # Password management
└── hooks/                 # Custom React hooks
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/constants.ts` | All constants (validation rules, messages, etc.) |
| `src/lib/errors.ts` | Custom error classes and error handler |
| `src/lib/auth.ts` | Authentication logic (login, register, JWT) |
| `src/lib/database.ts` | Data persistence layer |
| `src/lib/actions.ts` | Server actions for data mutations |
| `src/lib/definitions.ts` | TypeScript type definitions |

### Constants Usage

```typescript
import { VALIDATION, API_MESSAGES, USER_ROLES } from '@/lib/constants';

// Validation
if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
  return { error: 'Password too short' };
}

// Messages
return { message: API_MESSAGES.SUCCESS.PLOT_CREATED };

// Roles
if (user.role === USER_ROLES.OWNER) {
  // Owner-only logic
}
```

### Error Handling

```typescript
import { AppError, ValidationError, handleError } from '@/lib/errors';

// Throwing errors
throw new ValidationError('Invalid input', { email: ['Invalid format'] });
throw new AuthenticationError('Invalid credentials');
throw new NotFoundError('Plot');

// Handling errors
try {
  // Your code
} catch (error) {
  const { message, statusCode } = handleError(error);
  return NextResponse.json({ error: message }, { status: statusCode });
}
```

### Database Operations

```typescript
import { readPlots, writePlots } from '@/lib/database';

// Read data
const plots = await readPlots();

// Write data
await writePlots(updatedPlots);

// Available functions:
// - readPlots() / writePlots()
// - readInquiries() / writeInquiries()
// - readRegistrations() / writeRegistrations()
// - readContacts() / writeContacts()
// - readUsers() / writeUsers()
```

### Authentication

```typescript
import { authenticateUser, generateToken, verifyToken } from '@/lib/auth';

// Authenticate user
const user = await authenticateUser({ email, password });
if (!user) {
  return { error: 'Invalid credentials' };
}

// Generate JWT token
const token = generateToken(user);

// Verify token
const decoded = verifyToken(token);
if (!decoded) {
  return { error: 'Invalid token' };
}

// Get session user from request
const user = getSessionUser(request);
```

### Server Actions

```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function myAction(formData: FormData) {
  try {
    // 1. Validate input
    const validated = schema.safeParse(data);
    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }

    // 2. Perform operation
    const result = await doSomething(validated.data);

    // 3. Revalidate cache
    revalidatePath('/path');

    // 4. Return success
    return { success: true, message: 'Success!' };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, message: 'Error occurred' };
  }
}
```

### API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { handleError } from '@/lib/errors';
import { API_MESSAGES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate
    if (!body.field) {
      return NextResponse.json(
        { error: API_MESSAGES.ERROR.MISSING_FIELDS },
        { status: 400 }
      );
    }

    // Process
    const result = await doSomething(body);

    // Return success
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return NextResponse.json(
      { error: message },
      { status: statusCode }
    );
  }
}
```

### Validation Schemas

```typescript
import { z } from 'zod';
import { VALIDATION } from '@/lib/constants';

const MySchema = z.object({
  email: z.string()
    .email('Invalid email')
    .max(VALIDATION.EMAIL_MAX_LENGTH, 'Email too long'),
  password: z.string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, 'Password too short')
    .max(VALIDATION.PASSWORD_MAX_LENGTH, 'Password too long'),
  name: z.string()
    .min(1, 'Name required')
    .max(VALIDATION.NAME_MAX_LENGTH, 'Name too long'),
});
```

### AI Flows

```typescript
import { ai } from '@/ai/genkit';

// Define flow
export const myFlow = ai.defineFlow(
  {
    name: 'myFlow',
    inputSchema: z.object({ input: z.string() }),
    outputSchema: z.object({ output: z.string() }),
  },
  async (input) => {
    const result = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `Process: ${input.input}`,
    });
    return { output: result.text };
  }
);

// Use flow
const result = await myFlow({ input: 'data' });
```

### Common Patterns

#### Form Submission with Server Action

```typescript
'use client';

import { useActionState } from 'react';
import { myAction } from '@/lib/actions';

export function MyForm() {
  const [state, formAction] = useActionState(myAction, { message: null });

  return (
    <form action={formAction}>
      <input name="field" />
      {state.errors?.field && <p>{state.errors.field[0]}</p>}
      {state.message && <p>{state.message}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

#### Protected Route

```typescript
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const user = getSessionUser(request);
  
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'Owner') {
    redirect('/unauthorized');
  }

  return <div>Protected content</div>;
}
```

#### Data Fetching

```typescript
import { getPlots } from '@/lib/actions';

export default async function PlotsPage() {
  const plots = await getPlots();

  return (
    <div>
      {plots.map(plot => (
        <PlotCard key={plot.id} plot={plot} />
      ))}
    </div>
  );
}
```

### Environment Variables

```typescript
// Server-side only
const apiKey = process.env.GEMINI_API_KEY;
const jwtSecret = process.env.JWT_SECRET;

// Client-side accessible (must start with NEXT_PUBLIC_)
const isConfigured = process.env.NEXT_PUBLIC_GEMINI_API_KEY_CONFIGURED;
```

### Testing

```typescript
// Manual testing checklist
// 1. Authentication
//    - Login with valid/invalid credentials
//    - Register new user
//    - Change password
// 2. CRUD operations
//    - Create, read, update, delete for all entities
// 3. Validation
//    - Test with invalid inputs
//    - Test with missing fields
// 4. Error handling
//    - Test error scenarios
//    - Verify error messages
```

### Debugging

```typescript
// Enable debug logging
console.log('Debug:', { variable });

// Check server logs
// Terminal where `npm run dev` is running

// Check browser console
// F12 -> Console tab

// Check network requests
// F12 -> Network tab

// Prisma Studio (after migration)
// npx prisma studio
```

### Performance Tips

1. **Use Server Components** by default
2. **Add 'use client'** only when needed (hooks, events)
3. **Revalidate paths** after mutations
4. **Use loading states** for better UX
5. **Implement pagination** for large lists
6. **Cache AI results** to reduce API calls

### Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Change default passwords
- [ ] Validate all inputs
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Sanitize user inputs
- [ ] Use environment variables for secrets
- [ ] Implement proper logging
- [ ] Add security headers

### Common Issues

#### "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

#### "Type error"
```bash
# Run type check
npm run typecheck
```

#### "API key not configured"
```bash
# Check .env file exists
# Verify GEMINI_API_KEY is set
# Restart dev server
```

#### "Database error"
```bash
# Check file permissions
# Verify data files exist in src/lib/
# Check disk space
```

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run genkit:dev       # Start Genkit UI

# Build
npm run build            # Build for production
npm start                # Start production server

# Quality
npm run lint             # Run linter
npm run typecheck        # Type checking

# Database (after migration)
npx prisma studio        # Open database UI
npx prisma migrate dev   # Create migration
npx prisma generate      # Generate client
```

### Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn UI Docs](https://ui.shadcn.com)
- [Genkit Docs](https://firebase.google.com/docs/genkit)
- [Zod Docs](https://zod.dev)

### Getting Help

1. Check error messages carefully
2. Review relevant documentation
3. Check browser console and server logs
4. Search for similar issues
5. Review code examples in this guide

### Contributing

When adding new features:
1. Follow existing patterns
2. Use constants for validation and messages
3. Add proper error handling
4. Update TypeScript types
5. Test thoroughly
6. Document changes

### Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Add comments for complex logic
- Keep functions small and focused
- Use async/await over promises
- Handle errors properly
- Validate all inputs
