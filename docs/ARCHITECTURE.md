# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  Pages                    Components                  Hooks      │
│  ├── /                   ├── PlotCard              ├── useToast │
│  ├── /login              ├── PlotForm              └── useMobile│
│  ├── /plots              ├── LoginForm                          │
│  ├── /plots/[id]         ├── ContactForm                        │
│  ├── /dashboard          ├── RegistrationForm                   │
│  └── /upload             └── AuthGuard                          │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js Routes)                    │
├─────────────────────────────────────────────────────────────────┤
│  API Routes                    Server Actions                    │
│  ├── /api/auth/login          ├── getPlots()                   │
│  ├── /api/auth/register       ├── createPlot()                 │
│  └── /api/auth/change-pwd     ├── updatePlot()                 │
│                                ├── deletePlot()                 │
│                                ├── saveInquiry()                │
│                                ├── createContact()              │
│                                └── createRegistration()         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  Authentication          Validation           Error Handling     │
│  ├── auth.ts            ├── constants.ts     ├── errors.ts     │
│  │   ├── authenticate   │   ├── VALIDATION   │   ├── AppError  │
│  │   ├── register       │   ├── MESSAGES     │   ├── ValidationError│
│  │   ├── generateToken  │   └── ROLES        │   └── handleError│
│  │   └── verifyToken    │                    │                  │
│  └── password-storage.ts└────────────────────└──────────────────│
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  database.ts                                                     │
│  ├── readPlots() / writePlots()                                │
│  ├── readInquiries() / writeInquiries()                        │
│  ├── readRegistrations() / writeRegistrations()                │
│  ├── readContacts() / writeContacts()                          │
│  ├── readUsers() / writeUsers()                                │
│  └── Helper Functions                                           │
│      ├── readJsonFile<T>()                                     │
│      └── writeJsonFile<T>()                                    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STORAGE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  File-Based JSON Storage (Development)                          │
│  ├── plot-data.json                                             │
│  ├── inquiry-data.json                                          │
│  ├── registration-data.json                                     │
│  ├── contact-data.json                                          │
│  ├── user-data.json                                             │
│  └── password-data.json                                         │
│                                                                  │
│  Future: PostgreSQL + Prisma (Production)                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      AI LAYER (Genkit)                           │
├─────────────────────────────────────────────────────────────────┤
│  AI Flows (Google Gemini 2.0 Flash)                            │
│  ├── analyzeVastu()                                            │
│  ├── generatePlotDescription()                                 │
│  ├── generateMarketInsights()                                  │
│  ├── visualizeFutureDevelopment()                              │
│  ├── getNearbyAmenities()                                      │
│  └── generateSitePlan()                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow
```
User Login
    │
    ▼
LoginForm (Component)
    │
    ▼
POST /api/auth/login (API Route)
    │
    ▼
authenticateUser() (auth.ts)
    │
    ├─► readUsers() (database.ts)
    │       │
    │       ▼
    │   user-data.json
    │
    ├─► getPassword() (password-storage.ts)
    │       │
    │       ▼
    │   password-data.json
    │
    ▼
generateToken() (auth.ts)
    │
    ▼
Return JWT Token
    │
    ▼
Store in localStorage
    │
    ▼
Redirect to Dashboard
```

### Plot Creation Flow
```
User Fills Form
    │
    ▼
PlotForm (Component)
    │
    ▼
createPlot() (Server Action)
    │
    ├─► Validate with Zod Schema
    │       │
    │       ▼
    │   Use VALIDATION constants
    │
    ├─► Check Duplicate
    │       │
    │       ▼
    │   readPlots() → plot-data.json
    │
    ├─► Process Image
    │       │
    │       ▼
    │   Convert to Base64
    │
    ├─► Save Plot
    │       │
    │       ▼
    │   writePlots() → plot-data.json
    │
    ▼
Revalidate Paths
    │
    ▼
Return Success
```

