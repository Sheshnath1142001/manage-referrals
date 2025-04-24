import { useState } from "react";
import Image from "next/image";
import { Star, ThumbsUp, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Review } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  review: Review;
  isOwner?: boolean;
}

const ReviewCard = ({ review, isOwner = false }: ReviewCardProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [helpful, setHelpful] = useState(false);

  const formattedDate = formatDistanceToNow(new Date(review.date), { addSuffix: true });

  const handleSubmitReply = () => {
    // In a real app, this would send the reply to an API
    if (replyText.trim()) {
      alert("Reply submitted!");
      setReplyText("");
      setShowReplyForm(false);
    }
  };

  const handleHelpfulClick = () => {
    setHelpful(!helpful);
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white">
      <div className="flex items-start gap-3 mb-3">
        <div className="relative h-10 w-10 flex-shrink-0">
          {review.userImage ? (
            <Image
              src={review.userImage}
              alt={review.userName}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center">
              {review.userName.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <h4 className="font-semibold">{review.userName}</h4>
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-gray-700 mb-3">{review.comment}</p>

      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`text-xs flex items-center gap-1 ${helpful ? "text-[#C55D5D]" : "text-gray-500"}`}
          onClick={handleHelpfulClick}
        >
          <ThumbsUp className="h-3 w-3" />
          {helpful ? "Helpful" : "Mark as helpful"}
        </Button>

        {isOwner && !review.reply && !showReplyForm && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs border-[#C55D5D] text-[#C55D5D]"
            onClick={() => setShowReplyForm(true)}
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
        )}
      </div>

      {review.reply && (
        <div className="mt-4 pl-8 border-l-2 border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <h5 className="text-sm font-semibold">Owner Reply</h5>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(review.reply.date), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-gray-700">{review.reply.text}</p>
        </div>
      )}

      {showReplyForm && (
        <div className="mt-4">
          <Textarea
            placeholder="Write your reply..."
            className="min-h-[100px] mb-2"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowReplyForm(false)}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              className="bg-[#C55D5D] hover:bg-[#b34d4d]"
              onClick={handleSubmitReply}
            >
              Submit Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;