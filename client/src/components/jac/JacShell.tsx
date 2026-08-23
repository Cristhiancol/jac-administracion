import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Building2, CalendarDays, Landmark, Menu, Moon, Newspaper, ShieldCheck, Sun, WalletCards } from "lucide-react";
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
  { href: "/institucion", label: "Ficha institucional", icon: Building2 },
  { href: "/noticias", label: "Noticias", icon: Newspaper },
];

export function JacShell({ children, eyebrow, title, description }: { children: ReactNode; eyebrow: string; title: string; description: string }) {
  const [location] = useLocation();
  const { isAuthenticated, user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#f5c451]/40">
      <header className="sticky top-0 z-50 border-b border-emerald-950/5 bg-background/90 backdrop-blur-xl">
        <div className="container flex h-18 items-center justify-between gap-4 py-3">
          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="Inicio JAC Bellavista 1991">
            <JacLogo className="transition-transform duration-200 group-hover:-rotate-2" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
            {navigation.map(item => {
              const Icon = item.icon;
              const active = item.href === location;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                    active ? "bg-sky-100 text-[#0F4C81]" : "text-emerald-950/65 hover:bg-emerald-50 hover:text-[#0F4C81]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-xl border-emerald-900/15 bg-card" onClick={toggleTheme} aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}>
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            {!loading && (isAuthenticated ? (
              <Button variant="outline" onClick={logout} className="hidden rounded-xl border-emerald-900/15 bg-white text-emerald-900 sm:inline-flex">
                Salir{user?.name ? ` · ${user.name.split(" ")[0]}` : ""}
              </Button>
            ) : (
              <Button onClick={startLogin} className="rounded-xl bg-[#0F4C81] text-white shadow-sm hover:bg-[#0b3b65]">
                Ingresar
              </Button>
            ))}
            <Button variant="outline" size="icon" className="rounded-xl border-emerald-900/15 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Abrir menú">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {mobileOpen ? (
          <nav className="container grid gap-1 border-t border-emerald-950/5 py-3 lg:hidden" aria-label="Navegación móvil">
            {navigation.map(item => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-emerald-950 hover:bg-emerald-50">
                  <Icon className="h-4 w-4 text-emerald-700" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </header>

      <main className="container py-8 sm:py-12">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</p>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">{title}</h1>
          <p className="mt-3 text-base leading-7 text-emerald-950/65">{description}</p>
        </div>
        {children}
      </main>

      <footer className="border-t border-emerald-950/5 bg-white/50">
        <div className="container flex flex-col justify-between gap-2 py-5 text-xs text-emerald-950/55 sm:flex-row">
          <span>JAC Bellavista 1991 · Localidad de Usme</span>
          <span>Todos Somos Comunidad · Trazabilidad comunitaria</span>
        </div>
      </footer>
    </div>
  );
}