### AI Feature Flow
```
User Requests AI Feature
    │
    ▼
Component (e.g., VastuAnalysis)
    │
    ▼
AI Flow (e.g., analyzeVastu)
    │
    ▼
Genkit AI Instance
    │
    ▼
Google Gemini API
    │
    ▼
Process Response
    │
    ▼
Display to User
```

## Component Hierarchy

```
App Layout
├── Header
│   ├── Logo
│   ├── Navigation
│   └── ThemeToggle
│
├── Pages
│   ├── Home
│   │   └── MarketInsights (AI)
│   │
│   ├── Login
│   │   └── LoginForm
│   │
│   ├── Plots
│   │   ├── PlotList
│   │   │   └── PlotCard[]
│   │   │
│   │   └── Plot Detail
│   │       ├── PlotInfo
│   │       ├── VastuAnalysis (AI)
│   │       ├── FutureVisualizer (AI)
│   │       ├── NearbyAmenities (AI)
│   │       ├── SitePlanGenerator (AI)
│   │       └── ContactForm
│   │
│   ├── Dashboard (Owner Only)
│   │   ├── Sidebar
│   │   ├── Overview
│   │   │   └── Analytics Charts
│   │   ├── Plots Management
│   │   │   └── PlotForm
│   │   ├── Inquiries
│   │   ├── Contacts
│   │   ├── Registrations
│   │   ├── Users
│   │   └── Settings
│   │
│   └── Upload (Owner Only)
│       └── PlotForm
│
└── Footer
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Input Validation                                            │
│     ├── Zod Schemas                                             │
│     ├── Max Length Checks (VALIDATION constants)                │
│     ├── Type Validation                                         │
│     └── Format Validation                                       │
│                                                                  │
│  2. Authentication                                              │
│     ├── JWT Tokens                                              │
│     ├── Password Hashing (bcrypt)                               │
│     ├── Token Verification                                      │
│     └── Session Management                                      │
│                                                                  │
│  3. Authorization                                               │
│     ├── Role-Based Access (Owner/User)                          │
│     ├── Route Protection (AuthGuard)                            │
│     ├── API Route Protection                                    │
│     └── Server Action Protection                                │
│                                                                  │
│  4. Error Handling                                              │
│     ├── Custom Error Classes                                    │
│     ├── Generic Error Messages                                  │
│     ├── Error Logging                                           │
│     └── Graceful Degradation                                    │
│                                                                  │
│  5. Data Protection                                             │
│     ├── Password Storage (separate file)                        │
│     ├── Environment Variables                                   │
│     ├── No Sensitive Data in Logs                               │
│     └── Secure Token Generation                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
Error Occurs
    │
    ▼
Is it a known error type?
    │
    ├─► Yes: Custom Error Class
    │   ├── ValidationError
    │   ├── AuthenticationError
    │   ├── AuthorizationError
    │   ├── NotFoundError
    │   └── DuplicateError
    │
    └─► No: Generic AppError
    │
    ▼
handleError() Utility
    │
    ├─► Extract message
    ├─► Extract status code
    ├─► Log error (console.error)
    └─► Return formatted error
    │
    ▼
Return to Client
    │
    ├─► API Route: JSON response
    └─► Server Action: State object
    │
    ▼
Display to User
    │
    ├─► Toast notification
    ├─► Form error message
    └─► Error page
```

## State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Server State (Next.js)                                         │
│  ├── Server Components (default)                                │
│  ├── Server Actions (mutations)                                 │
│  ├── API Routes (REST endpoints)                                │
│  └── Revalidation (cache invalidation)                          │
│                                                                  │
│  Client State (React)                                           │
│  ├── useState (local component state)                           │
│  ├── useActionState (form state)                                │
│  ├── Context API (auth state)                                   │
│  └── localStorage (token storage)                               │
│                                                                  │
│  Form State (React Hook Form)                                   │
│  ├── Form validation                                            │
│  ├── Error handling                                             │
│  └── Submission state                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

