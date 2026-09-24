import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, test, vi } from 'vitest';

import { getPanelErrorMessage } from './errors';
import { getReservedParam, getUniqueGroupNames } from './groups';
import { getModuleName, toModuleSummaries } from './modules';
import { normalizePaginatedResponse } from './pagination';
import { panelQueryKeys } from './queryKeys';
import { reconcileGroups, reconcilePeopleAndGroups } from './cacheReconciliation';
import { useGroups } from '../hooks/useGroups';
import { usePeople } from '../hooks/usePeople';
import { fetchGroups, fetchPeople } from '../api/panelApi';

vi.mock('../api/panelApi', () => ({
  fetchPeople: vi.fn(),
  createPerson: vi.fn(),
  updatePerson: vi.fn(),
  setPersonDisabled: vi.fn(),
  fetchGroups: vi.fn(),
  createGroup: vi.fn(),
  addUserToGroup: vi.fn(),
  removeUserFromGroup: vi.fn(),
}));

describe('system management utils', () => {
  test('getPanelErrorMessage devuelve el mensaje del backend para AxiosError', () => {
    const error = new AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        data: { message: 'Credenciales inválidas' },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: { headers: {} },
      } as AxiosResponse<{ message: string }>,
    );

    expect(getPanelErrorMessage(error, 'fallback')).toBe('Credenciales inválidas');
  });

  test('getPanelErrorMessage usa fallback para errores sin estructura', () => {
    const errorWithUnexpectedShape = new AxiosError(
      'bad',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        data: { other: true },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: { headers: {} },
      } as AxiosResponse<{ other: boolean }>,
    );

    expect(getPanelErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
    expect(getPanelErrorMessage(new AxiosError('bad', 'ERR_BAD_REQUEST'), 'fallback')).toBe('fallback');
    expect(getPanelErrorMessage(errorWithUnexpectedShape, 'fallback')).toBe('fallback');
  });

  test('getUniqueGroupNames deduplica y ordena nombres', () => {
    expect(
      getUniqueGroupNames([
        { name: 'soporte', members: [], reserved: false },
        { name: 'analitica', members: [], reserved: false },
        { name: 'soporte', members: [], reserved: true },
      ]),
    ).toEqual(['analitica', 'soporte']);
  });

  test('getReservedParam traduce el filtro al contrato del backend', () => {
    expect(getReservedParam('all')).toBeUndefined();
    expect(getReservedParam('reserved')).toBe(true);
    expect(getReservedParam('available')).toBe(false);
  });

  test('getModuleName devuelve label por id y fallback por nombre no registrado', () => {
    expect(getModuleName('reclamos')).toBe('Reclamos');
    expect(getModuleName('EDA')).toBe('EDA');
    expect(getModuleName('custom')).toBe('custom');
    expect(getModuleName()).toBe('—');
  });

  test('toModuleSummaries conserva el orden del backend y normaliza duplicados', () => {
    expect(
      toModuleSummaries(['reclamos', ' EDA ', 'reclamos', 'nuevo-modulo']),
    ).toEqual([
      { id: 'reclamos', name: 'Reclamos' },
      { id: 'eda', name: 'EDA' },
      { id: 'nuevo-modulo', name: 'nuevo-modulo' },
    ]);
  });

  test('normalizePaginatedResponse maneja arrays y valores vacíos', () => {
    expect(normalizePaginatedResponse(['a', 'b', 'c'], 0, 2)).toEqual({
      content: ['a', 'b'],
      totalElements: 3,
      totalPages: 2,
      currentPage: 0,
      size: 2,
    });

    expect(normalizePaginatedResponse(['x'], 5, 0)).toEqual({
      content: [],
      totalElements: 1,
      totalPages: 1,
      currentPage: 5,
      size: 10,
    });

    expect(
      normalizePaginatedResponse(
        { content: ['z'], totalElements: 1, totalPages: 1, currentPage: 0, size: 10 },
        0,
        10,
      ),
    ).toEqual({ content: ['z'], totalElements: 1, totalPages: 1, currentPage: 0, size: 10 });
  });

  test('panelQueryKeys construye claves deterministas para personas y grupos', () => {
    expect(panelQueryKeys.peopleList({ page: 0, size: 10 })).toEqual([
      'system-management',
      'people',
      { page: 0, size: 10 },
    ]);

    expect(panelQueryKeys.groupsList({ page: 0, size: 10 })).toEqual([
      'system-management',
      'groups',
      { page: 0, size: 10 },
    ]);
    expect(panelQueryKeys.modules()).toEqual([
      'system-management',
      'modules',
    ]);
  });

  test('reconcile functions invalidan todas las consultas relevantes', async () => {
    const peopleSpy = vi.fn();
    const groupsSpy = vi.fn();
    const fakeClient = {
      invalidateQueries: async ({ queryKey }: { queryKey: unknown[] }) => {
        if (queryKey[1] === 'people') peopleSpy(queryKey);
        if (queryKey[1] === 'groups') groupsSpy(queryKey);
      },
    } as Parameters<typeof reconcilePeopleAndGroups>[0];

    await reconcilePeopleAndGroups(fakeClient);
    await reconcileGroups(fakeClient);

    expect(peopleSpy).toHaveBeenCalled();
    expect(groupsSpy).toHaveBeenCalled();
  });

  test('hooks de people y groups respetan el flag enabled sin ejecutar queries en deshabilitado', async () => {
    vi.mocked(fetchPeople).mockResolvedValue({
      content: [{ uid: 'u1', employeeNumber: 'E1', givenName: 'Ana', sn: 'Lopez', email: 'ana@example.com', disabled: false }],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      size: 10,
    });
    vi.mocked(fetchGroups).mockResolvedValue({
      content: [{ name: 'soporte', reserved: false, members: [] }],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      size: 10,
    });

    const wrapperForDisabled = ({ children }: { children: ReactNode }) => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      return createElement(QueryClientProvider, { client: queryClient }, children);
    };

    const DisabledPeopleProbe = () => {
      const result = usePeople({ page: 0, size: 10 }, { enabled: false });
      return createElement('div', { 'data-testid': 'disabled-people' }, result.data?.content?.[0]?.uid ?? 'no-data');
    };

    const DisabledGroupsProbe = () => {
      const result = useGroups({ page: 0, size: 10 }, { enabled: false });
      return createElement('div', { 'data-testid': 'disabled-groups' }, result.data?.content?.[0]?.name ?? 'no-data');
    };

    render(createElement(DisabledPeopleProbe), { wrapper: wrapperForDisabled });
    render(createElement(DisabledGroupsProbe), { wrapper: wrapperForDisabled });

    expect(fetchPeople).not.toHaveBeenCalled();
    expect(fetchGroups).not.toHaveBeenCalled();
    expect(screen.getByTestId('disabled-people')).toHaveTextContent('no-data');
    expect(screen.getByTestId('disabled-groups')).toHaveTextContent('no-data');

    const wrapperForEnabled = ({ children }: { children: ReactNode }) => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      return createElement(QueryClientProvider, { client: queryClient }, children);
    };

    const EnabledPeopleProbe = () => {
      const result = usePeople({ page: 0, size: 10 }, { enabled: true });
      return createElement('div', { 'data-testid': 'enabled-people' }, result.data?.content?.[0]?.uid ?? 'no-data');
    };

    const EnabledGroupsProbe = () => {
      const result = useGroups({ page: 0, size: 10 }, { enabled: true });
      return createElement('div', { 'data-testid': 'enabled-groups' }, result.data?.content?.[0]?.name ?? 'no-data');
    };

    render(createElement(EnabledPeopleProbe), { wrapper: wrapperForEnabled });
    render(createElement(EnabledGroupsProbe), { wrapper: wrapperForEnabled });

    await waitFor(() => expect(fetchPeople).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(fetchGroups).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('enabled-people')).toHaveTextContent('u1');
    expect(screen.getByTestId('enabled-groups')).toHaveTextContent('soporte');
  });
});
