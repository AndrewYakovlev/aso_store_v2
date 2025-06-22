'use client';

import { MobileHeader } from './MobileHeader';
import { TabletHeader } from './TabletHeader';
import { DesktopHeader } from './DesktopHeader';
import { MobileBottomNav } from './MobileBottomNav';

export function HeaderWrapper() {
  return (
    <>
      {/* Mobile Header - visible on mobile only */}
      <MobileHeader />
      
      {/* Tablet Header - visible on tablets only */}
      <TabletHeader />
      
      {/* Desktop Header - visible on desktop only */}
      <DesktopHeader />
      
      {/* Mobile Bottom Navigation - visible on mobile only */}
      <MobileBottomNav />
    </>
  );
}