import React, { useState } from 'react';
import { Header } from '../ui/Header';
import { Sidebar } from '../ui/Sidebar';
import { Footer } from '../ui/Footer';
interface MainLayoutProps {
  children: React.ReactNode;
}
export function MainLayout({
  children
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return <div className="flex flex-col min-h-screen bg-gray-50">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeSection="communities" />
        <main className="flex-1 p-4 md:p-6 pt-20">{children}</main>
      </div>
      <Footer />
    </div>;
}