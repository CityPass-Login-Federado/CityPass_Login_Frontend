import { z } from 'zod';

const usernameSchema = z
  .string()
  .min(3, 'Debe tener al menos 3 caracteres')
  .max(32, 'No puede superar los 32 caracteres')
  .regex(
    /^[a-z0-9][a-z0-9._-]{2,31}$/,
    'Use minúsculas, números, punto, guion o guion bajo',
  );

export const personFormSchema = z.object({
  givenName: z.string().trim().min(1, 'El nombre es obligatorio'),
  sn: z.string().trim().min(1, 'El apellido es obligatorio'),
  username: usernameSchema,
  email: z.string().trim().email('Ingrese un email válido'),
  temporaryPassword: z
    .string()
    .refine(
      (value) => value.length === 0 || value.length >= 8,
      'Debe tener al menos 8 caracteres',
    ),
});

export type PersonFormValues = z.infer<typeof personFormSchema>;

export const groupFormSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(64, 'No puede superar los 64 caracteres')
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      'Use minúsculas, números y guiones simples',
    ),
});

export type GroupFormValues = z.infer<typeof groupFormSchema>;

export const assignmentFormSchema = z.object({
  moduleId: z.string().optional(),
  userId: z.string().min(1, 'Seleccione un usuario'),
  groupName: z.string().min(1, 'Seleccione un grupo'),
});

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;
