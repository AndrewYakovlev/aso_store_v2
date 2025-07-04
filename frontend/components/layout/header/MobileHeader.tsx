'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  Bars3Icon,
  PhoneIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { MobileMenu } from './MobileMenu';
import { PhoneModal } from './PhoneModal';
import { CallbackModal } from './CallbackModal';
import { SearchOverlay } from './SearchOverlay';

export function MobileHeader() {
  const { user, login } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [callbackModalOpen, setCallbackModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleAuthSuccess = (data: any) => {
    login(data.accessToken, data.refreshToken, data.user);
  };

  const handleAccountClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b md:hidden">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left section with menu and logo */}
            <div className="flex items-center gap-2">
              {/* Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="h-[37px] px-2 hover:bg-gray-100 rounded-lg flex items-center justify-center"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Logo */}
              <Logo className="flex-shrink-0" width={120} height={37} />
            </div>

            {/* Right buttons */}
            <div className="flex items-center gap-1">
              {/* Phone */}
              <button
                onClick={() => setPhoneModalOpen(true)}
                className="h-[37px] px-2 hover:bg-gray-100 rounded-lg flex items-center justify-center"
              >
                <PhoneIcon className="h-5 w-5" />
              </button>

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="h-[37px] px-2 hover:bg-gray-100 rounded-lg flex items-center justify-center"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {/* Account */}
              <Link
                href="/account"
                onClick={handleAccountClick}
                className="h-[37px] px-2 hover:bg-gray-100 rounded-lg flex items-center justify-center"
              >
                <UserIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Modals and overlays */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onCallbackClick={() => setCallbackModalOpen(true)}
      />
      
      <PhoneModal
        isOpen={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        onCallbackClick={() => setCallbackModalOpen(true)}
      />
      
      <CallbackModal
        isOpen={callbackModalOpen}
        onClose={() => setCallbackModalOpen(false)}
      />
      
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
      
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}