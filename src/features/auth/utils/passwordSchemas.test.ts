import { describe, expect, test } from 'vitest';

import {
  createPasswordSchema,
  forgotPasswordSchema,
} from './passwordSchemas';

describe('password schemas', () => {
  test('exige un usuario para solicitar el recupero', () => {
    expect(forgotPasswordSchema.safeParse({ uid: '   ' }).success).toBe(false);
    expect(forgotPasswordSchema.parse({ uid: ' jperez ' })).toEqual({
      uid: 'jperez',
    });
  });

  test('el recupero solo exige ocho caracteres y confirmación coincidente', () => {
    const schema = createPasswordSchema(false);

    expect(
      schema.safeParse({
        currentPassword: '',
        newPassword: 'abcdefgh',
        confirmPassword: 'abcdefgh',
      }).success,
    ).toBe(true);
    expect(
      schema.safeParse({
        currentPassword: '',
        newPassword: 'abcdefg',
        confirmPassword: 'abcdefg',
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        currentPassword: '',
        newPassword: 'abcdefgh',
        confirmPassword: 'diferente',
      }).success,
    ).toBe(false);
  });

  test('el cambio autenticado también exige la contraseña actual', () => {
    const schema = createPasswordSchema(true);

    expect(
      schema.safeParse({
        currentPassword: '',
        newPassword: 'abcdefgh',
        confirmPassword: 'abcdefgh',
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        currentPassword: 'actual',
        newPassword: 'abcdefgh',
        confirmPassword: 'abcdefgh',
      }).success,
    ).toBe(true);
  });
});
