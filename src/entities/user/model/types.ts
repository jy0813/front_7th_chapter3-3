/**
 * User 도메인 타입 정의
 */

// 사용자 주소 타입
export interface UserAddress {
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
}

// 사용자 회사 정보 타입
export interface UserCompany {
  name: string;
  title: string;
  department?: string;
}

// 사용자 타입 (전체 정보)
export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
  age: number;
  address?: UserAddress;
  company?: UserCompany;
}

// 사용자 간략 정보 (게시물/댓글에서 사용)
export interface UserSummary {
  id: number;
  username: string;
  image?: string;
}

// 사용자 목록 API 응답
export interface UserListResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}
