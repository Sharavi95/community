export interface Notification {
  id: string;
  type: 'critical' | 'message' | 'update';
  message: string;
  time: string;
  read: boolean;
  actionUrl: string;
  category?: string;
}
export const mockNotifications: Notification[] = [{
  id: '1',
  type: 'critical',
  message: 'Your account security settings have been updated',
  time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  // 5 minutes ago
  read: false,
  actionUrl: '/security',
  category: 'Security'
}, {
  id: '2',
  type: 'message',
  message: 'New message from Enterprise Journey support team',
  time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  // 30 minutes ago
  read: false,
  actionUrl: '/messages',
  category: 'Messages'
}, {
  id: '3',
  type: 'update',
  message: 'Your subscription plan has been renewed successfully',
  time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  // 2 hours ago
  read: true,
  actionUrl: '/billing',
  category: 'Billing'
}, {
  id: '4',
  type: 'message',
  message: 'Welcome to Enterprise Journey! Get started with our quick tour',
  time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  // 1 day ago
  read: true,
  actionUrl: '/tour',
  category: 'Getting Started'
}, {
  id: '5',
  type: 'critical',
  message: 'Failed login attempt detected from unknown device',
  time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  // 2 days ago
  read: false,
  actionUrl: '/security',
  category: 'Security'
}, {
  id: '6',
  type: 'update',
  message: 'New features available in your dashboard',
  time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  // 3 days ago
  read: true,
  actionUrl: '/features',
  category: 'Features'
}, {
  id: '7',
  type: 'message',
  message: 'Your monthly report is ready for review',
  time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  // 1 week ago
  read: true,
  actionUrl: '/reports',
  category: 'Reports'
}];