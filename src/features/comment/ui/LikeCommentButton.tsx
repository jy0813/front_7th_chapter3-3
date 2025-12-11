import { ThumbsUp } from "lucide-react";
import { Button } from "@/shared/ui";
import { useLikeComment } from "@/features/comment/model/useCommentMutation";

interface LikeCommentButtonProps {
  commentId: number;
  postId: number;
  currentLikes: number;
}

/**
 * 댓글 좋아요 버튼
 * 클릭 시 좋아요 수 증가 (낙관적 업데이트)
 */
export const LikeCommentButton = ({
  commentId,
  postId,
  currentLikes,
}: LikeCommentButtonProps) => {
  const likeComment = useLikeComment(postId);

  const handleLike = () => {
    likeComment.mutate({ id: commentId, likes: currentLikes + 1 });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={likeComment.isPending}
      className="flex items-center gap-1"
    >
      <ThumbsUp className="w-4 h-4" />
      <span>{currentLikes}</span>
    </Button>
  );
};
