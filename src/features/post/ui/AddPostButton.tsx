import { Plus } from "lucide-react";
import { Button } from "@/shared/ui";
import { useModalContext } from "@/shared/lib/modal-context";

/**
 * 게시물 추가 버튼
 * 클릭 시 게시물 추가 모달 열기
 */
export const AddPostButton = () => {
  const { openModal } = useModalContext();

  return (
    <Button onClick={() => openModal("postAdd")}>
      <Plus className="w-4 h-4 mr-2" />
      게시물 추가
    </Button>
  );
};