### Current (Development)
```
┌──────────────────────────────────────┐
│     Local Development Server          │
│     (npm run dev)                     │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  Next.js App                    │ │
│  │  ├── Frontend (React)           │ │
│  │  ├── API Routes                 │ │
│  │  └── Server Actions             │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  File Storage                   │ │
│  │  └── JSON Files                 │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  AI Services                    │ │
│  │  └── Google Gemini API          │ │
│  └─────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Recommended (Production)
```
┌──────────────────────────────────────────────────────────────┐
│                    Production Environment                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐         ┌────────────────┐              │
│  │   CDN          │         │   Load         │              │
│  │   (Images)     │◄────────│   Balancer     │              │
│  └────────────────┘         └────────────────┘              │
│                                     │                         │
│                                     ▼                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Next.js App (Vercel/AWS/GCP)               │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Frontend (React) + API Routes                 │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                     │                         │
│                                     ▼                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           PostgreSQL Database                         │   │
│  │           (AWS RDS / Google Cloud SQL)               │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Prisma ORM                                    │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                     │                         │
│                                     ▼                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Redis Cache                                 │   │
│  │           (ElastiCache / Cloud Memorystore)          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           External Services                           │   │
│  │  ├── Google Gemini API (AI)                          │   │
│  │  ├── SendGrid (Email)                                │   │
│  │  ├── Twilio (WhatsApp)                               │   │
│  │  └── Sentry (Error Tracking)                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                      TECHNOLOGY STACK                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend                                                        │
│  ├── Next.js 15.3.8 (React Framework)                          │
│  ├── React 18.3.1 (UI Library)                                 │
│  ├── TypeScript 5 (Type Safety)                                │
│  ├── Tailwind CSS 3.4.1 (Styling)                              │
│  ├── Radix UI (Component Library)                              │
│  └── Lucide React (Icons)                                      │
│                                                                  │
│  Backend                                                         │
│  ├── Next.js API Routes (REST API)                             │
│  ├── Server Actions (Data Mutations)                           │
│  ├── Zod 3.24.2 (Validation)                                   │
│  ├── bcryptjs 2.4.3 (Password Hashing)                         │
│  └── jsonwebtoken 9.0.3 (JWT Auth)                             │
│                                                                  │
│  AI & ML                                                         │
│  ├── Genkit 1.14.1 (AI Framework)                              │
│  ├── @genkit-ai/googleai (Google AI Integration)               │
│  └── Google Gemini 2.0 Flash (LLM)                             │
│                                                                  │
│  Data Storage (Current)                                         │
│  └── File-based JSON (Development Only)                        │
│                                                                  │
│  Data Storage (Recommended)                                     │
│  ├── PostgreSQL (Database)                                     │
│  ├── Prisma (ORM)                                              │
│  └── Redis (Caching)                                           │
│                                                                  │
│  Development Tools                                              │
│  ├── ESLint (Linting)                                          │
│  ├── TypeScript Compiler (Type Checking)                       │
│  └── Turbopack (Fast Refresh)                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Performance Considerations

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE OPTIMIZATIONS                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Current Optimizations                                          │
│  ├── Server Components (default)                                │
│  ├── Code Splitting (automatic)                                 │
│  ├── Image Optimization (Next.js Image)                         │
│  └── Turbopack (fast refresh)                                   │
│                                                                  │
│  Recommended Additions                                          │
│  ├── Database Indexing                                          │
│  ├── Redis Caching                                              │
│  ├── CDN for Static Assets                                      │
│  ├── Lazy Loading Components                                    │
│  ├── Pagination for Lists                                       │
│  ├── AI Response Caching                                        │
│  └── Connection Pooling                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Scalability Path

```
Phase 1: Current (Development)
├── File-based storage
├── Single server
└── No caching

Phase 2: Small Production
├── PostgreSQL database
├── Single server (Vercel/AWS)
└── Basic caching

Phase 3: Medium Scale
├── PostgreSQL with read replicas
├── Multiple servers (load balanced)
├── Redis caching
└── CDN for assets

Phase 4: Large Scale
├── PostgreSQL cluster
├── Auto-scaling servers
├── Redis cluster
├── CDN + edge caching
├── Microservices architecture
└── Message queues
```

This architecture provides a solid foundation for growth while maintaining code quality and security.
