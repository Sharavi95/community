import React, { useState } from 'react';
import { MenuIcon, XIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { BuildingIcon, CreditCardIcon, NewspaperIcon, UsersIcon, GraduationCapIcon, TrendingUpIcon, CalendarIcon, SparklesIcon } from 'lucide-react';
interface MobileDrawerProps {
  isCompact?: boolean;
  onSignIn: () => void;
  isSignedIn: boolean;
}
const marketplaces = [{
  id: 'non-financial',
  name: 'Non-Financial Marketplace',
  description: 'Business registration, legal advisory, tax, compliance, and SME support services',
  icon: BuildingIcon,
  href: '/marketplace/non-financial'
}, {
  id: 'finance',
  name: 'Finance Marketplace',
  description: 'Funding options, grants, and financial services to help SMEs manage and grow',
  icon: CreditCardIcon,
  href: '/marketplace/finance'
}, {
  id: 'media',
  name: 'Media Marketplace',
  description: "News, articles, and updates on Abu Dhabi's business landscape with industry insights",
  icon: NewspaperIcon,
  href: '/marketplace/media'
}, {
  id: 'community',
  name: 'Community Marketplace',
  description: 'Industry communities for networking, collaboration, and sharing best practices',
  icon: UsersIcon,
  href: '/marketplace/community'
}, {
  id: 'course',
  name: 'Course Marketplace',
  description: 'Training and educational modules to build entrepreneurship skills and enhance businesses',
  icon: GraduationCapIcon,
  href: '/marketplace/courses'
}, {
  id: 'investment',
  name: 'Investment Marketplace',
  description: 'Access to venture capital, crowdfunding, and grants for SME growth',
  icon: TrendingUpIcon,
  href: '/marketplace/investment'
}, {
  id: 'calendar',
  name: 'Calendar Marketplace',
  description: 'Event management, matchmaking, and notifications for upcoming business events',
  icon: CalendarIcon,
  href: '/marketplace/calendar'
}, {
  id: 'opportunity',
  name: 'Opportunity Marketplace',
  description: 'Business opportunities, partnerships, and growth prospects for SMEs',
  icon: SparklesIcon,
  href: '/marketplace/opportunities'
}];
export function MobileDrawer({
  isCompact = false,
  onSignIn,
  isSignedIn
}: MobileDrawerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExploreExpanded, setIsExploreExpanded] = useState(false);
  const handleSignIn = () => {
    onSignIn();
    setIsDrawerOpen(false);
  };
  const handleCTAClick = (action: string) => {
    console.log(`${action} clicked`);
    setIsDrawerOpen(false);
  };
  const handleMarketplaceClick = (href: string) => {
    console.log('Navigate to:', href);
    setIsDrawerOpen(false);
  };
  const handleDiscoverClick = () => {
    console.log('Navigate to: Discover AbuDhabi');
    setIsDrawerOpen(false);
  };
  return <>
      {/* Always visible primary CTA + hamburger menu for Mobile (<768px) */}
      <div className="flex items-center space-x-2 md:hidden">
        {!isSignedIn && <button className={`px-3 py-2 bg-white text-teal-700 rounded-md hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 font-medium ${isCompact ? 'text-sm px-2 py-1.5' : 'text-sm'}`} onClick={() => handleCTAClick('Make an Enquiry')}>
            Enquiry
          </button>}
        {/* Hamburger menu button */}
        <button className={`p-2 text-white hover:bg-white/10 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 ${isCompact ? 'p-1.5' : ''}`} onClick={() => setIsDrawerOpen(!isDrawerOpen)} aria-label="Open navigation menu" aria-expanded={isDrawerOpen}>
          {isDrawerOpen ? <XIcon size={isCompact ? 20 : 24} /> : <MenuIcon size={isCompact ? 20 : 24} />}
        </button>
      </div>
      {/* Tablet hamburger menu (768px - 1023px) */}
      <div className="hidden md:flex lg:hidden items-center">
        <button className={`p-2 text-white hover:bg-white/10 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 ${isCompact ? 'p-1.5' : ''}`} onClick={() => setIsDrawerOpen(!isDrawerOpen)} aria-label="Open navigation menu" aria-expanded={isDrawerOpen}>
          {isDrawerOpen ? <XIcon size={isCompact ? 20 : 24} /> : <MenuIcon size={isCompact ? 20 : 24} />}
        </button>
      </div>
      {/* Mobile and Tablet drawer overlay */}
      {isDrawerOpen && <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsDrawerOpen(false)} />
          {/* Mobile and Tablet drawer */}
          <div className="fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-gray-50 to-white shadow-xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
                <h2 className="text-lg font-semibold text-gray-800 md:text-base sm:text-sm">
                  Menu
                </h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-md transition-colors" aria-label="Close menu">
                  <XIcon size={18} className="text-gray-600" />
                </button>
              </div>
              {/* Drawer content - scrollable area */}
              <div className={`flex-1 overflow-y-auto ${!isSignedIn ? 'pb-20' : ''}`}>
                {/* Navigation Section - Show for Mobile only, Tablet has these in header */}
                <div className="px-4 py-3 md:hidden">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 md:text-[11px] sm:text-[10px]">
                    Navigation
                  </h3>
                  {/* Explore Accordion */}
                  <div className="mb-1">
                    <button className="w-full flex items-center justify-between px-3 py-2.5 text-left text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium tracking-tight md:text-[13px] sm:text-xs md:py-2 sm:py-1.5" onClick={() => setIsExploreExpanded(!isExploreExpanded)} aria-expanded={isExploreExpanded}>
                      <span>Explore Marketplaces</span>
                      <ChevronDownIcon size={14} className={`text-gray-500 transition-transform md:w-3 md:h-3 sm:w-3 sm:h-3 ${isExploreExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExploreExpanded && <div className="mt-1 ml-3 space-y-0.5">
                        {marketplaces.map(marketplace => {
                    const Icon = marketplace.icon;
                    return <button key={marketplace.id} className="w-full flex items-start px-2.5 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors md:py-1.5 sm:py-1" onClick={() => handleMarketplaceClick(marketplace.href)}>
                              <div className="flex-shrink-0 mt-0.5">
                                <Icon size={14} className="text-teal-600 md:w-3 md:h-3 sm:w-3 sm:h-3" />
                              </div>
                              <div className="ml-2.5 flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-gray-900 truncate leading-tight md:text-xs sm:text-[11px]">
                                  {marketplace.name}
                                </p>
                                <p className="text-[11px] text-gray-500 mt-0.5 leading-[1.4] line-clamp-2 md:text-[10px] sm:text-[9px]">
                                  {marketplace.description}
                                </p>
                              </div>
                            </button>;
                  })}
                      </div>}
                  </div>
                  {/* Discover AbuDhabi */}
                  <button className="w-full flex items-center justify-between px-3 py-2.5 text-left text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium tracking-tight md:text-[13px] sm:text-xs md:py-2 sm:py-1.5" onClick={handleDiscoverClick}>
                    <span>Discover AbuDhabi</span>
                    <ChevronRightIcon size={14} className="text-gray-400 md:w-3 md:h-3 sm:w-3 sm:h-3" />
                  </button>
                </div>
                {/* Divider - Only show for mobile */}
                <div className="border-t border-gray-200 mx-4 my-2 md:hidden"></div>
                {/* Get Started Section - Always visible, contains both CTAs */}
                <div className="px-4 py-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 md:text-[11px] sm:text-[10px]">
                    Get Started
                  </h3>
                  <div className="space-y-1">
                    {/* Become a Partner - Always visible */}
                    <button className="w-full flex items-center justify-between px-3 py-2.5 text-left text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium tracking-tight md:text-[13px] sm:text-xs md:py-2 sm:py-1.5" onClick={() => handleCTAClick('Become a Partner')}>
                      <span>Become a Partner</span>
                      <ChevronRightIcon size={14} className="text-gray-400 md:w-3 md:h-3 sm:w-3 sm:h-3" />
                    </button>
                    {/* Make an Enquiry - Only for non-signed-in users, styled as emphasized menu item */}
                    {!isSignedIn && <button className="w-full flex items-center justify-between px-3 py-2.5 text-left text-teal-700 hover:bg-teal-50 rounded-lg transition-colors text-sm font-bold tracking-tight md:text-[13px] sm:text-xs md:py-2 sm:py-1.5 border-l-3 border-teal-600" onClick={() => handleCTAClick('Make an Enquiry')}>
                        <span>Make an Enquiry</span>
                        <ChevronRightIcon size={14} className="text-teal-600 md:w-3 md:h-3 sm:w-3 sm:h-3" />
                      </button>}
                  </div>
                </div>
              </div>
              {/* Sticky Sign In CTA at bottom - Only for non-signed-in users */}
              {!isSignedIn && <div className="sticky bottom-0 left-0 right-0 px-4 py-4 border-t border-gray-200 bg-white shadow-lg">
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg transition-all duration-200 hover:from-teal-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-base tracking-tight shadow-md md:text-[15px] sm:text-sm" onClick={handleSignIn}>
                    Sign In to Get Started
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2 md:text-[11px] sm:text-[10px]">
                    Access your personalized dashboard
                  </p>
                </div>}
              {/* Drawer footer - Only for signed-in users */}
              {isSignedIn && <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    <div className="text-[11px] text-gray-500 md:text-[10px] sm:text-[9px]">
                      Enterprise Journey
                    </div>
                  </div>
                </div>}
            </div>
          </div>
        </>}
    </>;
}