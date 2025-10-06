import React from 'react';
import { Link } from 'react-router-dom';
import { Post, User, Community } from '../../data/mockData';
import { MessageSquareIcon, ThumbsUpIcon, ClockIcon } from 'lucide-react';
interface PostCardProps {
  post: Post;
  author: User;
  community?: Community;
  showCommunity?: boolean;
}
export function PostCard({
  post,
  author,
  community,
  showCommunity = false
}: PostCardProps) {
  // Format date to relative time (e.g., "2 days ago")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    return date.toLocaleDateString();
  };
  return <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start mb-3">
        <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full mr-3" />
        <div>
          <div className="flex items-center">
            <span className="font-medium text-gray-900 mr-2">
              {author.name}
            </span>
            <span className="text-gray-500 text-sm">{author.title}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <ClockIcon className="w-3 h-3 mr-1" />
            <span>{formatDate(post.createdAt)}</span>
            {showCommunity && community && <>
                <span className="mx-1">•</span>
                <Link to={`/communities/${community.id}`} className="flex items-center hover:text-blue-600">
                  <img src={community.logo} alt={community.name} className="w-3 h-3 rounded-full mr-1" />
                  <span>{community.name}</span>
                </Link>
              </>}
          </div>
        </div>
      </div>
      <Link to={`/posts/${post.id}`} className="block mb-3">
        <h3 className="font-bold text-lg text-gray-900 hover:text-blue-600 mb-2">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3">{post.content}</p>
      </Link>
      <div className="flex flex-wrap gap-2 mb-3">
        {post.tags.map((tag, index) => <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
            {tag}
          </span>)}
      </div>
      <div className="flex justify-between text-sm text-gray-500">
        <div className="flex items-center">
          <ThumbsUpIcon className="w-4 h-4 mr-1" />
          <span>{post.likes} likes</span>
        </div>
        <div className="flex items-center">
          <MessageSquareIcon className="w-4 h-4 mr-1" />
          <span>{post.commentCount} comments</span>
        </div>
      </div>
    </div>;
}