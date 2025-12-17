import { cn } from '@/lib/utils';

export function Header({ className }: { className?: string }) {
  return (
    <header className={cn('relative overflow-hidden py-6 md:py-8', className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-cricket-primary via-cricket-secondary to-cricket-primary animate-gradient-x" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-30" />
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
          KAPL
          <span className="block text-lg md:text-2xl font-semibold text-cricket-accent mt-1">
            SEASON 2
          </span>
        </h1>
      </div>
    </header>
  );
}
