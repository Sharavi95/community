import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostById, getUserById, getCommunityById, getCommentsByPostId, Comment } from '../data/mockData';
import { ThumbsUpIcon, MessageSquareIcon, ShareIcon, BookmarkIcon, ClockIcon } from 'lucide-react';
export function PostView() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const post = getPostById(id || '');
  if (!post) {
    return <div className="max-w-7xl mx-auto text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Post Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/communities" className="text-blue-600 hover:text-blue-800">
          View Communities
        </Link>
      </div>;
  }
  const author = getUserById(post.authorId)!;
  const community = getCommunityById(post.communityId)!;
  const comments = getCommentsByPostId(post.id);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return <div className="max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <div className="mb-6 text-sm">
        <Link to="/" className="text-gray-500 hover:text-blue-600">
          Home
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link to="/communities" className="text-gray-500 hover:text-blue-600">
          Communities
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link to={`/communities/${community.id}`} className="text-gray-500 hover:text-blue-600">
          {community.name}
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-700">Post</span>
      </div>
      {/* Post content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start mb-4">
          <img src={author.avatar} alt={author.name} className="w-12 h-12 rounded-full mr-4" />
          <div>
            <div className="flex items-center">
              <span className="font-medium text-gray-900 mr-2">
                {author.name}
              </span>
              <span className="text-gray-500 text-sm">
                {author.title} at {author.company}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>{formatDate(post.createdAt)}</span>
              <span className="mx-2">•</span>
              <Link to={`/communities/${community.id}`} className="flex items-center hover:text-blue-600">
                <img src={community.logo} alt={community.name} className="w-4 h-4 rounded-full mr-1" />
                <span>{community.name}</span>
              </Link>
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="prose prose-blue max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag, index) => <span key={index} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
              {tag}
            </span>)}
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex space-x-4">
            <button className="flex items-center text-gray-600 hover:text-blue-600">
              <ThumbsUpIcon className="w-5 h-5 mr-1" />
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center text-gray-600 hover:text-blue-600">
              <MessageSquareIcon className="w-5 h-5 mr-1" />
              <span>{post.commentCount}</span>
            </button>
          </div>
          <div className="flex space-x-4">
            <button className="flex items-center text-gray-600 hover:text-blue-600">
              <BookmarkIcon className="w-5 h-5 mr-1" />
              <span>Save</span>
            </button>
            <button className="flex items-center text-gray-600 hover:text-blue-600">
              <ShareIcon className="w-5 h-5 mr-1" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
      {/* Comments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Comments ({comments.length})
        </h2>
        {/* Add comment form */}
        <div className="mb-8">
          <div className="flex items-start mb-4">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Your avatar" className="w-10 h-10 rounded-full mr-3" />
            <div className="flex-grow">
              <textarea placeholder="Add a comment..." className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={3}></textarea>
              <div className="flex justify-end mt-2">
                <button className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-medium">
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Comment list */}
        <div className="space-y-6">
          {comments.map(comment => {
          const commentAuthor = getUserById(comment.authorId)!;
          return <CommentItem key={comment.id} comment={comment} author={commentAuthor} />;
        })}
        </div>
      </div>
    </div>;
}
interface CommentItemProps {
  comment: Comment;
  author: any;
}
function CommentItem({
  comment,
  author
}: CommentItemProps) {
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
  return <div className="flex">
      <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full mr-3" />
      <div className="flex-grow">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <span className="font-medium text-gray-900 mr-2">
              {author.name}
            </span>
            <span className="text-gray-500 text-xs">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-gray-700 text-sm">{comment.content}</p>
        </div>
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <button className="flex items-center hover:text-blue-600 mr-4">
            <ThumbsUpIcon className="w-4 h-4 mr-1" />
            <span>{comment.likes}</span>
          </button>
          <button className="hover:text-blue-600 mr-4">Reply</button>
        </div>
      </div>
    </div>;
}