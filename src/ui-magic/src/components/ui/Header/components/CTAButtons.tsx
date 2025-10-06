import React, { useState } from 'react';
import { MenuIcon, XIcon } from 'lucide-react';
interface CTAButtonsProps {
  isCompact?: boolean;
  onSignIn: () => void;
}
export function CTAButtons({
  isCompact = false,
  onSignIn
}: CTAButtonsProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleSignIn = () => {
    onSignIn();
    setIsMobileMenuOpen(false);
  };
  const handleCTAClick = (action: string) => {
    console.log(`${action} clicked`);
    setIsMobileMenuOpen(false);
  };
  return <>
      {/* Desktop CTAs */}
      <div className="hidden md:flex items-center space-x-3">
        <button className={`px-4 py-2 text-white border border-white/30 rounded-md hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 ${isCompact ? 'text-sm px-3 py-1.5' : ''}`} onClick={() => handleCTAClick('Become a Partner')}>
          Become a Partner
        </button>
        <button className={`px-4 py-2 bg-white text-teal-700 rounded-md hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 font-medium ${isCompact ? 'text-sm px-3 py-1.5' : ''}`} onClick={() => handleCTAClick('Make an Enquiry')}>
          Make an Enquiry
        </button>
        <button className={`px-4 py-2 text-white border border-white/50 rounded-md hover:bg-white hover:text-teal-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 ${isCompact ? 'text-sm px-3 py-1.5' : ''}`} onClick={handleSignIn}>
          Sign In
        </button>
      </div>
      {/* Mobile - Always visible primary CTA */}
      <div className="md:hidden flex items-center space-x-2">
        <button className={`px-3 py-2 bg-white text-teal-700 rounded-md hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 font-medium ${isCompact ? 'text-sm px-2 py-1.5' : 'text-sm'}`} onClick={() => handleCTAClick('Make an Enquiry')}>
          Enquiry
        </button>
        {/* Mobile menu button */}
        <button className={`p-2 text-white hover:bg-white/10 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 ${isCompact ? 'p-1.5' : ''}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Open mobile menu" aria-expanded={isMobileMenuOpen}>
          {isMobileMenuOpen ? <XIcon size={isCompact ? 20 : 24} /> : <MenuIcon size={isCompact ? 20 : 24} />}
        </button>
      </div>
      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2 md:hidden">
          <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150" onClick={() => handleCTAClick('Become a Partner')}>
            Become a Partner
          </button>
          <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150" onClick={() => handleCTAClick('Make an Enquiry')}>
            Make an Enquiry
          </button>
          <hr className="my-1 border-gray-200" />
          <button className="w-full text-left px-4 py-3 text-teal-700 font-medium hover:bg-gray-50 transition-colors duration-150" onClick={handleSignIn}>
            Sign In
          </button>
        </div>}
    </>;
}