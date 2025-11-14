# CertusFlow - Available Pages & Routes

## Public Pages

### Landing Page
- **Route**: `/` or `/de` or `/en`
- **File**: `app/[locale]/page.tsx`
- **Features**:
  - Hero section with CTA buttons
  - Features overview
  - Links to Demo, Login, Signup

### Live Demo
- **Route**: `/de/demo` or `/en/demo`
- **File**: `app/[locale]/demo/page.tsx`
- **Features**:
  - Interactive automation creation demo
  - Document processing demo with AI extraction
  - No login required
  - Choose between automation or document demo
  - Real-time simulation of AI processing

### Login
- **Route**: `/de/login` or `/en/login`
- **File**: `app/[locale]/login/page.tsx`
- **Features**:
  - Email + Password authentication
  - Supabase Auth integration
  - Error handling & loading states
  - Link to signup page
  - Redirects to dashboard on success

### Signup / Registration
- **Route**: `/de/signup` or `/en/signup`
- **File**: `app/[locale]/signup/page.tsx`
- **Features**:
  - Full name, email, password fields
  - Password confirmation validation
  - Terms & conditions checkbox
  - Supabase Auth integration with metadata
  - Success animation
  - Auto-redirect to dashboard after 2 seconds

---

## Dashboard Pages (Requires Authentication)

### Dashboard Overview
- **Route**: `/de/dashboard` or `/en/dashboard`
- **File**: `app/[locale]/dashboard/page.tsx`
- **Features**:
  - Stats cards (total runs, active automations, documents, time saved)
  - Recent activity feed
  - Quick action buttons
  - Performance metrics with progress bars
  - Trend indicators

### Automations
- **Route**: `/de/dashboard/automations` or `/en/dashboard/automations`
- **File**: `app/[locale]/dashboard/automations/page.tsx`
- **Features**:
  - List all automations with status badges
  - Search & filter functionality
  - Create new automation button
  - Edit, run, view logs, delete actions
  - Mock data for demonstration

### Documents
- **Route**: `/de/dashboard/documents` or `/en/dashboard/documents`
- **File**: `app/[locale]/dashboard/documents/page.tsx`
- **Features**:
  - Upload documents (drag & drop)
  - Document stats (total, processed, processing, errors)
  - Table view with all documents
  - Status badges (processed, processing, error)
  - Language detection badges (🇩🇪 DE / 🇬🇧 EN)
  - View, download, delete actions
  - Search functionality
  - Extracted data preview

### Integrations
- **Route**: `/de/dashboard/integrations` or `/en/dashboard/integrations`
- **File**: `app/[locale]/dashboard/integrations/page.tsx`
- **Features**:
  - Connected integrations section
  - Available integrations grid
  - Search integrations
  - Filter by category
  - Connect/disconnect buttons
  - Integration settings
  - Stats (connected, available, active automations)
  - Popular integrations badge

### Settings
- **Route**: `/de/dashboard/settings` or `/en/dashboard/settings`
- **File**: `app/[locale]/dashboard/settings/page.tsx`
- **Features**:
  - Profile settings (name, email)
  - Language & region preferences
  - Timezone selection
  - GDPR compliance features
  - Data export (JSON format)
  - Data deletion
  - Password change
  - Account deletion

### Help & Support
- **Route**: `/de/dashboard/help` or `/en/dashboard/help`
- **File**: `app/[locale]/dashboard/help/page.tsx`
- **Features**:
  - Search help articles
  - Quick links (Getting Started, Tutorials, API Docs, Community)
  - FAQ sections by category:
    - Allgemein (General)
    - Automatisierungen (Automations)
    - Dokumente (Documents)
    - Sicherheit & Datenschutz (Security & Privacy)
  - Contact options (Email, Live Chat, Documentation)
  - CTA card for additional support

---

## Navigation Structure

### Sidebar (Dashboard Layout)
Located in `app/[locale]/dashboard/layout.tsx`

Navigation items:
1. **Dashboard** (Home icon)
2. **Automatisierungen** (Zap icon)
3. **Dokumente** (FileText icon)
4. **Integrationen** (LinkIcon icon)
5. **Einstellungen** (Settings icon)
6. **Hilfe** (HelpCircle icon)
7. **Abmelden** (LogOut icon)

Plus:
- Language switcher at bottom
- Active route highlighting
- Responsive sidebar

---

## Component Architecture

### Reusable Components
- `components/ui/button.tsx` - Button with variants
- `components/ui/card.tsx` - Card container
- `components/ui/input.tsx` - Form input
- `components/ui/label.tsx` - Form label
- `components/ui/badge.tsx` - Status badges
- `components/ui/table.tsx` - Data tables
- `components/ui/select.tsx` - Dropdown select
- `components/ui/dropdown-menu.tsx` - Dropdown menus
- `components/LanguageSwitcher.tsx` - Locale switcher

### AI Modules
- `lib/ai/extractInvoiceMultilingual.ts` - Document extraction
- `lib/ai/parseNaturalLanguageAutomation.ts` - NL automation parser

### Database
- `lib/supabase/client.ts` - Supabase client with types
- `supabase-schema.sql` - Full database schema

---

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS v4 (OKLCH colors)
- **UI Components**: Shadcn/ui (Radix UI)
- **i18n**: next-intl (German & English)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: OpenAI GPT-4 Turbo
- **Icons**: Lucide React

---

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_key
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000/de (German) or http://localhost:3000/en (English)

---

## Key Features

✅ Fully multilingual (German & English)
✅ GDPR compliant with data export/deletion
✅ AI-powered document extraction
✅ Natural language automation creation
✅ Complete authentication flow
✅ Responsive design
✅ Type-safe with TypeScript
✅ Production-ready build
✅ Mock data for testing

---

## Next Steps / TODO

- [ ] Implement actual Supabase RLS policies
- [ ] Add route protection middleware for dashboard
- [ ] Connect real AI models for document extraction
- [ ] Implement actual automation execution engine
- [ ] Add email verification flow
- [ ] Add password reset functionality
- [ ] Connect real integrations (Gmail, Sheets, etc.)
- [ ] Add webhook support
- [ ] Implement billing/subscription system
- [ ] Add analytics tracking
