import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useForgotPassword } from '../hooks/usePasswordMutations';
import { getApiErrorMessage } from '../utils/apiErrors';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../utils/passwordSchemas';
import { AuthLayout } from '../layout/AuthLayout';

export const ForgotPasswordPage = () => {
  const mutation = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { uid: '' },
  });

  if (mutation.isSuccess) {
    return (
      <AuthLayout>
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Revisá tu correo
            </h1>
            <p role="status" className="text-sm leading-6 text-muted-foreground">
              Si el usuario existe y tiene un correo asociado, recibirá un
              enlace para restablecer la contraseña. Revisá también la carpeta
              de correo no deseado.
            </p>
          </div>
          <Button asChild className="w-full" size="lg">
            <Link to="/login">Volver al inicio de sesión</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  const apiErrorMessage = mutation.isError
    ? getApiErrorMessage(
        mutation.error,
        'No pudimos procesar la solicitud. Intentá nuevamente.',
      )
    : null;

  const onSubmit = (values: ForgotPasswordFormValues) => {
    mutation.mutate({ uid: values.uid.trim() });
  };

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresá tu usuario para recibir un mail con instrucciones.
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
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="uid">Usuario</Label>
            <Input
              id="uid"
              type="text"
              placeholder="jperez"
              autoComplete="username"
              autoFocus
              disabled={mutation.isPending}
              aria-invalid={!!errors.uid}
              aria-describedby={errors.uid ? 'uid-error' : undefined}
              {...register('uid')}
            />
            {errors.uid && (
              <p id="uid-error" className="text-xs text-destructive">
                {errors.uid.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Enviando…' : 'Enviar email'}
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
