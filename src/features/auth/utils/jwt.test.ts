import { buildSessionFromToken, isGeneralAdminClaims } from './jwt';

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
  });
});
