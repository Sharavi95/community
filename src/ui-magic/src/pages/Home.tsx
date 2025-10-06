import React from 'react';
import { Link } from 'react-router-dom';
import { communities, posts, users, getCommunityById, getUserById } from '../data/mockData';
import { CommunityCard } from '../components/communities/CommunityCard';
import { PostCard } from '../components/posts/PostCard';
export function Home() {
  const featuredCommunities = communities.slice(0, 3);
  const recentPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  return <div className="max-w-7xl mx-auto">
      {/* Hero section */}
      <section className="mb-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">
            Connect with Enterprise Development Communities
          </h1>
          <p className="text-xl mb-6 text-blue-100">
            Join discussions, share knowledge, and collaborate with peers on
            enterprise architecture, development, and technology topics.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/communities" className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium">
              Explore Communities
            </Link>
            <button className="bg-blue-500 bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg font-medium">
              Learn More
            </button>
          </div>
        </div>
      </section>
      {/* Featured communities */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Featured Communities
          </h2>
          <Link to="/communities" className="text-blue-600 hover:text-blue-800">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCommunities.map(community => <CommunityCard key={community.id} community={community} />)}
        </div>
      </section>
      {/* Recent posts */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Recent Discussions
          </h2>
          <Link to="/communities" className="text-blue-600 hover:text-blue-800">
            View More
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recentPosts.map(post => {
          const author = getUserById(post.authorId)!;
          const community = getCommunityById(post.communityId)!;
          return <PostCard key={post.id} post={post} author={author} community={community} showCommunity={true} />;
        })}
        </div>
      </section>
      {/* Join now CTA */}
      <section className="mb-12 bg-gray-50 rounded-2xl p-8 border border-gray-200">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to join the conversation?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Connect with peers, share your expertise, and stay up-to-date with
            the latest in enterprise development.
          </p>
          <button className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg font-medium">
            Create Account
          </button>
        </div>
      </section>
    </div>;
}