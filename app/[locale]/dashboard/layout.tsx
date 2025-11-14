'use client';

import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {usePathname, useParams, useRouter} from 'next/navigation';
import {Home, Zap, FileText, Settings, HelpCircle, LogOut, LinkIcon} from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {createClient} from '@/lib/supabase/client';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  }

  const navigation = [
    {href: `/${locale}/dashboard`, label: t('dashboard'), icon: Home},
    {href: `/${locale}/dashboard/automations`, label: t('automations'), icon: Zap},
    {href: `/${locale}/dashboard/documents`, label: t('documents'), icon: FileText},
    {href: `/${locale}/dashboard/integrations`, label: t('integrations'), icon: LinkIcon},
    {href: `/${locale}/dashboard/settings`, label: t('settings'), icon: Settings},
    {href: `/${locale}/dashboard/help`, label: t('help'), icon: HelpCircle},
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-semibold">🚀 CertusFlow</h1>
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md
                  transition-colors
                  ${isActive 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border space-y-2">
          <div className="px-3">
            <LanguageSwitcher />
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t('logout')}
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
