import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'El usuario es obligatorio')
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(50, 'El usuario no puede superar los 50 caracteres')
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      'Solo se permiten letras, números, puntos, guiones y guiones bajos',
    ),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede superar los 128 caracteres')
    .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  rememberMe: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
