import { AlertCircle, Inbox } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';

export const SectionLoading = () => (
  <div aria-label="Cargando" className="space-y-2 py-3">
    {Array.from({ length: 5 }, (_, index) => (
      <Skeleton key={index} className="h-11 w-full" />
    ))}
  </div>
);

export const SectionError = ({ message }: { message: string }) => (
  <div
    role="alert"
    className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center"
  >
    <AlertCircle className="h-6 w-6 text-destructive" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);

export const SectionEmpty = ({ message }: { message: string }) => (
  <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center text-muted-foreground">
    <Inbox className="h-6 w-6" />
    <p className="text-sm">{message}</p>
  </div>
);
