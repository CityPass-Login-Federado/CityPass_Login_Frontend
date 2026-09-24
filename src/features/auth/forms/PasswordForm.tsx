import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  useChangePassword,
  useResetPassword,
} from '../hooks/usePasswordMutations';
import { getApiErrorMessage } from '../utils/apiErrors';
import {
  createPasswordSchema,
  type PasswordFormValues,
} from '../utils/passwordSchemas';
import { AuthLayout } from '../layout/AuthLayout';

interface PasswordFormProps {
  mode: 'recovery' | 'change';
  token?: string;
}

export const PasswordForm = ({ mode, token }: PasswordFormProps) => {
  const requiresCurrentPassword = mode === 'change';
  const schema = useMemo(
    () => createPasswordSchema(requiresCurrentPassword),
    [requiresCurrentPassword],
  );
  const resetMutation = useResetPassword();
  const changeMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const activeMutation =
    mode === 'recovery' ? resetMutation : changeMutation;
  const newPassword = watch('newPassword');
  const meetsMinimumLength = newPassword.length >= 8;

  const onSubmit = (values: PasswordFormValues) => {
    if (mode === 'recovery') {
      if (!token) return;
      resetMutation.mutate({ token, newPassword: values.newPassword });
      return;
    }

    changeMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  const apiErrorMessage = activeMutation.isError
    ? getApiErrorMessage(
        activeMutation.error,
        mode === 'recovery'
          ? 'No pudimos restablecer la contraseña. El enlace puede ser inválido o haber expirado.'
          : 'No pudimos cambiar la contraseña. Revisá la contraseña actual e intentá nuevamente.',
      )
    : null;

  const isInvalidRecoveryLink =
    mode === 'recovery' && activeMutation.error?.response?.status === 422;

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {mode === 'recovery'
              ? 'Nueva contraseña'
              : 'Restablecer contraseña'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'recovery'
              ? 'Creá una contraseña segura para tu cuenta.'
              : 'Confirmá tu contraseña actual y elegí una nueva.'}
          </p>
        </div>

        {apiErrorMessage && (
          <div
            role="alert"
            className="space-y-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-center text-sm text-destructive"
          >
            <p>{apiErrorMessage}</p>
            {isInvalidRecoveryLink && (
              <Link
                to="/forgot-password"
                className="inline-block font-semibold underline underline-offset-4"
              >
                Solicitar un nuevo enlace
              </Link>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          {requiresCurrentPassword && (
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                autoFocus
                disabled={activeMutation.isPending}
                aria-invalid={!!errors.currentPassword}
                aria-describedby={
                  errors.currentPassword ? 'current-password-error' : undefined
                }
                {...register('currentPassword')}
              />
              {errors.currentPassword && (
                <p
                  id="current-password-error"
                  className="text-xs text-destructive"
                >
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              autoFocus={!requiresCurrentPassword}
              disabled={activeMutation.isPending}
              aria-invalid={!!errors.newPassword}
              aria-describedby={
                errors.newPassword
                  ? 'new-password-error password-requirement'
                  : 'password-requirement'
              }
              {...register('newPassword')}
            />
            {errors.newPassword && (
              <p id="new-password-error" className="text-xs text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              disabled={activeMutation.isPending}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? 'confirm-password-error' : undefined
              }
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p
                id="confirm-password-error"
                className="text-xs text-destructive"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div
            id="password-requirement"
            className="rounded-md border bg-muted/40 p-3"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Requisito de seguridad
            </p>
            <p
              className={`flex items-center gap-2 text-sm ${
                meetsMinimumLength ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                  meetsMinimumLength
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/50'
                }`}
              >
                {meetsMinimumLength && (
                  <Check className="h-3 w-3" aria-hidden="true" />
                )}
              </span>
              Mínimo 8 caracteres
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={activeMutation.isPending}
          >
            {activeMutation.isPending
              ? 'Restableciendo…'
              : 'Restablecer contraseña'}
          </Button>

          <div className="text-center">
            <Link
              to={mode === 'change' ? '/panel' : '/login'}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {mode === 'change'
                ? 'Volver al panel'
                : 'Volver al inicio de sesión'}
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
