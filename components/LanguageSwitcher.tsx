'use client';

import {useLocale} from 'next-intl';
import {useRouter, usePathname} from 'next/navigation';
import {useState, useEffect} from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Button} from '@/components/ui/button';
import {Globe} from 'lucide-react';

const languages = {
  de: {name: 'Deutsch', flag: '🇩🇪'},
  en: {name: 'English', flag: '🇬🇧'},
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function switchLanguage(newLocale: string) {
    // Replace locale in URL
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  }

  // Render a placeholder button during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Globe className="w-4 h-4 mr-2" />
        {languages[locale as keyof typeof languages].flag}{' '}
        {languages[locale as keyof typeof languages].name}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Globe className="w-4 h-4 mr-2" />
          {languages[locale as keyof typeof languages].flag}{' '}
          {languages[locale as keyof typeof languages].name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, {name, flag}]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => switchLanguage(code)}
            className={locale === code ? 'bg-accent' : ''}
          >
            {flag} {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
