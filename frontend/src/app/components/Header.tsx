"use client";

import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
  return (
    <header className="w-full border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Cafe Finder</h1>
        <DarkModeToggle />
      </div>
    </header>
  );
}
