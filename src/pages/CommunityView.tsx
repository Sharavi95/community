import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCommunityById, getPostsByCommunityId, getUserById, Community, Post } from '../data/mockData';
import { PostCard } from '../components/posts/PostCard';
import { UsersIcon, MessageSquareIcon, CalendarIcon, PlusIcon } from 'lucide-react';
export function CommunityView() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [activeTab, setActiveTab] = useState<'discussions' | 'about' | 'members'>('discussions');
  const community = getCommunityById(id || '');
  const posts = getPostsByCommunityId(id || '');
  if (!community) {
    return <div className="max-w-7xl mx-auto text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Community Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The community you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/communities" className="text-blue-600 hover:text-blue-800">
          View All Communities
        </Link>
      </div>;
  }
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return <div className="max-w-7xl mx-auto">
      {/* Community header */}
      <div className="relative mb-8">
        <div className="h-64 overflow-hidden rounded-xl">
          <img src={community.coverImage} alt={community.name} className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
          <div className="flex items-center">
            <img src={community.logo} alt={community.name} className="w-16 h-16 rounded-full border-4 border-white mr-4" />
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-1">{community.name}</h1>
              <div className="flex flex-wrap gap-2 mb-2">
                {community.tags.map((tag, index) => <span key={index} className="bg-blue-600 bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
                    {tag}
                  </span>)}
              </div>
              <div className="flex items-center text-sm text-gray-200">
                <UsersIcon className="w-4 h-4 mr-1" />
                <span>{community.memberCount.toLocaleString()} members</span>
                <span className="mx-2">•</span>
                <MessageSquareIcon className="w-4 h-4 mr-1" />
                <span>{community.postCount.toLocaleString()} posts</span>
                <span className="mx-2">•</span>
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>Created {formatDate(community.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center">
            <UsersIcon className="w-4 h-4 mr-2" />
            Join Community
          </button>
          <button className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg font-medium">
            Share
          </button>
        </div>
        <Link to="#" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center">
          <PlusIcon className="w-4 h-4 mr-2" />
          New Post
        </Link>
      </div>
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button onClick={() => setActiveTab('discussions')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'discussions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Discussions
          </button>
          <button onClick={() => setActiveTab('about')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'about' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            About
          </button>
          <button onClick={() => setActiveTab('members')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'members' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Members
          </button>
        </nav>
      </div>
      {/* Tab content */}
      <div className="mb-8">
        {activeTab === 'discussions' && <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Recent Discussions
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {posts.length > 0 ? posts.map(post => <PostCard key={post.id} post={post} author={getUserById(post.authorId)!} />) : <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No discussions yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Be the first to start a discussion in this community!
                    </p>
                    <button className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium">
                      Create Post
                    </button>
                  </div>}
              </div>
            </div>
          </div>}
        {activeTab === 'about' && <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              About this Community
            </h2>
            <p className="text-gray-600 mb-6">{community.description}</p>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Community Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-gray-500 mr-2" />
                  <div>
                    <span className="text-sm text-gray-500">Created</span>
                    <p className="font-medium">
                      {formatDate(community.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <UsersIcon className="w-5 h-5 text-gray-500 mr-2" />
                  <div>
                    <span className="text-sm text-gray-500">Members</span>
                    <p className="font-medium">
                      {community.memberCount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MessageSquareIcon className="w-5 h-5 text-gray-500 mr-2" />
                  <div>
                    <span className="text-sm text-gray-500">Posts</span>
                    <p className="font-medium">
                      {community.postCount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 text-gray-500 mr-2 flex items-center justify-center">
                    #
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Category</span>
                    <p className="font-medium">{community.category}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Community Rules
              </h3>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>Be respectful and professional in all interactions.</li>
                <li>
                  Stay on topic and contribute constructively to discussions.
                </li>
                <li>
                  No self-promotion or advertising without prior approval.
                </li>
                <li>Respect intellectual property and confidentiality.</li>
                <li>
                  Follow the code of conduct for all community activities.
                </li>
              </ol>
            </div>
          </div>}
        {activeTab === 'members' && <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Community Members
            </h2>
            <p className="text-gray-600 mb-6">
              This community has {community.memberCount.toLocaleString()}{' '}
              members.
            </p>
            {/* This would typically show a list of members, but we'll use a placeholder for now */}
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Member list is not available
              </h3>
              <p className="text-gray-600">
                Member information is only visible to community members.
              </p>
            </div>
          </div>}
      </div>
    </div>;
}