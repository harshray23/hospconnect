
// This is a basic layout for the platform admin section.
// It can be expanded with its own sidebar, header, etc. as needed.

import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import { Briefcase, Megaphone, Settings } from "lucide-react";

export default function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-800 text-white p-4 space-y-6 fixed h-full shadow-lg">
        <div className="text-center">
          <Link href="/platform-admin/dashboard">
            <h1 className="text-2xl font-bold font-headline">Platform Admin</h1>
          </Link>
        </div>
        <nav className="space-y-2">
          <Link href="/platform-admin/announcements" className="flex items-center space-x-2 p-2 hover:bg-slate-700 rounded-md transition-colors">
            <Megaphone className="h-5 w-5" />
            <span>Announcements</span>
          </Link>
          <Link href="/platform-admin/contact-gov" className="flex items-center space-x-2 p-2 hover:bg-slate-700 rounded-md transition-colors">
            <Briefcase className="h-5 w-5" />
            <span>Contact Gov. Services</span>
          </Link>
          {/* Add more admin links here */}
          <Link href="/platform-admin/settings" className="flex items-center space-x-2 p-2 hover:bg-slate-700 rounded-md transition-colors">
             <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 ml-64 bg-slate-50">
        {children}
        <Toaster />
      </main>
    </div>
  );
}
