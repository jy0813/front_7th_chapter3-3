import { Trash2 } from "lucide-react";
import { Button } from "@/shared/ui";
import { useDeletePost } from "@/features/post/model/usePostMutation";

interface DeletePostButtonProps {
  postId: number;
}

/**
 * 게시물 삭제 버튼
 * 클릭 시 확인 후 삭제 실행
 */
export const DeletePostButton = ({ postId }: DeletePostButtonProps) => {
  const deletePost = useDeletePost();

  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      deletePost.mutate(postId);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={deletePost.isPending}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
};
