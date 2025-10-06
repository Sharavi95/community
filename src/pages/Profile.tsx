import React from 'react';
import { Link } from 'react-router-dom';
import { users, communities, posts, getUserById, getCommunityById } from '../data/mockData';
import { PostCard } from '../components/posts/PostCard';
import { CommunityCard } from '../components/communities/CommunityCard';
import { CalendarIcon, MailIcon, BriefcaseIcon } from 'lucide-react';
export function Profile() {
  // Using the first user as an example
  const user = users[0];
  // Get communities the user is a member of
  const userCommunities = communities.filter(community => user.communities.includes(community.id));
  // Get posts authored by the user
  const userPosts = posts.filter(post => post.authorId === user.id);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };
  return <div className="max-w-7xl mx-auto">
      {/* Profile header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full mb-4 md:mb-0 md:mr-6" />
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {user.name}
            </h1>
            <p className="text-gray-600 mb-3">
              {user.title} at {user.company}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>Joined {formatDate(user.joinDate)}</span>
              </div>
              <div className="flex items-center">
                <MailIcon className="w-4 h-4 mr-1" />
                <span>Message</span>
              </div>
              <div className="flex items-center">
                <BriefcaseIcon className="w-4 h-4 mr-1" />
                <span>{user.company}</span>
              </div>
            </div>
            <p className="text-gray-700">{user.bio}</p>
          </div>
        </div>
      </div>
      {/* Communities and posts tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              My Communities
            </h2>
            {userCommunities.length > 0 ? <div className="space-y-4">
                {userCommunities.map(community => <Link key={community.id} to={`/communities/${community.id}`} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <img src={community.logo} alt={community.name} className="w-10 h-10 rounded-full mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {community.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {community.memberCount.toLocaleString()} members
                      </p>
                    </div>
                  </Link>)}
              </div> : <p className="text-gray-600">
                You haven't joined any communities yet.
              </p>}
            <div className="mt-4">
              <Link to="/communities" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Browse Communities
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Activity</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Posts</span>
                <span className="font-medium text-gray-900">
                  {userPosts.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Comments</span>
                <span className="font-medium text-gray-900">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Communities</span>
                <span className="font-medium text-gray-900">
                  {userCommunities.length}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">My Posts</h2>
            {userPosts.length > 0 ? <div className="space-y-6">
                {userPosts.map(post => {
              const community = getCommunityById(post.communityId)!;
              return <PostCard key={post.id} post={post} author={user} community={community} showCommunity={true} />;
            })}
              </div> : <div className="text-center py-8 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 mb-4">
                  You haven't created any posts yet.
                </p>
                <button className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium">
                  Create Your First Post
                </button>
              </div>}
          </div>
        </div>
      </div>
    </div>;
}