import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui";
import { useModalContext } from "@/shared/lib/modal-context";
import { PostForm } from "@/features/post/ui/PostForm";
import { CommentForm } from "@/features/comment/ui/CommentForm";
import { CommentListWidget } from "@/widgets/comment/ui/CommentListWidget";
import { usePostDetail } from "@/entities/post/model/usePostQuery";
import { useUserDetail } from "@/entities/user/model/useUserQuery";
import type { ModalDataMap } from "@/shared/lib/modal-context";

/**
 * 게시물 상세 모달 내용
 */
const PostDetailContent = ({ postId }: { postId: number }) => {
  const { data: post } = usePostDetail(postId);

  if (!post) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="space-y-4">
      <p>{post.body}</p>
      <CommentListWidget postId={postId} />
    </div>
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
 * 전역 모달 컨테이너
 * 모든 모달을 중앙에서 렌더링
 */
export const ModalContainer = () => {
  const { modalType, modalData, closeModal } = useModalContext();

  // 모달 타이틀 결정
  const getModalTitle = (): string => {
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

  // 모달 내용 렌더링
  const renderModalContent = () => {
    switch (modalType) {
      case "postAdd":
        return <PostForm mode="create" />;

      case "postEdit": {
        const data = modalData as ModalDataMap["postEdit"];
        return <PostForm mode="edit" postId={data?.postId} />;
      }

      case "postDetail": {
        const data = modalData as ModalDataMap["postDetail"];
        return data?.postId ? <PostDetailContent postId={data.postId} /> : null;
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
          <CommentForm
            mode="edit"
            postId={data.postId}
            commentId={data.commentId}
          />
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

  const isModalOpen = modalType !== null;
  const isLargeModal = modalType === "postDetail";

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className={isLargeModal ? "max-w-3xl" : undefined}>
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
        </DialogHeader>
        {renderModalContent()}
      </DialogContent>
    </Dialog>
  );
};
