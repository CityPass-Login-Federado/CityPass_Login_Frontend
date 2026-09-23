import {
  ChevronDown,
  KeyRound,
  LoaderCircle,
  LogOut,
  UserRound,
} from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  selectIsGeneralAdmin,
  useAuthStore,
} from '../store/useAuthStore';
import { useLogout } from '../hooks/useLogout';

export const UserMenu = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);
  const session = useAuthStore((state) => state.session);
  const isGeneralAdmin = useAuthStore(selectIsGeneralAdmin);
  const logoutMutation = useLogout();

  const username = session?.username ?? 'Admin';
  const roleLabel = isGeneralAdmin
    ? 'Admin General'
    : `Admin · ${session?.module ?? 'Módulo'}`;

  useEffect(() => {
    if (!isOpen) return;

    firstMenuItemRef.current?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const closeMenuAndRestoreFocus = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative ml-auto">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Abrir menú de usuario"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        disabled={logoutMutation.isPending}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          {logoutMutation.isPending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <UserRound className="h-4 w-4" aria-hidden="true" />
          )}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-40 truncate text-sm font-semibold">
            {username}
          </span>
          <span className="block max-w-40 truncate text-xs text-muted-foreground">
            {logoutMutation.isPending ? 'Cerrando sesión…' : roleLabel}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label="Opciones de usuario"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              closeMenuAndRestoreFocus();
            }
          }}
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg"
        >
          <div className="px-4 py-3">
            <p className="truncate text-sm font-semibold">{username}</p>
            <p className="truncate text-xs text-muted-foreground">
              {roleLabel}
            </p>
          </div>
          <div className="border-t p-1.5">
            <button
              ref={firstMenuItemRef}
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                navigate('/reset-password');
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-sm font-medium outline-none transition-colors hover:bg-accent focus:bg-accent"
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              Restablecer contraseña
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                logoutMutation.mutate();
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-sm font-medium text-destructive outline-none transition-colors hover:bg-destructive/10 focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
