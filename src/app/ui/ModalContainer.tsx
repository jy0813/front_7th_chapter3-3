import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui";
import { useModalContext } from "@/shared/lib/modal-context";
import type { ModalType, ModalDataMap, ModalStackItem } from "@/shared/lib/modal-context";
import { PostForm } from "@/features/post/ui/PostForm";
import { CommentForm } from "@/features/comment/ui/CommentForm";
import { CommentListWidget } from "@/widgets/comment/ui/CommentListWidget";
import { usePostDetail } from "@/entities/post/model/usePostQuery";
import { useUserDetail } from "@/entities/user/model/useUserQuery";
import { postKeys } from "@/entities/post/model/queryKeys";
import { commentKeys } from "@/entities/comment/model/queryKeys";
import { DUMMYJSON_MAX_POST_ID } from "@/shared/config";
import { highlightText } from "@/shared/lib/highlightText";
import type { Post, PostListResponse } from "@/entities/post/model/types";
import type { Comment, CommentListResponse } from "@/entities/comment/model/types";

/**
 * 캐시에서 게시글 찾기 (낙관적 업데이트된 게시글 포함)
 */
const findPostInCache = (queryClient: ReturnType<typeof useQueryClient>, postId: number): Post | undefined => {
  const allListCaches = queryClient.getQueriesData<PostListResponse>({ queryKey: postKeys.lists() });

  for (const [, data] of allListCaches) {
    if (data?.posts) {
      const found = data.posts.find((post) => post.id === postId);
      if (found) return found;
    }
  }

  return undefined;
};

/**
 * 캐시에서 댓글 찾기 (낙관적 업데이트된 댓글 포함)
 */
const findCommentInCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number,
  commentId: number
): Comment | undefined => {
  const commentsData = queryClient.getQueryData<CommentListResponse>(commentKeys.list(postId));
  return commentsData?.comments.find((comment) => comment.id === commentId);
};

/**
 * 게시물 상세 모달 내용
 * - ID 1~251 (실제 데이터): 캐시 → API fallback
 * - ID 252+ (낙관적 생성): 캐시에서만 조회
 */
const PostDetailContent = ({ postId, searchQuery = "" }: { postId: number; searchQuery?: string }) => {
  const queryClient = useQueryClient();
  const cachedPost = findPostInCache(queryClient, postId);

  // 실제 DummyJSON 데이터(ID 1~251)는 API에서도 조회 시도
  const isRealData = postId <= DUMMYJSON_MAX_POST_ID;
  const { data: apiPost, isLoading } = usePostDetail(isRealData && !cachedPost ? postId : 0);

  // 캐시 우선, 없으면 API 데이터 사용
  const post = cachedPost || apiPost;

  if (isLoading && isRealData && !cachedPost) {
    return <div>로딩 중...</div>;
  }

  if (!post) {
    return <div className="text-red-500">게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-4">
      <p>{highlightText(post.body, searchQuery)}</p>
      <CommentListWidget postId={postId} searchQuery={searchQuery} />
    </div>
  );
};

/**
 * 댓글 수정 모달 내용
 * 캐시에서 기존 댓글 데이터를 가져와 CommentForm에 전달
 */
const CommentEditContent = ({ postId, commentId }: { postId: number; commentId: number }) => {
  const queryClient = useQueryClient();
  const comment = findCommentInCache(queryClient, postId, commentId);

  if (!comment) {
    return <div className="text-red-500">댓글을 찾을 수 없습니다.</div>;
  }

  // DummyJSON API는 userId가 없고 user.id로 제공됨
  // 낙관적 생성 댓글은 userId가 있음
  const userId = comment.userId ?? comment.user?.id;

  return (
    <CommentForm
      key={commentId}
      mode="edit"
      postId={postId}
      commentId={commentId}
      initialBody={comment.body}
      initialUserId={userId}
    />
  );
};

/**
 * 사용자 상세 모달 내용
 */
const UserDetailContent = ({ userId }: { userId: number }) => {
  const { data: user, isLoading } = useUserDetail(userId);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    return <div>사용자를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-4">
      <img
        src={user.image}
        alt={user.username}
        className="w-24 h-24 rounded-full mx-auto"
      />
      <h3 className="text-xl font-semibold text-center">{user.username}</h3>
      <div className="space-y-2">
        <p>
          <strong>이름:</strong> {user.firstName} {user.lastName}
        </p>
        <p>
          <strong>나이:</strong> {user.age}
        </p>
        <p>
          <strong>이메일:</strong> {user.email}
        </p>
        <p>
          <strong>전화번호:</strong> {user.phone}
        </p>
        <p>
          <strong>주소:</strong> {user.address?.address}, {user.address?.city},{" "}
          {user.address?.state}
        </p>
        <p>
          <strong>직장:</strong> {user.company?.name} - {user.company?.title}
        </p>
      </div>
    </div>
  );
};

