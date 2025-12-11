import { Edit2 } from "lucide-react";
import { Button } from "@/shared/ui";
import { useModalContext } from "@/shared/lib/modal-context";

interface EditPostButtonProps {
  postId: number;
}

/**
 * 게시물 수정 버튼
 * 클릭 시 게시물 수정 모달 열기
 */
export const EditPostButton = ({ postId }: EditPostButtonProps) => {
  const { openModal } = useModalContext();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => openModal("postEdit", { postId })}
    >
      <Edit2 className="w-4 h-4" />
    </Button>
  );
};
