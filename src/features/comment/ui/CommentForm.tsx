/**
 * 댓글 추가/수정 폼
 *
 * 리팩토링 완료:
 * - 렌더링 중 setState 안티패턴 제거
 * - 모든 계산 로직 → entities/comment/lib 순수함수로 분리
 */
import { useState, useMemo } from "react"
import { Button, Textarea, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/shared/ui"
import { useCreateComment, useUpdateComment } from "@/features/comment/model/useCommentMutation"
import { useUserList } from "@/entities/user/model/useUserQuery"
import { useModalContext } from "@/shared/lib/modal-context"
import { getDefaultUserId, getEffectiveUserId, findUserById } from "@/entities/comment/lib"

interface CommentFormProps {
  mode: "create" | "edit"
  postId: number
  commentId?: number
  initialBody?: string
  initialUserId?: number
}

/**
 * 댓글 추가/수정 폼
 * mode에 따라 생성 또는 수정 동작
 *
 * Note: initialBody가 변경될 때 리셋하려면 부모에서 key prop 사용
 * <CommentForm key={commentId} ... />
 */
export const CommentForm = ({ mode, postId, commentId, initialBody = "", initialUserId }: CommentFormProps) => {
  const { closeModal } = useModalContext()
  const createComment = useCreateComment()
  const updateComment = useUpdateComment()

  // 사용자 목록 로드
  const { data: userListData, isLoading: isLoadingUsers } = useUserList()

  // users 배열을 useMemo로 안정화 (ESLint react-hooks/exhaustive-deps 경고 해결)
  const users = useMemo(() => userListData?.users ?? [], [userListData?.users])

  // 기본 userId 계산 (순수함수 사용)
  const defaultUserId = useMemo(() => {
    return getDefaultUserId(initialUserId, users)
  }, [initialUserId, users])

  // 폼 상태 (초기값은 props에서 직접 설정)
  const [body, setBody] = useState(initialBody)
  const [userId, setUserId] = useState<number | undefined>(initialUserId)

  // 유효한 userId 결정 (순수함수 사용)
  const effectiveUserId = getEffectiveUserId(userId, defaultUserId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === "create") {
      createComment.mutate({
        body,
        postId,
        userId: effectiveUserId,
      })
      // 낙관적 업데이트 완료 후 바로 모달 닫기
      closeModal()
    } else if (mode === "edit" && commentId) {
      updateComment.mutate({
        id: commentId,
        data: { body },
        postId,
      })
      // 낙관적 업데이트 완료 후 바로 모달 닫기
      closeModal()
    }
  }

  const isPending = createComment.isPending || updateComment.isPending

  // 선택된 사용자 찾기 (순수함수 사용)
  const selectedUser = findUserById(users, effectiveUserId)

  if (isLoadingUsers) {
    return <div className="p-4 text-center">로딩 중...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">댓글 내용</label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="댓글을 입력하세요" required />
      </div>

      {/* 작성자 선택 (생성 모드에서만 변경 가능) */}
      <div>
        <label className="block text-sm font-medium mb-1">작성자</label>
        <Select value={String(effectiveUserId)} onValueChange={(value) => setUserId(Number(value))} disabled={mode === "edit"}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="작성자를 선택하세요">
              {selectedUser && (
                <div className="flex items-center gap-2">
                  <img src={selectedUser.image} alt={selectedUser.username} className="w-5 h-5 rounded-full" />
                  <span>{selectedUser.username}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={String(user.id)}>
                <div className="flex items-center gap-2">
                  <img src={user.image} alt={user.username} className="w-5 h-5 rounded-full" />
                  <span>{user.username}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
