"use client";

import { Home, FileText, Calendar, MessageCircle } from "lucide-react";
import { NavLink } from "./nav-link";

const navItems = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/notices", icon: FileText, label: "Notices" },
  { href: "/timetable", icon: Calendar, label: "Timetable" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t z-50">
      <div className="flex justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </div>
    </nav>
  );
}
