/**
 * 게시물 추가/수정 폼
 *
 * 리팩토링 완료:
 * - 모든 계산 로직 → entities/post/lib 순수함수로 분리
 */
import { useState } from "react"
import { X } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Input, Textarea, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/shared/ui"
import { useCreatePost, useUpdatePost } from "@/features/post/model/usePostMutation"
import { usePostDetail } from "@/entities/post/model/usePostQuery"
import { useUserList } from "@/entities/user/model/useUserQuery"
import { useTagList } from "@/entities/tag/model/useTagQuery"
import { useModalContext } from "@/shared/lib/modal-context"
import {
  findPostInCache,
  isRealPostData,
  getInitialPostData,
  getAvailableTags,
  addTag,
  removeTag,
  findUserById,
} from "@/entities/post/lib"
import type { NewPost, UpdatePost } from "@/entities/post/model/types"
import type { User } from "@/entities/user/model/types"
import type { Tag } from "@/entities/tag/model/types"

interface PostFormProps {
  mode: "create" | "edit"
  postId?: number
}

/**
 * 게시물 추가/수정 폼 (내부 컴포넌트)
 * 데이터 로딩 완료 후 렌더링됨
 */
const PostFormInner = ({
  mode,
  postId,
  initialData,
  closeModal,
  users,
  tags,
}: {
  mode: "create" | "edit"
  postId?: number
  initialData: NewPost
  closeModal: () => void
  users: User[]
  tags: Tag[]
}) => {
  const createPost = useCreatePost()
  const updatePost = useUpdatePost()

  // 초기값을 직접 사용 (useEffect 불필요)
  const [formData, setFormData] = useState<NewPost>(initialData)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === "create") {
      createPost.mutate(formData)
      // 낙관적 업데이트 완료 후 바로 모달 닫기
      closeModal()
    } else if (mode === "edit" && postId) {
      const updateData: UpdatePost = {
        title: formData.title,
        body: formData.body,
        tags: formData.tags,
      }
      updatePost.mutate({ id: postId, data: updateData })
      // 낙관적 업데이트 완료 후 바로 모달 닫기
      closeModal()
    }
  }

  // 태그 추가 핸들러 (순수함수 사용)
  const handleAddTag = (tagSlug: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: addTag(prev.tags, tagSlug),
    }))
  }

  // 태그 제거 핸들러 (순수함수 사용)
  const handleRemoveTag = (tagSlug: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: removeTag(prev.tags, tagSlug),
    }))
  }

  // 선택 가능한 태그 (순수함수 사용)
  const availableTags = getAvailableTags(tags, formData.tags)

  const isPending = createPost.isPending || updatePost.isPending

  // 선택된 사용자 찾기 (순수함수 사용)
  const selectedUser = findUserById(users, formData.userId)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">제목</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="제목을 입력하세요"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">내용</label>
        <Textarea
          value={formData.body}
          onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))}
          placeholder="내용을 입력하세요"
          required
        />
      </div>

      {/* 작성자 선택 (생성 모드에서만 변경 가능) */}
      <div>
        <label className="block text-sm font-medium mb-1">작성자</label>
        <Select
          value={String(formData.userId)}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, userId: Number(value) }))}
          disabled={mode === "edit"}
        >
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

      {/* 태그 선택 */}
      <div>
        <label className="block text-sm font-medium mb-1">태그</label>
        {/* 선택된 태그 chip 표시 */}
        {formData.tags && formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
              >
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:bg-blue-200 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {/* 태그 추가 셀렉트 */}
        <Select value="" onValueChange={handleAddTag}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="태그를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {availableTags.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-gray-500">선택 가능한 태그가 없습니다</div>
            ) : (
              availableTags.map((tag) => (
                <SelectItem key={tag.slug} value={tag.slug}>
                  {tag.slug}
                </SelectItem>
              ))
            )}
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

/**
 * 게시물 추가/수정 폼 (외부 컴포넌트)
 * - ID 1~251 (실제 데이터): 캐시 → API fallback
 * - ID 252+ (낙관적 생성): 캐시에서만 조회
 */
export const PostForm = ({ mode, postId }: PostFormProps) => {
  const { closeModal } = useModalContext()
  const queryClient = useQueryClient()

  // 사용자 목록 로드
  const { data: userListData, isLoading: isLoadingUsers } = useUserList()
  const users = userListData?.users ?? []

  // 태그 목록 로드
  const { data: tagsData } = useTagList()
  const tags = tagsData ?? []

  // 수정 모드일 때 캐시에서 먼저 게시글 찾기 (순수함수 사용)
  const cachedPost = mode === "edit" && postId ? findPostInCache(queryClient, postId) : undefined

  // 실제 DummyJSON 데이터 여부 확인 (순수함수 사용)
  const isRealData = isRealPostData(postId)
  const { data: apiPost, isLoading: isLoadingPost } = usePostDetail(
    mode === "edit" && isRealData && !cachedPost ? (postId ?? 0) : 0,
  )

  // 캐시 우선, 없으면 API 데이터 사용
  const existingPost = cachedPost || apiPost

  // 로딩 중
  if (isLoadingUsers || (isLoadingPost && isRealData && !cachedPost)) {
    return <div className="p-4 text-center">로딩 중...</div>
  }

  // 수정 모드인데 게시글을 찾을 수 없는 경우
  if (mode === "edit" && !existingPost) {
    return <div className="p-4 text-center text-red-500">게시글을 찾을 수 없습니다.</div>
  }

  // 초기값 결정 (순수함수 사용)
  const initialData: NewPost = getInitialPostData(mode, existingPost, users)

  // key를 사용하여 postId가 변경되면 Inner 컴포넌트 리마운트
  return (
    <PostFormInner
      key={postId ?? "create"}
      mode={mode}
      postId={postId}
      initialData={initialData}
      closeModal={closeModal}
      users={users}
      tags={tags}
    />
  )
}
