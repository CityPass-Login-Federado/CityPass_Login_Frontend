import { describe, expect, test, vi, beforeEach } from 'vitest';

import { axiosInstance } from '@/lib/axios';
import {
  addUserToGroup,
  addUsersToGroups,
  createGroup,
  createPerson,
  deleteGroup,
  fetchGroups,
  fetchPeople,
  removeUserFromGroup,
  setPersonDisabled,
  updatePerson,
} from './panelApi';

describe('panelApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('fetchPeople elimina parámetros vacíos y normaliza la respuesta', async () => {
    const getSpy = vi.spyOn(axiosInstance, 'get').mockResolvedValue({
      data: [
        { employeeNumber: 'E1', uid: 'u1', givenName: 'Ana', sn: 'Lopez', email: 'ana@example.com', disabled: false },
        { employeeNumber: 'E2', uid: 'u2', givenName: 'Luis', sn: 'Pérez', email: 'luis@example.com', disabled: true },
      ],
    });

    const result = await fetchPeople({
      page: 1,
      size: 1,
      search: '',
      group: undefined,
      disabled: false,
      module: 'reclamos',
      isGeneralAdmin: true,
    });

    expect(getSpy).toHaveBeenCalledWith('/panel/people', {
      params: { page: 1, size: 1, disabled: false, module: 'reclamos' },
    });
    expect(result.totalElements).toBe(2);
    expect(result.content).toHaveLength(1);
    expect(result.currentPage).toBe(1);
    expect(result.content[0].module).toBe('reclamos');
  });

  test('fetchPeople usa un tamaño seguro cuando el size llega a 0', async () => {
    vi.spyOn(axiosInstance, 'get').mockResolvedValue({
      data: [{ employeeNumber: 'E1', uid: 'u1', givenName: 'Ana', sn: 'Lopez', email: 'ana@example.com', disabled: false }],
    });

    const result = await fetchPeople({ page: 0, size: 0 });

    expect(result.size).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  test('createPerson hace post con el payload correcto', async () => {
    const postSpy = vi.spyOn(axiosInstance, 'post').mockResolvedValue({
      data: { uid: 'u-1', givenName: 'Ana', sn: 'Lopez', email: 'ana@example.com' },
    });

    const result = await createPerson({
      module: 'reclamos',
      data: {
        givenName: 'Ana',
        sn: 'Lopez',
        username: 'ana',
        email: 'ana@example.com',
        temporaryPassword: 'Password123',
      },
    });

    expect(postSpy).toHaveBeenCalledWith(
      '/panel/people',
      {
        givenName: 'Ana',
        sn: 'Lopez',
        username: 'ana',
        email: 'ana@example.com',
        temporaryPassword: 'Password123',
      },
      { params: { module: 'reclamos' } },
    );
    expect(result.uid).toBe('u-1');
  });

  test('updatePerson y setPersonDisabled envían el endpoint correcto', async () => {
    const putSpy = vi.spyOn(axiosInstance, 'put').mockResolvedValue({
      data: { uid: 'u-1', givenName: 'Ana', sn: 'Lopez', email: 'ana@example.com', disabled: true },
    });
    const postSpy = vi.spyOn(axiosInstance, 'post').mockResolvedValue({ data: undefined });

    await updatePerson({ uid: 'u-1', module: 'movilidad', data: { givenName: 'Ana', email: 'ana@example.com' } });
    await setPersonDisabled({ uid: 'u-1', disabled: true, module: 'movilidad' });

    expect(putSpy).toHaveBeenCalledWith(
      '/panel/people/u-1',
      { givenName: 'Ana', email: 'ana@example.com' },
      { params: { module: 'movilidad' } },
    );
    expect(postSpy).toHaveBeenCalledWith(
      '/panel/people/u-1/disable',
      undefined,
      { params: { module: 'movilidad' } },
    );
  });

  test('fetchGroups, createGroup, addUserToGroup, removeUserFromGroup envían las rutas esperadas', async () => {
    const getSpy = vi.spyOn(axiosInstance, 'get').mockResolvedValue({
      data: [{ name: 'soporte', members: ['u1'], reserved: false }],
    });
    const postSpy = vi
      .spyOn(axiosInstance, 'post')
      .mockResolvedValueOnce({
        data: { name: 'soporte-n2', members: [], reserved: false },
      })
      .mockResolvedValueOnce({
        data: { group: { name: 'soporte-n2', members: ['u1'], reserved: false }, warnings: [] },
      });
    const deleteSpy = vi
      .spyOn(axiosInstance, 'delete')
      .mockResolvedValueOnce({ data: undefined })
      .mockResolvedValueOnce({
        data: { group: { name: 'soporte-n2', members: [], reserved: false }, warnings: [] },
      });

    const groups = await fetchGroups({
      page: 0,
      size: 10,
      reserved: false,
      module: 'reclamos',
      isGeneralAdmin: true,
    });
    const created = await createGroup({ data: { name: 'soporte-n2' }, module: 'reclamos' });
    await deleteGroup({ groupName: 'soporte-n2', module: 'reclamos' });
    const added = await addUserToGroup({ userId: 'u1', groupName: 'soporte-n2', module: 'reclamos' });
    const removed = await removeUserFromGroup({ userId: 'u1', groupName: 'soporte-n2', module: 'reclamos' });

    expect(getSpy).toHaveBeenCalledWith('/panel/groups', { params: { page: 0, size: 10, reserved: false, module: 'reclamos' } });
    expect(postSpy).toHaveBeenCalledWith('/panel/groups', { name: 'soporte-n2' }, { params: { module: 'reclamos' } });
    expect(postSpy).toHaveBeenCalledWith('/panel/groups/soporte-n2/members', { memberUid: 'u1' }, { params: { module: 'reclamos' } });
    expect(deleteSpy).toHaveBeenCalledWith('/panel/groups/soporte-n2', { params: { module: 'reclamos' } });
    expect(deleteSpy).toHaveBeenCalledWith('/panel/groups/soporte-n2/members/u1', { params: { module: 'reclamos' } });
    expect(groups.content[0].name).toBe('soporte');
    expect(groups.content[0].module).toBe('reclamos');
    expect(created.name).toBe('soporte-n2');
    expect(added.group.name).toBe('soporte-n2');
    expect(added.warnings).toEqual([]);
    expect(removed.group.members).toEqual([]);
  });

  test('addUsersToGroups envía el lote al endpoint masivo', async () => {
    const response = {
      status: 'SUCCESS' as const,
      requested: 4,
      assigned: 3,
      skipped: 1,
      failed: 0,
      results: [],
      warnings: [],
    };
    const postSpy = vi
      .spyOn(axiosInstance, 'post')
      .mockResolvedValue({ data: response });

    const result = await addUsersToGroups({
      memberUids: ['u1', 'u2'],
      groupNames: ['soporte', 'auditoria'],
      module: 'reclamos',
    });

    expect(postSpy).toHaveBeenCalledWith(
      '/panel/group-memberships/bulk',
      {
        memberUids: ['u1', 'u2'],
        groupNames: ['soporte', 'auditoria'],
      },
      { params: { module: 'reclamos' } },
    );
    expect(result).toEqual(response);
  });

  test('fetchPeople usa el listado global paginado y envía los filtros al servidor', async () => {
    const getSpy = vi.spyOn(axiosInstance, 'get').mockResolvedValue({
      data: {
        content: [
          { employeeNumber: 'E1', uid: 'ana', givenName: 'Ana', sn: 'López', email: 'ana@example.com', disabled: false, module: 'reclamos' },
        ],
        totalElements: 1,
        totalPages: 1,
        currentPage: 0,
        size: 10,
      },
    });

    const result = await fetchPeople({
      page: 0,
      size: 10,
      search: 'ana',
      group: 'soporte',
      disabled: false,
      isGeneralAdmin: true,
    });

    expect(getSpy).toHaveBeenCalledWith('/panel/admin/people', {
      params: {
        page: 0,
        size: 10,
        search: 'ana',
        group: 'soporte',
        disabled: false,
      },
    });
    expect(result.content).toEqual([
      expect.objectContaining({ uid: 'ana', module: 'reclamos' }),
    ]);
    expect(result.totalElements).toBe(1);
  });

  test('fetchGroups usa el listado global paginado en una única solicitud', async () => {
    const getSpy = vi.spyOn(axiosInstance, 'get').mockResolvedValue({
      data: {
        content: [
          {
            name: 'soporte',
            members: [],
            reserved: false,
            module: 'reclamos',
          },
        ],
        totalElements: 1,
        totalPages: 1,
        currentPage: 0,
        size: 20,
      },
    });

    const result = await fetchGroups({
      page: 0,
      size: 20,
      search: 'sop',
      reserved: false,
      isGeneralAdmin: true,
    });

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith('/panel/admin/groups', {
      params: { page: 0, size: 20, search: 'sop', reserved: false },
    });
    expect(result.content).toEqual([
      expect.objectContaining({
        name: 'soporte',
        module: 'reclamos',
      }),
    ]);
  });
});
