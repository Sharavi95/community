import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <div className={`flex items-start gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.sender?.avatar_url || undefined} />
        <AvatarFallback className="bg-muted text-muted-foreground">
          {message.sender?.username?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div
          className={`rounded-xl px-4 py-2 shadow-sm ${
            isOwnMessage
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <div className="flex items-center gap-2 mt-1 px-1">
          {!isOwnMessage && message.sender && (
            <span className="text-xs font-medium text-muted-foreground">
              {message.sender.username}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}
