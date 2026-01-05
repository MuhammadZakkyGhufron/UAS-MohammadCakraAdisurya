import { Building2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">
              Sistem Antrian Bank UCA
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Bank UCA. Semua hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
};
