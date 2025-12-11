import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
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
import { usePostList, usePostSearch } from "@/entities/post/model/usePostQuery"
import { useUserList } from "@/entities/user/model/useUserQuery"
import { AddPostButton } from "@/features/post/ui/AddPostButton"
import { PostSearchFilter } from "@/features/post/ui/PostSearchFilter"
import { PostTableWidget } from "@/widgets/post/ui/PostTableWidget"
import type { Post } from "@/entities/post/model/types"

/**
 * PostsManagerPage V2 (FSD Architecture)
 *
 * 서버 상태: TanStack Query (usePostList, usePostSearch, useUserList)
 * URL 상태: useSearchParams (skip, limit, tag, sortBy, sortOrder, search)
 * UI 상태: useModalContext (via features/widgets)
 */
const PostsManagerPageV2 = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  // URL 상태
  const [skip, setSkip] = useState(parseInt(queryParams.get("skip") || "0"))
  const [limit, setLimit] = useState(parseInt(queryParams.get("limit") || "10"))
  const [searchQuery, setSearchQuery] = useState(queryParams.get("search") || "")
  const [selectedTag, setSelectedTag] = useState(queryParams.get("tag") || "")
  const [sortBy, setSortBy] = useState(queryParams.get("sortBy") || "")
  const [sortOrder, setSortOrder] = useState(queryParams.get("sortOrder") || "asc")

  // 서버 상태: TanStack Query
  const { data: postsData, isLoading: isPostsLoading } = usePostList({
    limit,
    skip,
    tag: selectedTag || undefined,
  })

  const { data: searchData, isLoading: isSearchLoading } = usePostSearch(searchQuery)
  const { data: usersData } = useUserList()

  // 검색 중이면 검색 결과, 아니면 일반 목록
  const isSearching = searchQuery.length > 0
  const rawPosts = isSearching ? (searchData?.posts ?? []) : (postsData?.posts ?? [])
  const total = isSearching ? (searchData?.total ?? 0) : (postsData?.total ?? 0)
  const isLoading = isSearching ? isSearchLoading : isPostsLoading

  // 사용자 정보 매핑
  const posts: Post[] = rawPosts.map((post) => ({
    ...post,
    author: usersData?.users?.find((user) => user.id === post.userId),
  }))

  // 정렬 적용
  const sortedPosts = [...posts].sort((a, b) => {
    if (!sortBy || sortBy === "none") return 0

    let comparison = 0
    switch (sortBy) {
      case "id":
        comparison = a.id - b.id
        break
      case "title":
        comparison = a.title.localeCompare(b.title)
        break
      case "reactions":
        comparison = (a.reactions?.likes || 0) - (b.reactions?.likes || 0)
        break
    }

    return sortOrder === "desc" ? -comparison : comparison
  })

  // URL 업데이트
  const updateURL = () => {
    const params = new URLSearchParams()
    if (skip) params.set("skip", skip.toString())
    if (limit !== 10) params.set("limit", limit.toString())
    if (searchQuery) params.set("search", searchQuery)
    if (sortBy && sortBy !== "none") params.set("sortBy", sortBy)
    if (sortOrder !== "asc") params.set("sortOrder", sortOrder)
    if (selectedTag && selectedTag !== "all") params.set("tag", selectedTag)
    navigate(`?${params.toString()}`)
  }

  // URL 파라미터 변경 감지
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setSkip(parseInt(params.get("skip") || "0"))
    setLimit(parseInt(params.get("limit") || "10"))
    setSearchQuery(params.get("search") || "")
    setSortBy(params.get("sortBy") || "")
    setSortOrder(params.get("sortOrder") || "asc")
    setSelectedTag(params.get("tag") || "")
  }, [location.search])

  // 상태 변경 시 URL 업데이트
  useEffect(() => {
    updateURL()
  }, [skip, limit, sortBy, sortOrder, selectedTag])

  // 태그 선택 핸들러
  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag)
    setSkip(0)
  }

  // 검색 핸들러
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setSkip(0)
  }

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
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />

          {/* 게시물 테이블 */}
          <PostTableWidget
            posts={sortedPosts}
            searchQuery={searchQuery}
            selectedTag={selectedTag}
            onTagSelect={handleTagSelect}
            isLoading={isLoading}
          />

          {/* 페이지네이션 */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>표시</span>
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  setLimit(Number(value))
                  setSkip(0)
                }}
              >
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
              <Button disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - limit))}>
                이전
              </Button>
              <Button disabled={skip + limit >= total} onClick={() => setSkip(skip + limit)}>
                다음
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PostsManagerPageV2
