import { ThumbsUp, ThumbsDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import { highlightText } from "@/shared/lib/highlightText";
import { useModalContext } from "@/shared/lib/modal-context";
import { EditPostButton } from "@/features/post/ui/EditPostButton";
import { DeletePostButton } from "@/features/post/ui/DeletePostButton";
import { PostDetailButton } from "@/features/post/ui/PostDetailButton";
import type { Post } from "@/entities/post/model/types";

interface PostTableWidgetProps {
  posts: Post[];
  searchQuery: string;
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  isLoading?: boolean;
}

/**
 * 게시물 테이블 위젯
 * 게시물 목록을 테이블 형태로 표시
 */
export const PostTableWidget = ({
  posts,
  searchQuery,
  selectedTag,
  onTagSelect,
  isLoading,
}: PostTableWidgetProps) => {
  const { openModal } = useModalContext();

  if (isLoading) {
    return <div className="flex justify-center p-4">로딩 중...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">ID</TableHead>
          <TableHead>제목</TableHead>
          <TableHead className="w-[150px]">작성자</TableHead>
          <TableHead className="w-[150px]">반응</TableHead>
          <TableHead className="w-[150px]">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id}>
            <TableCell>{post.id}</TableCell>
            <TableCell>
              <div className="space-y-1">
                <div>{highlightText(post.title, searchQuery)}</div>
                <div className="flex flex-wrap gap-1">
                  {post.tags?.map((tag) => (
                    <span
                      key={tag}
                      className={`px-1 text-[9px] font-semibold rounded-[4px] cursor-pointer ${
                        selectedTag === tag
                          ? "text-white bg-blue-500 hover:bg-blue-600"
                          : "text-blue-800 bg-blue-100 hover:bg-blue-200"
                      }`}
                      onClick={() => onTagSelect(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() =>
                  post.author && openModal("userDetail", { userId: post.author.id })
                }
              >
                <img
                  src={post.author?.image}
                  alt={post.author?.username}
                  className="w-8 h-8 rounded-full"
                />
                <span>{post.author?.username}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                <span>{post.reactions?.likes || 0}</span>
                <ThumbsDown className="w-4 h-4" />
                <span>{post.reactions?.dislikes || 0}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <PostDetailButton postId={post.id} />
                <EditPostButton postId={post.id} />
                <DeletePostButton postId={post.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
