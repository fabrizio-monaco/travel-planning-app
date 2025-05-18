'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, Plus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

export function Navbar() {
  const [open, setOpen] = useState(false);

  const closeSheet = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-bold text-xl tracking-tight flex items-center gap-2"
          >
            <span className="text-primary">Travel</span>
            <span>Planner</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-6">
            <Link
              href="/trips"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Trips
            </Link>
            <Link
              href="/destinations"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Destinations
            </Link>
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader className="mb-4">
                <SheetTitle>Travel Planner</SheetTitle>
                <SheetDescription>
                  Navigate to your destinations
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col space-y-4">
                <Link
                  href="/trips"
                  className="px-4 py-2 rounded-md hover:bg-accent"
                  onClick={closeSheet}
                >
                  Trips
                </Link>
                <Link
                  href="/destinations"
                  className="px-4 py-2 rounded-md hover:bg-accent"
                  onClick={closeSheet}
                >
                  Destinations
                </Link>
                <Link
                  href="/trips/new"
                  className="px-4 py-2 rounded-md hover:bg-accent"
                  onClick={closeSheet}
                >
                  New Trip
                </Link>
                <Link
                  href="/destinations/new"
                  className="px-4 py-2 rounded-md hover:bg-accent"
                  onClick={closeSheet}
                >
                  New Destination
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/trips/new">
              <Plus className="h-4 w-4 mr-1" /> Trip
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/destinations/new">
              <Plus className="h-4 w-4 mr-1" /> Destination
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
