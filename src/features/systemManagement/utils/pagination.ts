import { type PaginatedResponse } from '../types';

export type RawListResponse<T> = PaginatedResponse<T> | T[];

export const normalizePaginatedResponse = <T>(
  response: RawListResponse<T>,
  page: number,
  size: number,
): PaginatedResponse<T> => {
  if (!Array.isArray(response)) {
    return response;
  }

  const safePage = Math.max(0, page);
  const safeSize = size > 0 ? size : 10;
  const firstItem = safePage * safeSize;
  const totalElements = response.length;

  return {
    content: response.slice(firstItem, firstItem + safeSize),
    totalElements,
    totalPages: Math.ceil(totalElements / safeSize),
    currentPage: safePage,
    size: safeSize,
  };
};
