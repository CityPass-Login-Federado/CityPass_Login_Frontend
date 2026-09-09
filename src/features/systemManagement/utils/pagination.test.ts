import { normalizePaginatedResponse } from './pagination';

describe('normalizePaginatedResponse', () => {
  test('conserva una respuesta paginada del contrato actual', () => {
    const response = {
      content: ['a'],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      size: 8,
    };

    expect(normalizePaginatedResponse(response, 0, 8)).toBe(response);
  });

  test('normaliza y pagina una lista simple del Swagger anterior', () => {
    const response = ['a', 'b', 'c'];

    expect(normalizePaginatedResponse(response, 1, 2)).toEqual({
      content: ['c'],
      totalElements: 3,
      totalPages: 2,
      currentPage: 1,
      size: 2,
    });
  });
});
