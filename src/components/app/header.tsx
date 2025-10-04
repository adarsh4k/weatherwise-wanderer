import { SunSnow } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <SunSnow className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          WeatherWise Wanderer
        </h1>
      </div>
    </header>
  );
}
