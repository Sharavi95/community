// Mock data for the communities application
export interface User {
  id: string;
  name: string;
  avatar: string;
  title: string;
  company: string;
  bio: string;
  joinDate: string;
  communities: string[];
}
export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  postCount: number;
  createdAt: string;
  logo: string;
  coverImage: string;
  tags: string[];
  isEnterprise: boolean;
}
export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  communityId: string;
  createdAt: string;
  likes: number;
  commentCount: number;
  tags: string[];
}
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
  likes: number;
}
// Mock users
export const users: User[] = [{
  id: 'u1',
  name: 'Alex Johnson',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  title: 'Enterprise Architect',
  company: 'TechCorp Solutions',
  bio: 'Enterprise architect with 10+ years experience in cloud infrastructure and microservices.',
  joinDate: '2023-01-15',
  communities: ['c1', 'c2', 'c3']
}, {
  id: 'u2',
  name: 'Sarah Miller',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  title: 'DevOps Lead',
  company: 'Innovative Systems',
  bio: 'DevOps engineer specializing in CI/CD pipelines and infrastructure automation.',
  joinDate: '2023-02-20',
  communities: ['c1', 'c4']
}, {
  id: 'u3',
  name: 'Michael Chen',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  title: 'Solution Architect',
  company: 'Enterprise Solutions Ltd',
  bio: 'Solution architect focused on enterprise integration patterns and API design.',
  joinDate: '2023-03-10',
  communities: ['c2', 'c3', 'c5']
}];
// Mock communities
export const communities: Community[] = [{
  id: 'c1',
  name: 'Cloud Architecture',
  description: 'Discussion forum for enterprise cloud architecture patterns, best practices, and implementation strategies.',
  category: 'Architecture',
  memberCount: 1250,
  postCount: 325,
  createdAt: '2023-01-01',
  logo: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
  coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
  tags: ['Cloud', 'Architecture', 'AWS', 'Azure', 'GCP'],
  isEnterprise: true
}, {
  id: 'c2',
  name: 'Microservices Patterns',
  description: 'Community focused on microservices architecture, design patterns, and implementation strategies for enterprise applications.',
  category: 'Architecture',
  memberCount: 980,
  postCount: 215,
  createdAt: '2023-01-15',
  logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
  coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
  tags: ['Microservices', 'API Design', 'Integration', 'Patterns'],
  isEnterprise: true
}, {
  id: 'c3',
  name: 'Enterprise DevOps',
  description: 'Discussions on implementing DevOps practices in enterprise environments, including CI/CD, infrastructure as code, and automation.',
  category: 'DevOps',
  memberCount: 1450,
  postCount: 410,
  createdAt: '2023-01-30',
  logo: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
  coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
  tags: ['DevOps', 'CI/CD', 'Automation', 'Infrastructure'],
  isEnterprise: true
}, {
  id: 'c4',
  name: 'Enterprise Security',
  description: 'Forum for enterprise security architecture, compliance, and implementation best practices.',
  category: 'Security',
  memberCount: 890,
  postCount: 180,
  createdAt: '2023-02-10',
  logo: 'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
  coverImage: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
  tags: ['Security', 'Compliance', 'Identity', 'Zero Trust'],
  isEnterprise: true
}, {
  id: 'c5',
  name: 'API Strategy',
  description: 'Community focused on API design, management, and governance for enterprise applications.',
  category: 'Development',
  memberCount: 760,
  postCount: 145,
  createdAt: '2023-02-25',
  logo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
  coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
  tags: ['API', 'REST', 'GraphQL', 'Integration'],
  isEnterprise: true
}, {
  id: 'c6',
  name: 'Data Architecture',
  description: 'Discussions on enterprise data architecture, data modeling, and data governance strategies.',
  category: 'Data',
  memberCount: 620,
  postCount: 95,
  createdAt: '2023-03-15',
  logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
  coverImage: 'https://images.unsplash.com/photo-1456428746267-a1756408f782?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
  tags: ['Data', 'Architecture', 'Governance', 'Modeling'],
  isEnterprise: true
}];
// Mock posts
export const posts: Post[] = [{
  id: 'p1',
  title: 'Best Practices for Multi-Cloud Architecture',
  content: "In this post, I'll share some best practices for designing multi-cloud architectures that balance cost, performance, and resilience...",
  authorId: 'u1',
  communityId: 'c1',
  createdAt: '2023-04-01T10:30:00Z',
  likes: 45,
  commentCount: 12,
  tags: ['Multi-Cloud', 'Architecture', 'Best Practices']
}, {
  id: 'p2',
  title: 'Implementing Event-Driven Microservices',
  content: "Event-driven architecture provides several benefits for microservices implementations. Here's how we implemented it at TechCorp...",
  authorId: 'u2',
  communityId: 'c2',
  createdAt: '2023-04-02T14:15:00Z',
  likes: 38,
  commentCount: 8,
  tags: ['Microservices', 'Event-Driven', 'Kafka']
}, {
  id: 'p3',
  title: 'DevOps Transformation in Large Enterprises',
  content: "Transforming DevOps practices in large enterprises comes with unique challenges. Here's our journey and lessons learned...",
  authorId: 'u3',
  communityId: 'c3',
  createdAt: '2023-04-03T09:45:00Z',
  likes: 52,
  commentCount: 15,
  tags: ['DevOps', 'Enterprise', 'Transformation']
}, {
  id: 'p4',
  title: 'Zero Trust Architecture for Enterprise Applications',
  content: 'Implementing zero trust architecture requires a shift in security thinking. This post covers key principles and implementation strategies...',
  authorId: 'u1',
  communityId: 'c4',
  createdAt: '2023-04-04T16:20:00Z',
  likes: 33,
  commentCount: 7,
  tags: ['Security', 'Zero Trust', 'Architecture']
}, {
  id: 'p5',
  title: 'API Versioning Strategies',
  content: 'Managing API versions is crucial for maintaining backward compatibility. Here are different strategies and their trade-offs...',
  authorId: 'u2',
  communityId: 'c5',
  createdAt: '2023-04-05T11:10:00Z',
  likes: 29,
  commentCount: 6,
  tags: ['API', 'Versioning', 'REST']
}, {
  id: 'p6',
  title: 'Data Mesh Architecture: A New Paradigm',
  content: 'Data mesh architecture is changing how enterprises manage and access data. This post explores the key concepts and benefits...',
  authorId: 'u3',
  communityId: 'c6',
  createdAt: '2023-04-06T13:40:00Z',
  likes: 41,
  commentCount: 9,
  tags: ['Data', 'Architecture', 'Data Mesh']
}, {
  id: 'p7',
  title: 'Kubernetes for Enterprise Workloads',
  content: "Running enterprise workloads on Kubernetes requires careful planning. Here's our approach to scaling and reliability...",
  authorId: 'u1',
  communityId: 'c3',
  createdAt: '2023-04-07T15:30:00Z',
  likes: 37,
  commentCount: 11,
  tags: ['Kubernetes', 'Enterprise', 'Scaling']
}, {
  id: 'p8',
  title: 'API Gateway Patterns in Microservices',
  content: 'API gateways play a crucial role in microservices architectures. This post discusses common patterns and implementation options...',
  authorId: 'u2',
  communityId: 'c2',
  createdAt: '2023-04-08T10:15:00Z',
  likes: 31,
  commentCount: 5,
  tags: ['API Gateway', 'Microservices', 'Patterns']
}];
// Mock comments
export const comments: Comment[] = [{
  id: 'cmt1',
  content: "Great insights on multi-cloud strategy. We've been implementing something similar with a focus on cost optimization.",
  authorId: 'u2',
  postId: 'p1',
  createdAt: '2023-04-01T14:20:00Z',
  likes: 8
}, {
  id: 'cmt2',
  content: 'Have you encountered any challenges with data consistency across clouds?',
  authorId: 'u3',
  postId: 'p1',
  createdAt: '2023-04-01T16:45:00Z',
  likes: 5
}, {
  id: 'cmt3',
  content: "We've been using Kafka for our event-driven architecture as well. It's been working great for us.",
  authorId: 'u1',
  postId: 'p2',
  createdAt: '2023-04-02T18:30:00Z',
  likes: 7
}, {
  id: 'cmt4',
  content: 'The cultural aspect of DevOps transformation is often overlooked. Great that you highlighted it.',
  authorId: 'u2',
  postId: 'p3',
  createdAt: '2023-04-03T12:15:00Z',
  likes: 10
}, {
  id: 'cmt5',
  content: "Zero trust is definitely the way forward for enterprise security. We're implementing it gradually.",
  authorId: 'u3',
  postId: 'p4',
  createdAt: '2023-04-04T19:10:00Z',
  likes: 6
}];
// Helper function to find user by ID
export function getUserById(id: string): User | undefined {
  return users.find(user => user.id === id);
}
// Helper function to find community by ID
export function getCommunityById(id: string): Community | undefined {
  return communities.find(community => community.id === id);
}
// Helper function to find post by ID
export function getPostById(id: string): Post | undefined {
  return posts.find(post => post.id === id);
}
// Helper function to get posts by community ID
export function getPostsByCommunityId(communityId: string): Post[] {
  return posts.filter(post => post.communityId === communityId);
}
// Helper function to get comments by post ID
export function getCommentsByPostId(postId: string): Comment[] {
  return comments.filter(comment => comment.postId === postId);
}