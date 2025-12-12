/**
 * 게시물 폼 관련 순수함수
 * - 초기값 계산, 태그 필터링, 데이터 검증 등
 */
import type { Post, NewPost } from "@/entities/post/model/types"
import type { Tag } from "@/entities/tag/model/types"
import type { User } from "@/entities/user/model/types"
import { DUMMYJSON_MAX_POST_ID } from "@/shared/config"

/**
 * 게시글이 실제 DummyJSON 데이터인지 확인
 * @param postId 게시글 ID
 * @returns 실제 데이터 여부 (ID 1~251)
 */
export const isRealPostData = (postId: number | undefined): boolean => {
  return postId !== undefined && postId <= DUMMYJSON_MAX_POST_ID
}

/**
 * 게시물 폼 초기값 생성
 * @param mode 폼 모드 (create | edit)
 * @param existingPost 수정 시 기존 게시글 데이터
 * @param users 사용자 목록 (생성 시 기본 사용자 선택용)
 * @returns NewPost 형태의 초기값
 */
export const getInitialPostData = (
  mode: "create" | "edit",
  existingPost: Post | undefined,
  users: User[],
): NewPost => {
  if (mode === "edit" && existingPost) {
    return {
      title: existingPost.title,
      body: existingPost.body,
      userId: existingPost.userId,
      tags: existingPost.tags ?? [],
    }
  }

  return {
    title: "",
    body: "",
    userId: users[0]?.id ?? 1,
    tags: [],
  }
}

/**
 * 선택 가능한 태그 필터링 (이미 선택된 태그 제외)
 * @param allTags 전체 태그 목록
 * @param selectedTags 이미 선택된 태그 slug 배열
 * @returns 선택 가능한 태그 목록
 */
export const getAvailableTags = (allTags: Tag[], selectedTags: string[] | undefined): Tag[] => {
  if (!selectedTags || selectedTags.length === 0) {
    return allTags
  }
  return allTags.filter((tag) => !selectedTags.includes(tag.slug))
}

/**
 * 태그 추가 (중복 방지)
 * @param currentTags 현재 태그 배열
 * @param newTag 추가할 태그
 * @returns 새 태그 배열
 */
export const addTag = (currentTags: string[] | undefined, newTag: string): string[] => {
  if (!newTag) return currentTags ?? []
  if (currentTags?.includes(newTag)) return currentTags
  return [...(currentTags ?? []), newTag]
}

/**
 * 태그 제거
 * @param currentTags 현재 태그 배열
 * @param tagToRemove 제거할 태그
 * @returns 새 태그 배열
 */
export const removeTag = (currentTags: string[] | undefined, tagToRemove: string): string[] => {
  return currentTags?.filter((t) => t !== tagToRemove) ?? []
}

/**
 * 사용자 ID로 사용자 찾기
 * @param users 사용자 목록
 * @param userId 찾을 사용자 ID
 * @returns 찾은 사용자 또는 undefined
 */
export const findUserById = (users: User[], userId: number): User | undefined => {
  return users.find((u) => u.id === userId)
}
