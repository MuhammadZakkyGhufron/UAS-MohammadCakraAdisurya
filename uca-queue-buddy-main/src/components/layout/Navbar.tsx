import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Building2, Users, Monitor, BarChart3, Ticket, Lock, UserCog, ShieldCheck } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Beranda', icon: Building2 },
  { path: '/customer', label: 'Ambil Antrian', icon: Ticket },
  { path: '/display', label: 'Display', icon: Monitor },
  { path: '/officer', label: 'Petugas', icon: Users },
  { path: '/statistics', label: 'Statistik', icon: BarChart3 },
  { path: '/auth', label: 'Login', icon: Lock },
  { path: '/users', label: 'Kelola User', icon: UserCog },
  { path: '/admins', label: 'Kelola Admin', icon: ShieldCheck },
];

export const Navbar = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">Sistem Antrian Bank UCA</span>
            <span className="text-xs text-muted-foreground">Muhammad Zakky Ghufron | NIM: 2222105151</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-1">
          {navItems.slice(1).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center justify-center p-2 rounded-lg transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
