/**
 * URL 파라미터 상태 관리 Hook
 * - URL을 Single Source of Truth로 사용
 * - 페이지네이션, 검색, 필터, 정렬 상태 통합 관리
 */
import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"

export interface URLState {
  skip: number
  limit: number
  searchQuery: string
  selectedTag: string
  sortBy: string
  order: "asc" | "desc"
}

/**
 * URL 파라미터 파싱 (순수함수)
 */
export const parseURLState = (searchParams: URLSearchParams): URLState => ({
  skip: parseInt(searchParams.get("skip") || "0"),
  limit: parseInt(searchParams.get("limit") || "10"),
  searchQuery: searchParams.get("search") || "",
  selectedTag: searchParams.get("tag") || "",
  sortBy: searchParams.get("sortBy") || "",
  order: (searchParams.get("order") || "asc") as "asc" | "desc",
})

/**
 * 기본값 여부 확인 (순수함수)
 */
const isDefaultValue = (paramKey: string, value: unknown): boolean => {
  return (
    value === "" ||
    value === 0 ||
    value === "asc" ||
    value === "all" ||
    value === "none" ||
    (paramKey === "limit" && value === 10)
  )
}

/**
 * 키 이름 매핑 (순수함수)
 */
const mapKeyToParam = (key: string): string => {
  if (key === "searchQuery") return "search"
  if (key === "selectedTag") return "tag"
  return key
}

/**
 * URL 상태 관리 Hook
 */
export const useURLState = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const urlState = useMemo(() => parseURLState(searchParams), [searchParams])

  const updateURL = useCallback(
    (updates: Partial<URLState>) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)

        Object.entries(updates).forEach(([key, value]) => {
          const paramKey = mapKeyToParam(key)

          if (isDefaultValue(paramKey, value)) {
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

  const resetURL = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  return {
    ...urlState,
    updateURL,
    resetURL,
  }
}
