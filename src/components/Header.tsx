/**
 * Header Component
 *
 * Main navigation header with search trigger and mobile menu.
 * Search functionality is now decoupled via SearchContext.
 */

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Play from 'lucide-react/dist/esm/icons/play';
import Menu from 'lucide-react/dist/esm/icons/menu';
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SearchDialog, SearchTrigger } from "@/components/SearchDialog";

export function Header() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Build nav links with translations
  // Note: t is excluded from deps - it's called inside useMemo but translations are cached
  // Only language change should trigger navLinks recreation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const navLinks = useMemo(() => [
    { path: `/${language}`, label: t("nav.home") },
    { path: `/${language}/terbaru`, label: t("nav.latest") },
    { path: `/${language}/terpopuler`, label: t("nav.popular") },
    { path: `/${language}/sulih-suara`, label: t("nav.dubbed") },
  ], [language]);

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${language}`} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">
              DramaBox
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`nav-link ${pathname === link.path ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Language Selector, Search & Mobile Menu */}
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <SearchTrigger />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl hover:bg-muted/50 transition-colors md:hidden"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50 animate-fade-up">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={handleMobileMenuClose}
                className={`block py-3 px-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === link.path
                    ? "text-foreground bg-muted/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {/* Search Dialog (rendered via portal in SearchDialog component) */}
      <SearchDialog />
    </header>
  );
}
