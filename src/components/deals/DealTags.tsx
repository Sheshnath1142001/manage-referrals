import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MultiSelect } from "@/components/ui/multi-select";

interface Tag {
  id: string;
  tag: string;
  restaurant_id: number;
  created_at: string;
  updated_at: string;
}

interface DealTagsProps {
  dealId: number;
  initialTags?: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  disabled?: boolean;
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export const DealTags = ({
  dealId,
  initialTags = [],
  onTagsChange,
  disabled = false,
}: DealTagsProps) => {
  const { toast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags.map(tag => tag.id));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/tags`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': localStorage.getItem('Admin') ? `Bearer ${JSON.parse(localStorage.getItem('Admin')).token}` : '',
        },
      });
      const data = await response.json();
      setTags(data.tags || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tags.",
        variant: "destructive",
      });
    }
  };

  const handleTagsChange = (selectedTagIds: string[]) => {
    setSelectedTags(selectedTagIds);
    const selectedTagsData = tags.filter(tag => selectedTagIds.includes(tag.id));
    onTagsChange(selectedTagsData);
  };

  const tagOptions = tags.map(tag => ({
    value: tag.id,
    label: tag.tag
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiSelect
            options={tagOptions}
            value={selectedTags}
            onChange={handleTagsChange}
            placeholder="Select tags"
            disabled={disabled || isLoading}
            searchable={true}
            loading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}; 