import { useState, useEffect } from "react"
import { Button, Textarea } from "@/shared/ui"
import { useCreateComment, useUpdateComment } from "@/features/comment/model/useCommentMutation"
import { useModalContext } from "@/shared/lib/modal-context"

interface CommentFormProps {
  mode: "create" | "edit"
  postId: number
  commentId?: number
  initialBody?: string
}

/**
 * 댓글 추가/수정 폼
 * mode에 따라 생성 또는 수정 동작
 */
export const CommentForm = ({ mode, postId, commentId, initialBody = "" }: CommentFormProps) => {
  const { closeModal } = useModalContext()
  const createComment = useCreateComment()
  const updateComment = useUpdateComment()

  const [body, setBody] = useState(initialBody)

  useEffect(() => {
    if (mode === "edit" && initialBody) {
      setBody(initialBody)
    }
  }, [mode, initialBody])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === "create") {
      createComment.mutate(
        {
          body,
          postId,
          userId: 1, // 임시 사용자 ID
        },
        {
          onSuccess: () => {
            closeModal()
          },
        },
      )
    } else if (mode === "edit" && commentId) {
      updateComment.mutate(
        {
          id: commentId,
          data: { body },
          postId,
        },
        {
          onSuccess: () => {
            closeModal()
          },
        },
      )
    }
  }

  const isPending = createComment.isPending || updateComment.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">댓글 내용</label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="댓글을 입력하세요" required />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={closeModal}>
          취소
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "저장 중..." : mode === "create" ? "추가" : "수정"}
        </Button>
      </div>
    </form>
  )
}