/**
 * 모달 타이틀 결정 (기본 타이틀)
 */
const getDefaultModalTitle = (modalType: ModalType): string => {
  switch (modalType) {
    case "postAdd":
      return "새 게시물 추가";
    case "postEdit":
      return "게시물 수정";
    case "postDetail":
      return "게시물 상세";
    case "commentAdd":
      return "새 댓글 추가";
    case "commentEdit":
      return "댓글 수정";
    case "userDetail":
      return "사용자 정보";
    default:
      return "";
  }
};

/**
 * 게시물 상세 모달 타이틀 (하이라이트 적용)
 */
const PostDetailTitle = ({ postId, searchQuery = "" }: { postId: number; searchQuery?: string }) => {
  const queryClient = useQueryClient();
  const cachedPost = findPostInCache(queryClient, postId);

  const isRealData = postId <= DUMMYJSON_MAX_POST_ID;
  const { data: apiPost } = usePostDetail(isRealData && !cachedPost ? postId : 0);

  const post = cachedPost || apiPost;
  const title = post?.title || "게시물 상세";

  return <>{highlightText(title, searchQuery)}</>;
};

/**
 * 모달 내용 렌더링
 */
const renderModalContent = (modalType: ModalType, modalData: ModalDataMap[ModalType] | undefined) => {
  switch (modalType) {
    case "postAdd":
      return <PostForm mode="create" />;

    case "postEdit": {
      const data = modalData as ModalDataMap["postEdit"];
      return <PostForm mode="edit" postId={data?.postId} />;
    }

    case "postDetail": {
      const data = modalData as ModalDataMap["postDetail"];
      return data?.postId ? (
        <PostDetailContent postId={data.postId} searchQuery={data.searchQuery} />
      ) : null;
    }

    case "commentAdd": {
      const data = modalData as ModalDataMap["commentAdd"];
      return data?.postId ? (
        <CommentForm mode="create" postId={data.postId} />
      ) : null;
    }

    case "commentEdit": {
      const data = modalData as ModalDataMap["commentEdit"];
      return data?.commentId && data?.postId ? (
        <CommentEditContent postId={data.postId} commentId={data.commentId} />
      ) : null;
    }

    case "userDetail": {
      const data = modalData as ModalDataMap["userDetail"];
      return data?.userId ? <UserDetailContent userId={data.userId} /> : null;
    }

    default:
      return null;
  }
};

/**
 * 개별 모달 렌더링 컴포넌트
 */
interface SingleModalProps {
  modalItem: ModalStackItem;
  index: number;
  isTop: boolean;
  onClose: () => void;
}

const SingleModal = ({ modalItem, index, isTop, onClose }: SingleModalProps) => {
  const { type, data } = modalItem;
  const isLargeModal = type === "postDetail";

  // postDetail일 때 타이틀에 하이라이트 적용
  const renderTitle = () => {
    if (type === "postDetail") {
      const detailData = data as ModalDataMap["postDetail"];
      if (detailData?.postId) {
        return <PostDetailTitle postId={detailData.postId} searchQuery={detailData.searchQuery} />;
      }
    }
    return getDefaultModalTitle(type);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={isLargeModal ? "max-w-3xl" : undefined}
        style={{
          zIndex: 50 + index * 10,
          // 하위 모달은 약간 더 작게 보이도록 (선택적)
          transform: isTop ? undefined : `translate(-50%, -50%) scale(${1 - index * 0.02})`,
        }}
      >
        <DialogHeader>
          <DialogTitle>{renderTitle()}</DialogTitle>
        </DialogHeader>
        {renderModalContent(type, data)}
      </DialogContent>
    </Dialog>
  );
};

/**
 * 전역 모달 컨테이너
 * 스택 기반으로 모든 모달을 중첩 렌더링
 */
export const ModalContainer = () => {
  const { modalStack, closeModal } = useModalContext();

  if (modalStack.length === 0) {
    return null;
  }

  return (
    <>
      {modalStack.map((modalItem, index) => (
        <SingleModal
          key={`${modalItem.type}-${index}`}
          modalItem={modalItem}
          index={index}
          isTop={index === modalStack.length - 1}
          onClose={closeModal}
        />
      ))}
    </>
  );
};
