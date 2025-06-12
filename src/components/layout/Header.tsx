import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Hospital, Search, LogIn, UserPlus } from 'lucide-react';

export function Header() {
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/search', label: 'Search Hospitals' },
    { href: '/#features', label: 'Features' },
    { href: '/contact', label: 'Contact Us' },
  ];

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
          <Hospital className="h-8 w-8" />
          <h1 className="text-2xl font-bold font-headline">HospConnect</h1>
        </Link>

        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {navItems.map((item) => (
            <Button key={item.label} variant="ghost" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Link>
          </Button>
          <Button asChild>
            <Link href="/register">
              <UserPlus className="mr-2 h-4 w-4" /> Register
            </Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Button key={item.label} variant="ghost" className="justify-start text-lg" asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <Button variant="outline" className="w-full justify-start text-lg" asChild>
                    <Link href="/login">
                      <LogIn className="mr-2 h-5 w-5" /> Login
                    </Link>
                  </Button>
                  <Button className="w-full justify-start text-lg" asChild>
                    <Link href="/register">
                      <UserPlus className="mr-2 h-5 w-5" /> Register
                    </Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
