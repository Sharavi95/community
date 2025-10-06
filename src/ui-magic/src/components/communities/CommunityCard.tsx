import React from 'react';
import { Link } from 'react-router-dom';
import { Community } from '../../data/mockData';
import { UsersIcon, MessageSquareIcon, TagIcon } from 'lucide-react';
interface CommunityCardProps {
  community: Community;
}
export function CommunityCard({
  community
}: CommunityCardProps) {
  return <Link to={`/communities/${community.id}`} className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200">
      <div className="h-32 overflow-hidden">
        <img src={community.coverImage} alt={community.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-center mb-3">
          <img src={community.logo} alt={community.name} className="w-10 h-10 rounded-full mr-3" />
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              {community.name}
            </h3>
            <span className="text-sm text-gray-500">{community.category}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {community.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {community.tags.slice(0, 3).map((tag, index) => <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
              {tag}
            </span>)}
          {community.tags.length > 3 && <span className="text-gray-500 text-xs px-2 py-1">
              +{community.tags.length - 3} more
            </span>}
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <UsersIcon className="w-4 h-4 mr-1" />
            <span>{community.memberCount.toLocaleString()} members</span>
          </div>
          <div className="flex items-center">
            <MessageSquareIcon className="w-4 h-4 mr-1" />
            <span>{community.postCount.toLocaleString()} posts</span>
          </div>
        </div>
      </div>
    </Link>;
}