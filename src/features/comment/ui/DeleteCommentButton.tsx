import { Trash2 } from "lucide-react"
import { Button } from "@/shared/ui"
import { useDeleteComment } from "@/features/comment/model/useCommentMutation"

interface DeleteCommentButtonProps {
  commentId: number
  postId: number
}

/**
 * 댓글 삭제 버튼
 * 클릭 시 확인 후 삭제 실행
 */
export const DeleteCommentButton = ({ commentId, postId }: DeleteCommentButtonProps) => {
  const deleteComment = useDeleteComment()

  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      deleteComment.mutate({ id: commentId, postId })
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleteComment.isPending}>
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
