import { buildSessionFromToken, decodeJwtClaims, isGeneralAdminClaims } from './jwt';

const encode = (value: object) =>
  window.btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const createToken = (payload: object) => `${encode({ alg: 'none' })}.${encode(payload)}.`;

describe('JWT session helpers', () => {
  test('reconoce al delegado del grupo 2 como administrador de módulo', () => {
    const token = createToken({
      sub: 'U000001',
      exp: Math.floor(Date.now() / 1000) + 900,
      preferred_username: 'delegado-rec',
      module: 'Reclamos',
      groups: ['delegados'],
    });

    expect(buildSessionFromToken(token)).toMatchObject({
      username: 'delegado-rec',
      module: 'reclamos',
      adminScope: 'MODULE',
    });
  });

  test('requiere un claim o rol explícito para Admin General', () => {
    expect(
      isGeneralAdminClaims({
        sub: 'U000099',
        exp: Math.floor(Date.now() / 1000) + 900,
        groups: ['admin-general'],
      }),
    ).toBe(true);

    expect(
      isGeneralAdminClaims({
        sub: 'U000100',
        exp: Math.floor(Date.now() / 1000) + 900,
        role: 'role_admin_general',
      }),
    ).toBe(true);

    expect(
      isGeneralAdminClaims({
        sub: 'U000101',
        exp: Math.floor(Date.now() / 1000) + 900,
        roles: ['analista'],
      }),
    ).toBe(false);
  });

  test('decodifica y rechaza tokens malformed o expirados', () => {
    expect(decodeJwtClaims('no-dot-token')).toBeNull();
    expect(buildSessionFromToken(createToken({ sub: 'U111', exp: 1 }))).toBeNull();

    const valid = createToken({
      sub: 'U222',
      exp: Math.floor(Date.now() / 1000) + 600,
      preferred_username: 'raul',
      groups: ['delegados'],
      role: 'role_admin_general',
    });

    expect(buildSessionFromToken(valid)).toMatchObject({
      userId: 'U222',
      username: 'raul',
      adminScope: 'GENERAL',
      roles: ['role_admin_general'],
    });
  });
});
