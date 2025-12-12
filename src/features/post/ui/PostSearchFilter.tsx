import { Search, RotateCcw } from "lucide-react"
import { Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui"
import { useTagList } from "@/entities/tag/model/useTagQuery"
import { hasActiveFilters } from "@/entities/post/lib"

interface PostSearchFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedTag: string;
  onTagChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  order: string;
  onOrderChange: (value: string) => void;
  onReset?: () => void;
}

/**
 * 게시물 검색 + 필터 컴포넌트
 * 검색어, 태그, 정렬 옵션 제어
 */
export const PostSearchFilter = ({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagChange,
  sortBy,
  onSortByChange,
  order,
  onOrderChange,
  onReset,
}: PostSearchFilterProps) => {
  const { data: tagsData } = useTagList()
  const tags = tagsData ?? []

  // 필터/정렬이 적용되었는지 확인 (순수함수 사용)
  const hasFilters = hasActiveFilters(searchQuery, selectedTag, sortBy, order)

  return (
    <div className="flex gap-4">
      {/* 검색창 */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          className="pl-10"
          placeholder="게시물 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* 태그 필터 */}
      <Select value={selectedTag} onValueChange={onTagChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="태그 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 태그</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag.slug} value={tag.slug}>
              {tag.slug}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 정렬 기준 */}
      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="정렬 기준" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">없음</SelectItem>
          <SelectItem value="id">ID</SelectItem>
          <SelectItem value="title">제목</SelectItem>
          <SelectItem value="reactions">반응</SelectItem>
        </SelectContent>
      </Select>

      {/* 정렬 순서 */}
      <Select value={order} onValueChange={onOrderChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="정렬 순서" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">오름차순</SelectItem>
          <SelectItem value="desc">내림차순</SelectItem>
        </SelectContent>
      </Select>

      {/* 초기화 버튼 - 항상 노출, 필터 없으면 비활성화 */}
      {onReset && (
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          disabled={!hasFilters}
          title="필터 초기화"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
