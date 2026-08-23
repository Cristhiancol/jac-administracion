import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Building2,
  CalendarDays,
  Landmark,
  Menu,
  Moon,
  Newspaper,
  ShieldCheck,
  Sun,
  WalletCards,
  UserCheck,
} from "lucide-react";
import React, { type ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { JacLogo } from "@/components/JacLogo";

const navigation = [
  { href: "/", label: "Inicio", icon: Landmark },
  { href: "/plan-de-trabajo", label: "Plan comunal", icon: CalendarDays },
  { href: "/obligaciones", label: "Obligaciones", icon: ShieldCheck },
  { href: "/finanzas", label: "Finanzas", icon: WalletCards },
  { href: "/institucion", label: "Ficha e Identidad", icon: Building2 },
  { href: "/noticias", label: "Noticias Usme", icon: Newspaper },
];

export function JacShell({
  children,
  eyebrow,
  title,
  description,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  const [location] = useLocation();
  const { isAuthenticated, user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-amber-400/30">
      {/* Sticky Institutional Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl transition-colors shadow-xs">
        <div className="container flex h-20 items-center justify-between gap-4 py-3">
          {/* Logo & Brand Title */}
          <Link href="/" className="group flex items-center gap-3">
            <JacLogo size="md" variant="full" animated={true} />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center gap-1.5 lg:flex"
            aria-label="Navegación principal"
          >
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = item.href === location;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200",
                    active
                      ? "bg-[#0F4C81] text-white shadow-sm dark:bg-[#1B8A5A]"
                      : "text-foreground/80 hover:bg-[#0F4C81]/10 hover:text-[#0F4C81] dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-amber-300" : "text-[#1B8A5A]")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-border bg-card hover:bg-muted text-foreground transition-colors"
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
            >
              {theme === "light" ? <Moon className="h-4.5 w-4.5 text-[#0F4C81]" /> : <Sun className="h-4.5 w-4.5 text-amber-400" />}
            </Button>

            {/* Auth Buttons */}
            {!loading &&
              (isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="hidden text-xs font-semibold text-emerald-800 dark:text-emerald-300 xl:inline-block bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-300/40">
                    <UserCheck className="h-3.5 w-3.5 inline mr-1 text-emerald-600" />
                    {user?.name ? user.name.split(" ")[0] : "Afiliado"}
                  </span>
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="hidden rounded-xl border-emerald-700/20 bg-card hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 text-foreground sm:inline-flex text-xs font-bold"
                  >
                    Salir
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={startLogin}
                  className="rounded-xl bg-[#1B8A5A] text-white shadow-md hover:bg-[#166534] transition-all font-bold px-4"
                >
                  Ingresar Afiliado
                </Button>
              ))}

            {/* Mobile Menu Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-border lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Abrir o cerrar menú de navegación"
            >
              <Menu className="h-5 w-5 text-[#0F4C81] dark:text-emerald-400" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileOpen && (
          <nav
            className="container grid gap-1.5 border-t border-border py-4 lg:hidden animate-in fade-in slide-in-from-top-2 bg-card"
            aria-label="Navegación móvil institucional"
          >
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = item.href === location;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                    active
                      ? "bg-[#0F4C81] text-white font-bold dark:bg-[#1B8A5A]"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5", active ? "text-amber-300" : "text-[#1B8A5A]")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Main Content Area */}
      <main className="container py-8 sm:py-12">
        <div className="mb-8 max-w-3xl border-l-4 border-[#1B8A5A] pl-4 sm:pl-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#1B8A5A] dark:text-emerald-400">
            {eyebrow}
          </p>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2.5 text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/60 backdrop-blur-md">
        <div className="container flex flex-col justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <JacLogo size="xs" variant="icon" />
            <span className="font-semibold text-foreground">
              Junta de Acción Comunal Bellavista (1991) · Localidad de Usme, Bogotá D.C.
            </span>
          </div>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
            "Todos Somos Comunidad" · Ficha Institucional y Gestión Participativa
          </span>
        </div>
      </footer>
    </div>
  );
}
