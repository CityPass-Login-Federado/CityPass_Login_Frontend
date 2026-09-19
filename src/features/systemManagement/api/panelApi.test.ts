import { describe, expect, test, vi, beforeEach } from 'vitest';

import { axiosInstance } from '@/lib/axios';
import {
  addUserToGroup,
  createGroup,
  createPerson,
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

    const result = await fetchPeople({ page: 1, size: 1, search: '', group: undefined, disabled: false, module: 'reclamos' });

    expect(getSpy).toHaveBeenCalledWith('/panel/people', {
      params: { page: 1, size: 1, disabled: false, module: 'reclamos' },
    });
    expect(result.totalElements).toBe(2);
    expect(result.content).toHaveLength(1);
    expect(result.currentPage).toBe(1);
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
      givenName: 'Ana',
      sn: 'Lopez',
      username: 'ana',
      email: 'ana@example.com',
      temporaryPassword: 'Password123',
    });

    expect(postSpy).toHaveBeenCalledWith('/panel/people', {
      givenName: 'Ana',
      sn: 'Lopez',
      username: 'ana',
      email: 'ana@example.com',
      temporaryPassword: 'Password123',
    });
    expect(result.uid).toBe('u-1');
  });

  test('updatePerson y setPersonDisabled envían el endpoint correcto', async () => {
    const putSpy = vi.spyOn(axiosInstance, 'put').mockResolvedValue({
      data: { uid: 'u-1', givenName: 'Ana', sn: 'Lopez', email: 'ana@example.com', disabled: true },
    });
    const postSpy = vi.spyOn(axiosInstance, 'post').mockResolvedValue({ data: undefined });

    await updatePerson({ uid: 'u-1', data: { givenName: 'Ana', email: 'ana@example.com' } });
    await setPersonDisabled({ uid: 'u-1', disabled: true });

    expect(putSpy).toHaveBeenCalledWith('/panel/people/u-1', { givenName: 'Ana', email: 'ana@example.com' });
    expect(postSpy).toHaveBeenCalledWith('/panel/people/u-1/disable');
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
    const deleteSpy = vi.spyOn(axiosInstance, 'delete').mockResolvedValue({
      data: { group: { name: 'soporte-n2', members: [], reserved: false }, warnings: [] },
    });

    const groups = await fetchGroups({ page: 0, size: 10, reserved: false, module: 'reclamos' });
    const created = await createGroup({ name: 'soporte-n2' });
    const added = await addUserToGroup({ userId: 'u1', groupName: 'soporte-n2', moduleId: 'reclamos' });
    const removed = await removeUserFromGroup({ userId: 'u1', groupName: 'soporte-n2' });

    expect(getSpy).toHaveBeenCalledWith('/panel/groups', { params: { page: 0, size: 10, reserved: false, module: 'reclamos' } });
    expect(postSpy).toHaveBeenCalledWith('/panel/groups', { name: 'soporte-n2' });
    expect(postSpy).toHaveBeenCalledWith('/panel/groups/soporte-n2/members', { memberUid: 'u1' });
    expect(deleteSpy).toHaveBeenCalledWith('/panel/groups/soporte-n2/members/u1');
    expect(groups.content[0].name).toBe('soporte');
    expect(created.name).toBe('soporte-n2');
    expect(added.group.name).toBe('soporte-n2');
    expect(added.warnings).toEqual([]);
    expect(removed.group.members).toEqual([]);
  });
});
