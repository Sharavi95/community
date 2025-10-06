import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, SearchIcon, FilterIcon, XIcon, BellIcon } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { mockNotifications, Notification } from '../utils/mockNotifications';
interface NotificationCenterProps {
  onBack: () => void;
}
export function NotificationCenter({
  onBack
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Fetch notifications
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  }, []);
  // Get all unique categories
  const categories = Array.from(new Set(notifications.map(n => n.category))).filter(category => category !== 'Updates' && category !== 'Profile').filter(Boolean) as string[];
  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread' && notification.read) return false;
    if (searchQuery && !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategories.length > 0 && !selectedCategories.includes(notification.category || '')) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    } else {
      return new Date(a.time).getTime() - new Date(b.time).getTime();
    }
  });
  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => notif.id === id ? {
      ...notif,
      read: true
    } : notif));
  };
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({
      ...notif,
      read: true
    })));
  };
  // Toggle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
    setActiveTab('all');
    setSortBy('newest');
  };
  // Group notifications by date
  const groupNotificationsByDate = () => {
    const groups: {
      [key: string]: typeof notifications;
    } = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Earlier: []
    };
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    filteredNotifications.forEach(notification => {
      const notifDate = new Date(notification.time);
      if (notifDate.toDateString() === today.toDateString()) {
        groups['Today'].push(notification);
      } else if (notifDate.toDateString() === yesterday.toDateString()) {
        groups['Yesterday'].push(notification);
      } else if (notifDate > thisWeekStart) {
        groups['This Week'].push(notification);
      } else {
        groups['Earlier'].push(notification);
      }
    });
    return groups;
  };
  const groupedNotifications = groupNotificationsByDate();
  // Loading state
  if (loading) {
    return <div className="bg-white h-full flex flex-col items-center justify-center rounded-lg overflow-hidden max-h-[80vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading notifications...</p>
      </div>;
  }
  // Error state
  if (error) {
    return <div className="bg-white h-full flex flex-col items-center justify-center rounded-lg overflow-hidden max-h-[80vh] p-6">
        <div className="text-red-500 mb-4">
          <XIcon size={48} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>;
  }
  return <div className="bg-white h-full flex flex-col rounded-lg overflow-hidden max-h-[80vh]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button className="mr-3 p-1 rounded-full hover:bg-gray-100" onClick={onBack} aria-label="Go back">
            <ArrowLeftIcon size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
        </div>
        <div className="flex items-center">
          {notifications.some(n => !n.read) && <button className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50" onClick={markAllAsRead}>
              Mark all as read
            </button>}
        </div>
      </div>
      {/* Search and Filters */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon size={16} className="text-gray-400" />
          </div>
          <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Search notifications..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          {searchQuery && <button className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setSearchQuery('')}>
              <XIcon size={16} className="text-gray-400 hover:text-gray-600" />
            </button>}
        </div>
        <div className="flex mt-3 border-b border-gray-200 items-center">
          <button className={`px-4 py-2 text-sm font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('all')}>
            All
          </button>
          <button className={`px-4 py-2 text-sm font-medium ${activeTab === 'unread' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('unread')}>
            Unread
          </button>
          <div className="ml-auto flex items-center">
            <button className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 mr-2" onClick={() => setShowFilters(!showFilters)} aria-label="Filter notifications">
              <FilterIcon size={16} />
            </button>
            <span className="text-xs text-gray-500 mr-2">Sort by:</span>
            <select className="text-xs border-none bg-transparent text-gray-700 focus:outline-none focus:ring-0" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>
      {/* Category Filters */}
      {showFilters && <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              Filter by category
            </h3>
            <button className="text-xs text-blue-600 hover:text-blue-800" onClick={clearFilters}>
              Clear all filters
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => <button key={category} className={`text-xs px-3 py-1 rounded-full ${selectedCategories.includes(category) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`} onClick={() => toggleCategory(category)}>
                {category}
              </button>)}
          </div>
        </div>}
      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedNotifications).map(([date, notifs]) => notifs.length > 0 && <div key={date}>
                <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h3 className="text-xs font-medium text-gray-500">{date}</h3>
                </div>
                {notifs.map(notification => <NotificationItem key={notification.id} {...notification} onMarkAsRead={markAsRead} expanded={true} />)}
              </div>)}
        {filteredNotifications.length === 0 && <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-gray-400 mb-2">
              <BellIcon size={48} strokeWidth={1} />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              No notifications found
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery || selectedCategories.length > 0 || activeTab === 'unread' ? 'Try adjusting your filters to see more results' : "You're all caught up!"}
            </p>
            {(searchQuery || selectedCategories.length > 0 || activeTab === 'unread') && <button className="mt-4 px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100" onClick={clearFilters}>
                Clear filters
              </button>}
          </div>}
      </div>
    </div>;
}