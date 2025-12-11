import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
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
import { postKeys } from "@/entities/post/model/queryKeys"
import { useModifiedPostStore } from "@/entities/post/model/modifiedPostStore"
import { DUMMYJSON_MAX_POST_ID } from "@/shared/config"
import { AddPostButton } from "@/features/post/ui/AddPostButton"
import { PostSearchFilter } from "@/features/post/ui/PostSearchFilter"
import { PostTableWidget } from "@/widgets/post/ui/PostTableWidget"
import type { Post, PostListResponse } from "@/entities/post/model/types"

/**
 * PostsManagerPage (FSD Architecture)
 *
 * 서버 상태: TanStack Query (usePostList, usePostSearch, useUserList)
 * URL 상태: useSearchParams (skip, limit, tag, sortBy, order, search)
 * UI 상태: useModalContext (via features/widgets)
 *
 * URL을 Single Source of Truth로 사용하여 set-state-in-effect 안티패턴 회피
 */
/**
 * 캐시에서 낙관적 게시글(ID > 251) 추출
 */
const getOptimisticPosts = (queryClient: ReturnType<typeof useQueryClient>): Post[] => {
  const allListCaches = queryClient.getQueriesData<PostListResponse>({ queryKey: postKeys.lists() })
  const optimisticPosts: Post[] = []
  const seenIds = new Set<number>()

  for (const [, data] of allListCaches) {
    if (data?.posts) {
      for (const post of data.posts) {
        // ID가 251보다 크고 아직 추가 안 된 게시글만
        if (post.id > DUMMYJSON_MAX_POST_ID && !seenIds.has(post.id)) {
          optimisticPosts.push(post)
          seenIds.add(post.id)
        }
      }
    }
  }

  return optimisticPosts
}

/**
 * 캐시에서 특정 ID의 게시글 찾기 (수정된 버전)
 */
const getCachedPost = (queryClient: ReturnType<typeof useQueryClient>, postId: number): Post | undefined => {
  const allListCaches = queryClient.getQueriesData<PostListResponse>({ queryKey: postKeys.lists() })

  for (const [, data] of allListCaches) {
    if (data?.posts) {
      const found = data.posts.find((post) => post.id === postId)
      if (found) return found
    }
  }

  return undefined
}

const PostsManagerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  // URL에서 직접 상태 파생 (useState + useEffect 동기화 제거)
  const urlState = useMemo(
    () => ({
      skip: parseInt(searchParams.get("skip") || "0"),
      limit: parseInt(searchParams.get("limit") || "10"),
      searchQuery: searchParams.get("search") || "",
      selectedTag: searchParams.get("tag") || "",
      sortBy: searchParams.get("sortBy") || "",
      order: (searchParams.get("order") || "asc") as "asc" | "desc",
    }),
    [searchParams],
  )

  const { skip, limit, searchQuery, selectedTag, sortBy, order } = urlState

  // URL 업데이트 헬퍼 (상태 변경 = URL 변경)
  const updateURL = useCallback(
    (updates: Partial<typeof urlState>) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)

        Object.entries(updates).forEach(([key, value]) => {
          const paramKey = key === "searchQuery" ? "search" : key === "selectedTag" ? "tag" : key
          if (
            value === "" ||
            value === 0 ||
            value === "asc" ||
            value === "all" ||
            value === "none" ||
            (paramKey === "limit" && value === 10)
          ) {
            params.delete(paramKey)
          } else {
            params.set(paramKey, String(value))
          }
        })

        return params
      })
    },
    [setSearchParams],
  )

  // 서버 상태: TanStack Query (정렬은 서버에서 처리)
  const { data: postsData, isLoading: isPostsLoading } = usePostList({
    limit,
    skip,
    tag: selectedTag || undefined,
    sortBy: sortBy || undefined,
    order,
  })

  const { data: searchData, isLoading: isSearchLoading } = usePostSearch(searchQuery)
  const { data: usersData } = useUserList()

  // 검색 중이면 검색 결과, 아니면 일반 목록
  const isSearching = searchQuery.length > 0
  const isLoading = isSearching ? isSearchLoading : isPostsLoading

  // 수정된 게시글 ID 목록
  const modifiedIds = useModifiedPostStore((state) => state.modifiedIds)

  // 사용자 정보 매핑 + 낙관적 게시글 병합 + 수정된 게시글 캐시 버전 적용
  const { posts, total } = useMemo(() => {
    const rawPosts = isSearching ? (searchData?.posts ?? []) : (postsData?.posts ?? [])
    const totalCount = isSearching ? (searchData?.total ?? 0) : (postsData?.total ?? 0)

    // 낙관적 게시글 가져오기 (ID > 251)
    const optimisticPosts = getOptimisticPosts(queryClient)

    // 검색/필터 조건에 맞는 낙관적 게시글 필터링
    const matchingOptimistic = optimisticPosts.filter((post) => {
      // 검색어 조건
      if (isSearching) {
        const query = searchQuery.toLowerCase()
        const titleMatch = post.title.toLowerCase().includes(query)
        const bodyMatch = post.body.toLowerCase().includes(query)
        if (!titleMatch && !bodyMatch) return false
      }

      // 태그 조건
      if (selectedTag && selectedTag !== "all") {
        if (!post.tags?.includes(selectedTag)) return false
      }

      return true
    })

    // API 결과에서 수정된 게시글(ID 1~251)은 캐시 버전으로 교체
    const processedPosts = rawPosts.map((post) => {
      // 수정된 게시글인지 확인
      if (post.id <= DUMMYJSON_MAX_POST_ID && modifiedIds.has(post.id)) {
        // 캐시에서 수정된 버전 가져오기
        const cachedPost = getCachedPost(queryClient, post.id)
        if (cachedPost) {
          return cachedPost
        }
      }
      return post
    })

    // 수정된 게시글이 검색/필터 조건에 맞는지 재확인 (태그가 제거된 경우 필터링)
    const filteredProcessedPosts = processedPosts.filter((post) => {
      // 검색어 조건 재확인 (수정된 게시글의 제목/내용이 변경됐을 수 있음)
      if (isSearching) {
        const query = searchQuery.toLowerCase()
        const titleMatch = post.title.toLowerCase().includes(query)
        const bodyMatch = post.body.toLowerCase().includes(query)
        if (!titleMatch && !bodyMatch) return false
      }

      // 태그 조건 재확인 (태그가 제거됐을 수 있음)
      if (selectedTag && selectedTag !== "all") {
        if (!post.tags?.includes(selectedTag)) return false
      }

      return true
    })

    // API 결과에 이미 포함된 낙관적 게시글 제외 (중복 방지)
    const processedPostIds = new Set(filteredProcessedPosts.map((p) => p.id))
    const uniqueOptimistic = matchingOptimistic.filter((p) => !processedPostIds.has(p.id))

    // 낙관적 게시글을 앞에 배치
    const mergedPosts = [...uniqueOptimistic, ...filteredProcessedPosts]

    const mappedPosts: Post[] = mergedPosts.map((post) => ({
      ...post,
      author: usersData?.users?.find((user) => user.id === post.userId),
    }))

    return { posts: mappedPosts, total: totalCount + uniqueOptimistic.length }
  }, [isSearching, searchData, postsData, usersData?.users, queryClient, searchQuery, selectedTag, modifiedIds])

  // 정렬은 서버에서 처리됨 (DummyJSON sortBy + order 파라미터)
  // 검색 결과는 클라이언트 정렬 적용
  const sortedPosts = useMemo(() => {
    if (!isSearching) return posts // 일반 목록은 서버 정렬 사용

    // 검색 결과만 클라이언트 정렬 적용
    return [...posts].sort((a, b) => {
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

      return order === "desc" ? -comparison : comparison
    })
  }, [posts, sortBy, order, isSearching])

  // 태그 선택 핸들러
  const handleTagSelect = useCallback(
    (tag: string) => {
      updateURL({ selectedTag: tag, skip: 0 })
    },
    [updateURL],
  )

  // 검색 핸들러
  const handleSearchChange = useCallback(
    (value: string) => {
      updateURL({ searchQuery: value, skip: 0 })
    },
    [updateURL],
  )

  // 정렬 핸들러
  const handleSortByChange = useCallback(
    (value: string) => {
      updateURL({ sortBy: value })
    },
    [updateURL],
  )

  const handleOrderChange = useCallback(
    (value: string) => {
      updateURL({ order: value as "asc" | "desc" })
    },
    [updateURL],
  )

  // 필터 초기화 핸들러
  const handleReset = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

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
            onReset={handleReset}
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
                  updateURL({ limit: Number(value), skip: 0 })
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
              <Button disabled={skip === 0} onClick={() => updateURL({ skip: Math.max(0, skip - limit) })}>
                이전
              </Button>
              <Button disabled={skip + limit >= total} onClick={() => updateURL({ skip: skip + limit })}>
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
