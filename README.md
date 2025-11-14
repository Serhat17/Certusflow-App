# 🚀 CertusFlow - AI-Powered Multilingual Automation Platform for SMEs

**Smart Business Automation - GDPR-Compliant Workflow System**

Version: 5.0 FINAL - Multilingual Edition  
Author: Serhat17  
Date: 2025-11-14

---

## 🌍 Overview

CertusFlow ist eine **vollständig mehrsprachige**, benutzerfreundliche, GDPR-konforme Automatisierungsplattform, die nahtlos auf **Deutsch und Englisch** funktioniert. Das System nutzt Natural Language AI, um Automatisierungen in der bevorzugten Sprache des Benutzers zu erstellen, und bietet intelligente Dokumentenverarbeitung für deutsche und englische Rechnungen, Belege und Geschäftsdokumente.

### ✨ Core Features

- ✅ **Native German & English**: Vollständige UI, AI und Dokumentation in beiden Sprachen
- ✅ **Simpler than N8N**: Natural Language Automation Creation in deiner Sprache
- ✅ **GDPR-First**: Gebaut nach europäischen Datenschutzstandards
- ✅ **Complete User Control**: Sehen, exportieren und löschen Sie ALLE Ihre Daten
- ✅ **Multilingual AI**: Verarbeitet deutsche "Rechnung" und englische "Invoice" gleich gut
- ✅ **Auto Language Detection**: System erkennt Dokumentensprache automatisch
- ✅ **SME-Focused**: Templates für DACH und internationale Unternehmen

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+ (v4)
- **Components**: Shadcn/ui (Radix UI)
- **i18n**: next-intl
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **Database**: Supabase (PostgreSQL 15+)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime
- **Edge Functions**: Supabase Edge Functions (Deno)

### AI
- **Provider**: OpenAI
- **Models**: GPT-4 Turbo (multilingual)
- **Languages**: German, English
- **Future**: French, Spanish, Italian, Dutch

---

## 📦 Installation

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm
- Supabase Account
- OpenAI API Key

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Serhat17/Certusflow-App.git
cd Certusflow-App
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Variables**
Create a `.env.local` file:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Database Setup**
Run the SQL migrations in your Supabase project (see SQL schema below).

5. **Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
Certusflow-App/
├── app/
│   ├── [locale]/           # URL-based locale routing
│   │   ├── layout.tsx      # Root layout with i18n
│   │   ├── page.tsx        # Landing page
│   │   └── dashboard/      # Dashboard pages
│       │   ├── layout.tsx  # Dashboard layout with sidebar
│       │   └── page.tsx    # Dashboard overview
├── components/
│   ├── LanguageSwitcher.tsx
│   └── ui/                 # Shadcn/ui components
├── lib/
│   ├── ai/
│   │   ├── extractInvoiceMultilingual.ts
│   │   └── parseNaturalLanguageAutomation.ts
│   └── supabase/
│       └── client.ts
├── messages/
│   ├── de.json             # German translations
│   └── en.json             # English translations
├── i18n.ts                 # i18n configuration
├── middleware.ts           # Auto-detect user language
└── next.config.ts
```

---

## 🌍 Internationalization

### Supported Languages
- 🇩🇪 **German (de)** - Default for DACH region
- 🇬🇧 **English (en)**

### URL Structure
```
/de/dashboard           → German Dashboard
/en/dashboard           → English Dashboard
```

### Usage in Components
```tsx
import {useTranslations} from 'next-intl';

export default function Component() {
  const t = useTranslations('common');
  return <p>{t('appName')}</p>;
}
```

---

## 🎨 Design System

### Colors (Light Mode)
```css
--background: oklch(1 0 0);           /* Pure white */
--foreground: oklch(0.145 0 0);       /* Almost black */
--primary: oklch(0.145 0 0);          /* Dark */
--success: oklch(0.52 0.17 155);      /* Green */
--warning: oklch(0.75 0.18 85);       /* Amber */
--error: oklch(0.60 0.22 25);         /* Red */
```

### Typography
- **Font**: Inter (UI), JetBrains Mono (Code)
- **Base Size**: 16px
- **Scale**: 1.333 (Perfect Fourth)

---

## 🤖 AI Features

### Document Extraction
```typescript
import {extractInvoiceDataMultilingual} from '@/lib/ai/extractInvoiceMultilingual';

const result = await extractInvoiceDataMultilingual(
  documentText,
  'de', // user language
  true  // auto-detect document language
);
```

### Automation Parser
```typescript
import {parseNaturalLanguageAutomation} from '@/lib/ai/parseNaturalLanguageAutomation';

const result = await parseNaturalLanguageAutomation(
  "Gmail verbinden → Wenn Rechnung ankommt → Daten extrahieren",
  'de'
);
```

---

## 🔐 GDPR Compliance

- ✅ All data stored in EU (Supabase EU region)
- ✅ Users can export all their data
- ✅ Users can delete their account and data
- ✅ Row Level Security (RLS) enabled
- ✅ Audit logs for data access

---

## 🚀 Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Add environment variables
3. Deploy

```bash
git push origin main  # Auto-deploys
```

### Build Locally

```bash
npm run build
npm start
```

---

## 📊 Database Schema (Supabase SQL)

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  preferred_language VARCHAR(5) DEFAULT 'de',
  preferred_currency VARCHAR(3) DEFAULT 'EUR',
  preferred_timezone VARCHAR(50) DEFAULT 'Europe/Berlin',
  preferred_date_format VARCHAR(20) DEFAULT 'DD.MM.YYYY',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automations table
CREATE TABLE public.automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  workflow_config JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  last_run_at TIMESTAMPTZ,
  total_runs INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create extracted_documents table
CREATE TABLE public.extracted_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT,
  document_type VARCHAR(20) DEFAULT 'other',
  extracted_data JSONB,
  document_language VARCHAR(5),
  user_language VARCHAR(5),
  confidence_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Users can only access their own data)
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can view own automations" 
  ON public.automations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own documents" 
  ON public.extracted_documents FOR SELECT 
  USING (auth.uid() = user_id);
```

---

## 🧪 Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build production
npm run build
```

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Serhat17**
- GitHub: [@Serhat17](https://github.com/Serhat17)

---

Made with ❤️ in Europe 🇪🇺
