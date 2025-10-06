import React, { useState } from 'react';
import { communities } from '../data/mockData';
import { CommunityCard } from '../components/communities/CommunityCard';
import { SearchIcon, FilterIcon } from 'lucide-react';
export function Communities() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Extract unique categories from communities
  const categories = Array.from(new Set(communities.map(c => c.category)));
  // Filter communities based on search query and selected category
  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) || community.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  return <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Communities</h1>
        <p className="text-gray-600">
          Join communities to connect with other professionals and discuss
          enterprise development topics.
        </p>
      </div>
      {/* Search and filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search communities..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <FilterIcon className="text-gray-500 w-5 h-5" />
            <select value={selectedCategory || ''} onChange={e => setSelectedCategory(e.target.value || null)} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Categories</option>
              {categories.map(category => <option key={category} value={category}>
                  {category}
                </option>)}
            </select>
          </div>
        </div>
      </div>
      {/* Communities grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredCommunities.map(community => <CommunityCard key={community.id} community={community} />)}
      </div>
      {filteredCommunities.length === 0 && <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No communities found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria to find what you're
            looking for.
          </p>
        </div>}
    </div>;
}