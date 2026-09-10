import { type PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import {
  addUserToGroup,
  createGroup,
  createPerson,
  fetchGroups,
  fetchPeople,
  removeUserFromGroup,
  setPersonDisabled,
  updatePerson,
} from '../api/panelApi';
import { type PanelGroup, type PanelPerson } from '../types';
import { panelQueryKeys } from '../utils/queryKeys';
import {
  useAssignUserToGroup,
  useCreateGroup,
  useGroups,
  useRemoveUserFromGroup,
} from './useGroups';
import {
  useCreatePerson,
  usePeople,
  useSetPersonStatus,
  useUpdatePerson,
} from './usePeople';

vi.mock('../api/panelApi', () => ({
  addUserToGroup: vi.fn(),
  createGroup: vi.fn(),
  createPerson: vi.fn(),
  fetchGroups: vi.fn(),
  fetchPeople: vi.fn(),
  removeUserFromGroup: vi.fn(),
  setPersonDisabled: vi.fn(),
  updatePerson: vi.fn(),
}));

const peopleListKey = panelQueryKeys.peopleList({ page: 0, size: 10 });
const groupsListKey = panelQueryKeys.groupsList({ page: 0, size: 10 });

const person: PanelPerson = {
  employeeNumber: 'U000001',
  uid: 'jperez',
  givenName: 'Juan',
  sn: 'Pérez',
  email: 'jperez@citypass.local',
  disabled: false,
};

const group: PanelGroup = {
  name: 'soporte-n2',
  members: ['jperez'],
  reserved: false,
};

const createQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  queryClient.setQueryData(peopleListKey, { content: [person] });
  queryClient.setQueryData(groupsListKey, { content: [group] });

  return queryClient;
};

const createWrapper = (queryClient: QueryClient) =>
  function QueryWrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

const expectPeopleAndGroupsInvalidated = (queryClient: QueryClient) => {
  expect(queryClient.getQueryState(peopleListKey)?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(groupsListKey)?.isInvalidated).toBe(true);
};

describe('reconciliación de cachés del panel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('actualizar una persona invalida personas y grupos aunque el backend responda con error', async () => {
    const backendError = new Error('Cambio parcial en LDAP');
    vi.mocked(updatePerson).mockRejectedValueOnce(backendError);
    const queryClient = createQueryClient();
    const { result } = renderHook(() => useUpdatePerson(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          uid: 'jperez',
          data: { newUsername: 'juan.perez' },
        }),
      ).rejects.toBe(backendError);
    });

    expectPeopleAndGroupsInvalidated(queryClient);
    queryClient.clear();
  });

  test('actualizar una persona también reconcilia ambas cachés al finalizar con éxito', async () => {
    vi.mocked(updatePerson).mockResolvedValueOnce(person);
    const queryClient = createQueryClient();
    const { result } = renderHook(() => useUpdatePerson(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        uid: 'jperez',
        data: { givenName: 'Juan Carlos' },
      });
    });

    expectPeopleAndGroupsInvalidated(queryClient);
    queryClient.clear();
  });

  test('crear una persona reconcilia las cachés relacionadas', async () => {
    vi.mocked(createPerson).mockResolvedValueOnce(person);
    const queryClient = createQueryClient();
    const { result } = renderHook(() => useCreatePerson(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        givenName: 'Juan',
        sn: 'Pérez',
        username: 'jperez',
        email: 'jperez@citypass.local',
        temporaryPassword: 'Temporal123!',
      });
    });

    expectPeopleAndGroupsInvalidated(queryClient);
    queryClient.clear();
  });

  test('cambiar el estado de una persona reconcilia ambas cachés ante un error', async () => {
    const backendError = new Error('No se pudo bloquear la cuenta');
    vi.mocked(setPersonDisabled).mockRejectedValueOnce(backendError);
    const queryClient = createQueryClient();
    const { result } = renderHook(() => useSetPersonStatus(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ uid: 'jperez', disabled: true }),
      ).rejects.toBe(backendError);
    });

    expectPeopleAndGroupsInvalidated(queryClient);
    queryClient.clear();
  });

  test('asignar una membresía reconcilia personas y grupos aun si la API falla', async () => {
    const backendError = new Error('Membresía aplicada parcialmente');
    vi.mocked(addUserToGroup).mockRejectedValueOnce(backendError);
    const queryClient = createQueryClient();
    const { result } = renderHook(() => useAssignUserToGroup(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          userId: 'jperez',
          groupName: 'soporte-n2',
        }),
      ).rejects.toBe(backendError);
    });

    expectPeopleAndGroupsInvalidated(queryClient);
    queryClient.clear();
  });

  test('quitar una membresía reconcilia personas y grupos al finalizar con éxito', async () => {
    vi.mocked(removeUserFromGroup).mockResolvedValueOnce({
      group: { ...group, members: [] },
      warnings: [],
    });
    const queryClient = createQueryClient();
    const { result } = renderHook(() => useRemoveUserFromGroup(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        userId: 'jperez',
        groupName: 'soporte-n2',
      });
    });

    expectPeopleAndGroupsInvalidated(queryClient);
    queryClient.clear();
  });

  test('crear un grupo reconcilia grupos ante un error sin invalidar personas', async () => {
    const backendError = new Error('Grupo creado pero la respuesta falló');
    vi.mocked(createGroup).mockRejectedValueOnce(backendError);
    const queryClient = createQueryClient();
    const { result } = renderHook(() => useCreateGroup(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ name: 'auditoria' }),
      ).rejects.toBe(backendError);
    });

    expect(queryClient.getQueryState(peopleListKey)?.isInvalidated).toBe(false);
    expect(queryClient.getQueryState(groupsListKey)?.isInvalidated).toBe(true);
    queryClient.clear();
  });

  test('los listados no consultan la API cuando se deshabilitan explícitamente', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderHook(
      () => {
        usePeople({ page: 0, size: 10 }, { enabled: false });
        useGroups({ page: 0, size: 10 }, { enabled: false });
      },
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(fetchPeople).not.toHaveBeenCalled();
    expect(fetchGroups).not.toHaveBeenCalled();
    expect(queryClient.getQueryState(peopleListKey)?.fetchStatus).toBe('idle');
    expect(queryClient.getQueryState(groupsListKey)?.fetchStatus).toBe('idle');
    queryClient.clear();
  });
});
