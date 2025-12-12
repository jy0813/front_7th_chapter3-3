/**
 * 댓글 수정 모달 내용
 * 캐시에서 기존 댓글 데이터를 가져와 CommentForm에 전달
 */
import { useQueryClient } from "@tanstack/react-query"
import { findCommentInCache } from "@/entities/comment/lib"
import { CommentForm } from "@/features/comment/ui/CommentForm"

interface CommentEditContentProps {
  postId: number
  commentId: number
}

/**
 * 댓글 수정 내용 컴포넌트
 */
export const CommentEditContent = ({ postId, commentId }: CommentEditContentProps) => {
  const queryClient = useQueryClient()
  const comment = findCommentInCache(queryClient, postId, commentId)

  if (!comment) {
    return <div className="text-red-500">댓글을 찾을 수 없습니다.</div>
  }

  // DummyJSON API는 userId가 없고 user.id로 제공됨
  // 낙관적 생성 댓글은 userId가 있음
  const userId = comment.userId ?? comment.user?.id

  return (
    <CommentForm
      key={commentId}
      mode="edit"
      postId={postId}
      commentId={commentId}
      initialBody={comment.body}
      initialUserId={userId}
    />
  )
}
