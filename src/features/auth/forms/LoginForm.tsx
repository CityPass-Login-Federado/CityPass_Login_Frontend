import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type AxiosError } from 'axios';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '../hooks/useLogin';
import { loginSchema, type LoginFormValues } from '../utils/loginSchema';
import { type ApiError, type LoginRequest } from '../types';
import { AuthLayout } from '../layout/AuthLayout';

export const LoginForm = () => {
  const { mutate, isPending, isError, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const handleFormSubmit = (data: LoginFormValues) => {
    const loginRequest: LoginRequest = {
      username: data.username,
      password: data.password,
      clientId: import.meta.env.VITE_CLIENT_ID,
    };
    mutate(loginRequest);
  };

  const apiErrorMessage = isError
    ? (error as AxiosError<ApiError>)?.response?.data?.message ??
      'Error al iniciar sesión. Intente nuevamente.'
    : null;

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Ingrese a su cuenta
          </h1>
          <p className="text-sm text-muted-foreground">
            Plataforma de Servicios Urbanos Inteligentes
          </p>
        </div>

        {apiErrorMessage && (
          <div
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-center text-sm text-destructive"
          >
            {apiErrorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-5"
          noValidate
        >
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="jperez"
                autoComplete="username"
                disabled={isPending}
                aria-invalid={!!errors.username}
                aria-describedby={
                  errors.username ? 'username-error' : undefined
                }
                {...register('username')}
              />
              {errors.username && (
                <p id="username-error" className="text-xs text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isPending}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
                {...register('password')}
              />
              {errors.password && (
                <p id="password-error" className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isPending}
            >
              {isPending ? 'Ingresando...' : 'Ingresar'}
            </Button>
        </form>
      </div>
    </AuthLayout>
  );
};
