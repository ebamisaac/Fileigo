"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile Drawer */}
      <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DialogContent className="fixed inset-y-0 left-0 h-full w-[280px] p-0 border-r border-border bg-card translate-x-0 translate-y-0 sm:rounded-none animate-in slide-in-from-left duration-300 top-0 left-0 flex flex-col">
          <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
          <div className="flex-1 overflow-y-auto">
            <Sidebar onLinkClick={() => setIsMobileMenuOpen(false)} className="w-full border-r-0" />
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col flex-1 h-full overflow-hidden w-full relative">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-background">
          <div className="mx-auto max-w-6xl w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
