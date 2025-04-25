import React from 'react';
import { useTags } from '@/hooks/useTags';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface TagCloudProps {
  onTagClick?: (tag: string) => void;
  limit?: number;
  className?: string;
}

export const TagCloud: React.FC<TagCloudProps> = ({
  onTagClick,
  limit = 10,
  className = ''
}) => {
  const { tags, error, loading } = useTags();

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: limit }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.slice(0, limit).map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={() => onTagClick?.(tag.name)}
        >
          {tag.name}
          {tag.truckCount && (
            <span className="ml-1 text-xs opacity-70">
              ({tag.truckCount})
            </span>
          )}
        </Badge>
      ))}
    </div>
  );
};