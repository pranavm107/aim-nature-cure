import React, { useState } from 'react';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';

const AppShell = ({ children, isAuthRoute, isAuthenticated }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // For unauthenticated routes like login or forgot password, we just render the children
  if (isAuthRoute || !isAuthenticated) {
    return <div className="w-full min-h-screen bg-[#F8F9FD] overflow-hidden">{children}</div>;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8F9FD]">
      {/* Sidebar for Desktop & Mobile Drawer */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <AppHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
