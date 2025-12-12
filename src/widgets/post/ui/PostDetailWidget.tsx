/**
 * 게시물 상세 위젯
 * - ID 1~251 (실제 데이터): 캐시 → API fallback
 * - ID 252+ (낙관적 생성): 캐시에서만 조회
 * - 댓글 목록 위젯 포함
 */
import { useQueryClient } from "@tanstack/react-query"
import { highlightText } from "@/shared/lib/highlightText"
import { findPostInCache, isRealPostData } from "@/entities/post/lib"
import { usePostDetail } from "@/entities/post/model/usePostQuery"
import { CommentListWidget } from "@/widgets/comment/ui/CommentListWidget"

interface PostDetailWidgetProps {
  postId: number
  searchQuery?: string
}

/**
 * 게시물 상세 내용 위젯
 */
export const PostDetailWidget = ({ postId, searchQuery = "" }: PostDetailWidgetProps) => {
  const queryClient = useQueryClient()
  const cachedPost = findPostInCache(queryClient, postId)

  // 실제 DummyJSON 데이터는 API에서도 조회 시도
  const isRealData = isRealPostData(postId)
  const { data: apiPost, isLoading } = usePostDetail(isRealData && !cachedPost ? postId : 0)

  // 캐시 우선, 없으면 API 데이터 사용
  const post = cachedPost || apiPost

  if (isLoading && isRealData && !cachedPost) {
    return <div>로딩 중...</div>
  }

  if (!post) {
    return <div className="text-red-500">게시글을 찾을 수 없습니다.</div>
  }

  return (
    <div className="space-y-4">
      <p>{highlightText(post.body, searchQuery)}</p>
      <CommentListWidget postId={postId} searchQuery={searchQuery} />
    </div>
  )
}

/**
 * 게시물 상세 모달 타이틀 (하이라이트 적용)
 */
export const PostDetailTitle = ({ postId, searchQuery = "" }: PostDetailWidgetProps) => {
  const queryClient = useQueryClient()
  const cachedPost = findPostInCache(queryClient, postId)

  const isRealData = isRealPostData(postId)
  const { data: apiPost } = usePostDetail(isRealData && !cachedPost ? postId : 0)

  const post = cachedPost || apiPost
  const title = post?.title || "게시물 상세"

  return <>{highlightText(title, searchQuery)}</>
}
