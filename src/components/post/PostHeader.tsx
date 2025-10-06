import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_username: string;
  author_avatar: string | null;
  community_id: string;
  community_name: string;
}

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
          {post.title}
        </h1>
        
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-6">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author_avatar || undefined} />
              <AvatarFallback className="text-xs">
                {post.author_username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-700 font-medium">{post.author_username}</span>
          </div>
          
          <span>•</span>
          
          <Link 
            to={`/community/${post.community_id}`}
            className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            {post.community_name}
          </Link>
          
          <span>•</span>
          
          <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
        </div>
        
        <div className="prose prose-sm max-w-none">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      </div>
    </div>
  );
}
