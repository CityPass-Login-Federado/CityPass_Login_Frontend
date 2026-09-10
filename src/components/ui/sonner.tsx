import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ toastOptions, ...props }: ToasterProps) => (
  <Sonner
    className="toaster group"
    toastOptions={{
      ...toastOptions,
      classNames: {
        toast:
          'group toast group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:shadow-lg',
        description: 'group-[.toast]:text-muted-foreground',
        actionButton:
          'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
        cancelButton:
          'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        ...toastOptions?.classNames,
      },
    }}
    {...props}
  />
);

export { Toaster };
