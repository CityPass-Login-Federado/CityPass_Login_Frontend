import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

export const TablePagination = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  itemLabel,
  onPageChange,
}: TablePaginationProps) => {
  const firstItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const lastItem = Math.min((currentPage + 1) * pageSize, totalElements);
  const visiblePages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => {
      const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
      return start + index;
    },
  );

  return (
    <div className="flex flex-col gap-3 border-t px-1 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        Mostrando {firstItem}–{lastItem} de {totalElements} {itemLabel}
      </p>
      <nav aria-label={`Paginación de ${itemLabel}`} className="flex gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 0}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {visiblePages.map((page) => (
          <Button
            key={page}
            type="button"
            variant={page === currentPage ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => onPageChange(page)}
            aria-label={`Página ${page + 1}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page + 1}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || totalPages === 0}
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
};
