import { useState, useEffect } from "react";
import { Button, Input, Textarea } from "@/shared/ui";
import { useCreatePost, useUpdatePost } from "@/features/post/model/usePostMutation";
import { usePostDetail } from "@/entities/post/model/usePostQuery";
import { useModalContext } from "@/shared/lib/modal-context";
import type { NewPost, UpdatePost } from "@/entities/post/model/types";

interface PostFormProps {
  mode: "create" | "edit";
  postId?: number;
}

/**
 * 게시물 추가/수정 폼
 * mode에 따라 생성 또는 수정 동작
 */
export const PostForm = ({ mode, postId }: PostFormProps) => {
  const { closeModal } = useModalContext();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  // 수정 모드일 때 기존 데이터 로드
  const { data: existingPost } = usePostDetail(postId ?? 0);

  const [formData, setFormData] = useState<NewPost>({
    title: "",
    body: "",
    userId: 1,
  });

  // 수정 모드: 기존 데이터로 폼 초기화
  useEffect(() => {
    if (mode === "edit" && existingPost) {
      setFormData({
        title: existingPost.title,
        body: existingPost.body,
        userId: existingPost.userId,
      });
    }
  }, [mode, existingPost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create") {
      createPost.mutate(formData, {
        onSuccess: () => {
          closeModal();
        },
      });
    } else if (mode === "edit" && postId) {
      const updateData: UpdatePost = {
        title: formData.title,
        body: formData.body,
      };
      updatePost.mutate(
        { id: postId, data: updateData },
        {
          onSuccess: () => {
            closeModal();
          },
        }
      );
    }
  };

  const isPending = createPost.isPending || updatePost.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">제목</label>
        <Input
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="제목을 입력하세요"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">내용</label>
        <Textarea
          value={formData.body}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, body: e.target.value }))
          }
          placeholder="내용을 입력하세요"
          required
        />
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
  );
};
