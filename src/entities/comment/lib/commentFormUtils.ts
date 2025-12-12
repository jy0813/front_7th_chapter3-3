/**
 * 댓글 폼 관련 순수함수
 * - 초기값 계산, 사용자 찾기 등
 */
import type { User } from "@/entities/user/model/types"

/**
 * 기본 userId 결정
 * @param initialUserId props로 전달된 초기 userId
 * @param users 사용자 목록
 * @returns 기본 userId (initialUserId > 첫 번째 사용자 > 1)
 */
export const getDefaultUserId = (initialUserId: number | undefined, users: User[]): number => {
  return initialUserId ?? users[0]?.id ?? 1
}

/**
 * 유효한 userId 결정 (state와 default 중 선택)
 * @param stateUserId 상태로 관리되는 userId
 * @param defaultUserId 기본 userId
 * @returns 유효한 userId
 */
export const getEffectiveUserId = (stateUserId: number | undefined, defaultUserId: number): number => {
  return stateUserId ?? defaultUserId
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
