/**
 * 전역 모달 컨테이너
 * - 모든 모달 타입을 스택 기반으로 렌더링
 * - 개별 모달 내용은 features 계층에서 분리됨
 */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui"
import { useModalContext } from "@/shared/lib/modal-context"
import type { ModalType, ModalDataMap, ModalStackItem } from "@/shared/lib/modal-context"
import { getDefaultModalTitle } from "@/shared/lib/modalUtils"

// Features - 모달 내용 컴포넌트
import { PostForm } from "@/features/post/ui/PostForm"
import { CommentForm } from "@/features/comment/ui/CommentForm"
import { CommentEditContent } from "@/features/comment/ui/CommentEditContent"
import { UserDetailContent } from "@/features/user/ui"

// Widgets - 복합 모달 컴포넌트
import { PostDetailWidget, PostDetailTitle } from "@/widgets/post/ui"

/**
 * 모달 내용 렌더링
 */
const renderModalContent = (modalType: ModalType, modalData: ModalDataMap[ModalType] | undefined) => {
  switch (modalType) {
    case "postAdd":
      return <PostForm mode="create" />

    case "postEdit": {
      const data = modalData as ModalDataMap["postEdit"]
      return <PostForm mode="edit" postId={data?.postId} />
    }

    case "postDetail": {
      const data = modalData as ModalDataMap["postDetail"]
      return data?.postId ? (
        <PostDetailWidget postId={data.postId} searchQuery={data.searchQuery} />
      ) : null
    }

    case "commentAdd": {
      const data = modalData as ModalDataMap["commentAdd"]
      return data?.postId ? <CommentForm mode="create" postId={data.postId} /> : null
    }

    case "commentEdit": {
      const data = modalData as ModalDataMap["commentEdit"]
      return data?.commentId && data?.postId ? (
        <CommentEditContent postId={data.postId} commentId={data.commentId} />
      ) : null
    }

    case "userDetail": {
      const data = modalData as ModalDataMap["userDetail"]
      return data?.userId ? <UserDetailContent userId={data.userId} /> : null
    }

    default:
      return null
  }
}

/**
 * 개별 모달 렌더링 컴포넌트
 */
interface SingleModalProps {
  modalItem: ModalStackItem
  index: number
  isTop: boolean
  onClose: () => void
}

const SingleModal = ({ modalItem, index, isTop, onClose }: SingleModalProps) => {
  const { type, data } = modalItem
  const isLargeModal = type === "postDetail"

  // postDetail일 때 타이틀에 하이라이트 적용
  const renderTitle = () => {
    if (type === "postDetail") {
      const detailData = data as ModalDataMap["postDetail"]
      if (detailData?.postId) {
        return <PostDetailTitle postId={detailData.postId} searchQuery={detailData.searchQuery} />
      }
    }
    return getDefaultModalTitle(type)
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={isLargeModal ? "max-w-3xl" : undefined}
        style={{
          zIndex: 50 + index * 10,
          transform: isTop ? undefined : `translate(-50%, -50%) scale(${1 - index * 0.02})`,
        }}
      >
        <DialogHeader>
          <DialogTitle>{renderTitle()}</DialogTitle>
        </DialogHeader>
        {renderModalContent(type, data)}
      </DialogContent>
    </Dialog>
  )
}

/**
 * 전역 모달 컨테이너
 * 스택 기반으로 모든 모달을 중첩 렌더링
 */
export const ModalContainer = () => {
  const { modalStack, closeModal } = useModalContext()

  if (modalStack.length === 0) {
    return null
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
  )
}
