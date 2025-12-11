import { Plus } from "lucide-react";
import { Button } from "@/shared/ui";
import { useModalContext } from "@/shared/lib/modal-context";

interface AddCommentButtonProps {
  postId: number;
}

/**
 * 댓글 추가 버튼
 * 클릭 시 댓글 추가 모달 열기
 */
export const AddCommentButton = ({ postId }: AddCommentButtonProps) => {
  const { openModal } = useModalContext();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => openModal("commentAdd", { postId })}
    >
      <Plus className="w-4 h-4 mr-1" />
      댓글 추가
    </Button>
  );
};
