import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Shield, Trophy, GitBranch } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Live', icon: Home },
  { path: '/admin', label: 'Admin', icon: Shield },
  { path: '/points', label: 'Points', icon: Trophy },
  { path: '/bracket', label: 'Bracket', icon: GitBranch },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t md:relative md:border-t-0 md:border-b">
      <div className="container mx-auto">
        <div className="flex items-center justify-around md:justify-center md:gap-1 py-2 md:py-3">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-lg transition-all',
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs md:text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
