"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, BookOpen, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Home",
    href: "/home",
    icon: Home,
  },
  {
    name: "Create",
    href: "/create",
    icon: Plus,
  },
  {
    name: "Journals",
    href: "/library",
    icon: BookOpen,
  },
  {
    name: "Vibe Check",
    href: "/vibe",
    icon: TrendingUp,
  },
];

export default function GlobalNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === "/home" && pathname === "/") ||
              (item.href === "/library" && pathname.startsWith("/entry"));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
