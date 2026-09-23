import { describe, expect, test } from 'vitest';

import { assignmentFormSchema } from './systemManagementSchemas';

describe('assignmentFormSchema', () => {
  test('requiere al menos un usuario y un grupo', () => {
    const result = assignmentFormSchema.safeParse({
      memberUids: [],
      groupNames: [],
    });

    expect(result.success).toBe(false);
  });

  test('acepta hasta 1000 combinaciones', () => {
    const result = assignmentFormSchema.safeParse({
      memberUids: Array.from({ length: 500 }, (_, index) => `usuario-${index}`),
      groupNames: ['grupo-a', 'grupo-b'],
    });

    expect(result.success).toBe(true);
  });

  test('rechaza más de 1000 combinaciones', () => {
    const result = assignmentFormSchema.safeParse({
      memberUids: Array.from({ length: 501 }, (_, index) => `usuario-${index}`),
      groupNames: ['grupo-a', 'grupo-b'],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('1000');
    }
  });
});
