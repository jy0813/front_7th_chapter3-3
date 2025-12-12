/**
 * PostsManagerPage (FSD Architecture)
 *
 * 서버 상태: TanStack Query (usePostList, usePostSearch, useUserList)
 * URL 상태: useURLState (skip, limit, tag, sortBy, order, search)
 * UI 상태: useModalContext (via features/widgets)
 *
 * URL을 Single Source of Truth로 사용하여 set-state-in-effect 안티패턴 회피
 *
 * 리팩토링 완료:
 * - 순수함수 → entities/post/lib/로 분리
 * - URL 상태 관리 → shared/hooks/useURLState로 분리
 * - 게시글 처리 로직 → entities/post/model/useProcessedPosts로 분리
 */
import { useCallback } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui"
import { useURLState } from "@/shared/hooks/useURLState"
import { usePostList, usePostSearch } from "@/entities/post/model/usePostQuery"
import { useUserList } from "@/entities/user/model/useUserQuery"
import { useProcessedPosts } from "@/entities/post/model/useProcessedPosts"
import { AddPostButton } from "@/features/post/ui/AddPostButton"
import { PostSearchFilter } from "@/features/post/ui/PostSearchFilter"
import { PostTableWidget } from "@/widgets/post/ui/PostTableWidget"

const PostsManagerPage = () => {
  // URL 상태 관리 (hook으로 분리)
  const { skip, limit, searchQuery, selectedTag, sortBy, order, updateURL, resetURL } = useURLState()

  // 서버 상태: TanStack Query
  const { data: postsData, isLoading: isPostsLoading } = usePostList({
    limit,
    skip,
    tag: selectedTag || undefined,
    sortBy: sortBy || undefined,
    order,
  })

  const { data: searchData, isLoading: isSearchLoading } = usePostSearch(searchQuery)
  const { data: usersData } = useUserList()

  // 검색 중 여부
  const isSearching = searchQuery.length > 0
  const isLoading = isSearching ? isSearchLoading : isPostsLoading

  // 게시글 처리 로직 (hook으로 분리)
  const { posts, total } = useProcessedPosts({
    postsData,
    searchData,
    users: usersData?.users ?? [],
    isSearching,
    searchQuery,
    selectedTag,
    sortBy,
    order,
  })

  // 이벤트 핸들러들
  const handleTagSelect = useCallback(
    (tag: string) => {
      updateURL({ selectedTag: tag, skip: 0 })
    },
    [updateURL],
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      updateURL({ searchQuery: value, skip: 0 })
    },
    [updateURL],
  )

  const handleSortByChange = useCallback(
    (value: string) => {
      updateURL({ sortBy: value, skip: 0 })
    },
    [updateURL],
  )

  const handleOrderChange = useCallback(
    (value: string) => {
      updateURL({ order: value as "asc" | "desc", skip: 0 })
    },
    [updateURL],
  )

  const handleLimitChange = useCallback(
    (value: string) => {
      updateURL({ limit: Number(value), skip: 0 })
    },
    [updateURL],
  )

  const handlePrevPage = useCallback(() => {
    updateURL({ skip: Math.max(0, skip - limit) })
  }, [updateURL, skip, limit])

  const handleNextPage = useCallback(() => {
    updateURL({ skip: skip + limit })
  }, [updateURL, skip, limit])

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>게시물 관리자</span>
          <AddPostButton />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* 검색 및 필터 */}
          <PostSearchFilter
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            selectedTag={selectedTag}
            onTagChange={handleTagSelect}
            sortBy={sortBy}
            onSortByChange={handleSortByChange}
            order={order}
            onOrderChange={handleOrderChange}
            onReset={resetURL}
          />

          {/* 게시물 테이블 */}
          <PostTableWidget
            posts={posts}
            searchQuery={searchQuery}
            selectedTag={selectedTag}
            onTagSelect={handleTagSelect}
            isLoading={isLoading}
          />

          {/* 페이지네이션 */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>표시</span>
              <Select value={limit.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                </SelectContent>
              </Select>
              <span>항목</span>
            </div>
            <div className="flex gap-2">
              <Button disabled={skip === 0} onClick={handlePrevPage}>
                이전
              </Button>
              <Button disabled={skip + limit >= total} onClick={handleNextPage}>
                다음
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PostsManagerPage
