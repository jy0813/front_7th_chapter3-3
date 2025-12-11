import { Plus } from "lucide-react";
import { Button } from "@/shared/ui";
import { highlightText } from "@/shared/lib/highlightText";
import { useModalContext } from "@/shared/lib/modal-context";
import { useCommentList } from "@/entities/comment/model/useCommentQuery";
import { EditCommentButton } from "@/features/comment/ui/EditCommentButton";
import { DeleteCommentButton } from "@/features/comment/ui/DeleteCommentButton";
import { LikeCommentButton } from "@/features/comment/ui/LikeCommentButton";

interface CommentListWidgetProps {
  postId: number;
  searchQuery?: string;
}

/**
 * 댓글 목록 위젯
 * 특정 게시물의 댓글 목록 표시 및 CRUD 기능
 */
export const CommentListWidget = ({
  postId,
  searchQuery = "",
}: CommentListWidgetProps) => {
  const { openModal } = useModalContext();
  const { data: commentsData, isLoading } = useCommentList(postId);
  const comments = commentsData?.comments ?? [];

  if (isLoading) {
    return <div className="text-sm text-gray-500">댓글 로딩 중...</div>;
  }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">댓글</h3>
        <Button
          size="sm"
          onClick={() => openModal("commentAdd", { postId })}
        >
          <Plus className="w-3 h-3 mr-1" />
          댓글 추가
        </Button>
      </div>
      <div className="space-y-1">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="text-sm border-b pb-1"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="font-medium">
                  {comment.user.username}:
                </span>
                <span className="ml-1 break-words whitespace-pre-wrap">
                  {highlightText(comment.body, searchQuery)}
                </span>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <LikeCommentButton
                  commentId={comment.id}
                  postId={postId}
                  currentLikes={comment.likes}
                />
                <EditCommentButton
                  commentId={comment.id}
                  postId={postId}
                />
                <DeleteCommentButton
                  commentId={comment.id}
                  postId={postId}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
