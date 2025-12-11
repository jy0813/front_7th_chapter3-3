import { MessageSquare } from "lucide-react";
import { Button } from "@/shared/ui";
import { useModalContext } from "@/shared/lib/modal-context";

interface PostDetailButtonProps {
  postId: number;
  searchQuery?: string;
}

/**
 * 게시물 상세보기 버튼
 * 클릭 시 게시물 상세 모달 열기
 */
export const PostDetailButton = ({ postId, searchQuery }: PostDetailButtonProps) => {
  const { openModal } = useModalContext();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => openModal("postDetail", { postId, searchQuery })}
    >
      <MessageSquare className="w-4 h-4" />
    </Button>
  );
};
