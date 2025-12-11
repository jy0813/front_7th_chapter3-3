import { Edit2 } from "lucide-react";
import { Button } from "@/shared/ui";
import { useModalContext } from "@/shared/lib/modal-context";

interface EditCommentButtonProps {
  commentId: number;
  postId: number;
}

/**
 * 댓글 수정 버튼
 * 클릭 시 댓글 수정 모달 열기
 */
export const EditCommentButton = ({
  commentId,
  postId,
}: EditCommentButtonProps) => {
  const { openModal } = useModalContext();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => openModal("commentEdit", { commentId, postId })}
    >
      <Edit2 className="w-4 h-4" />
    </Button>
  );
};
