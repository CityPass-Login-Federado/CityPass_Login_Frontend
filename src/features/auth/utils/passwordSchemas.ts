import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  uid: z.string().trim().min(1, 'El usuario es obligatorio'),
});

export const createPasswordSchema = (requiresCurrentPassword: boolean) =>
  z
    .object({
      currentPassword: z.string(),
      newPassword: z
        .string()
        .min(1, 'La nueva contraseña es obligatoria')
        .min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
      confirmPassword: z
        .string()
        .min(1, 'La confirmación de contraseña es obligatoria'),
    })
    .superRefine((values, context) => {
      if (requiresCurrentPassword && !values.currentPassword.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['currentPassword'],
          message: 'La contraseña actual es obligatoria',
        });
      }

      if (values.newPassword !== values.confirmPassword) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: 'Las contraseñas no coinciden',
        });
      }
    });

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type PasswordFormValues = z.infer<
  ReturnType<typeof createPasswordSchema>
>;
