import { type ReactNode } from 'react';

import citypassLogo from '@/assets/citypass-logo.png';
import loginIllustration from '@/assets/login_illustration.svg';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[3fr_2fr]">
      <div className="hidden lg:block">
        <img
          src={loginIllustration}
          alt="Ciudad inteligente CityPass+"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-col items-center justify-center bg-background px-8 py-12 lg:px-16">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <img src={citypassLogo} alt="CityPass+" className="h-16 w-auto" />
          </div>
          {children}
        </div>
      </div>
    </main>
  );
};
