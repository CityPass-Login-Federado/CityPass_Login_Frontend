import { useId, useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

export interface CheckboxMultiSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface CheckboxMultiSelectProps {
  label: string;
  options: CheckboxMultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  searchPlaceholder: string;
  emptyMessage: string;
  disabled?: boolean;
  error?: string;
}

const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const CheckboxMultiSelect = ({
  label,
  options,
  selectedValues,
  onChange,
  searchPlaceholder,
  emptyMessage,
  disabled = false,
  error,
}: CheckboxMultiSelectProps) => {
  const generatedId = useId().replace(/:/g, '');
  const [search, setSearch] = useState('');
  const selectedSet = useMemo(
    () => new Set(selectedValues),
    [selectedValues],
  );
  const filteredOptions = useMemo(() => {
    const term = normalizeSearchText(search.trim());
    if (!term) return options;

    return options.filter((option) =>
      normalizeSearchText(
        `${option.label} ${option.description ?? ''}`,
      ).includes(term),
    );
  }, [options, search]);
  const allVisibleSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((option) => selectedSet.has(option.value));
  const errorId = `${generatedId}-error`;

  const toggleOption = (value: string, checked: boolean) => {
    if (checked) {
      if (!selectedSet.has(value)) onChange([...selectedValues, value]);
      return;
    }

    onChange(selectedValues.filter((selected) => selected !== value));
  };

  const toggleVisibleOptions = () => {
    const visibleValues = new Set(
      filteredOptions.map((option) => option.value),
    );
    if (allVisibleSelected) {
      onChange(
        selectedValues.filter((selected) => !visibleValues.has(selected)),
      );
      return;
    }

    onChange([
      ...selectedValues,
      ...filteredOptions
        .map((option) => option.value)
        .filter((value) => !selectedSet.has(value)),
    ]);
  };

  return (
    <fieldset
      className="space-y-2"
      aria-invalid={Boolean(error)}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="sr-only">{label}</legend>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium" aria-hidden="true">
          {label}{' '}
          <span className="font-normal text-muted-foreground">
            ({selectedValues.length})
          </span>
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={toggleVisibleOptions}
            disabled={disabled || filteredOptions.length === 0}
          >
            {allVisibleSelected ? 'Deseleccionar visibles' : 'Seleccionar visibles'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onChange([])}
            disabled={disabled || selectedValues.length === 0}
          >
            Limpiar
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          disabled={disabled}
          className="h-9 pl-9"
        />
      </div>

      <div
        role="group"
        aria-label={label}
        className="max-h-52 overflow-y-auto rounded-md border bg-background p-1"
      >
        {filteredOptions.length === 0 ? (
          <p className="px-3 py-5 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          filteredOptions.map((option, index) => {
            const optionId = `${generatedId}-${index}`;
            return (
              <label
                key={option.value}
                htmlFor={optionId}
                className="flex cursor-pointer items-start gap-3 rounded-sm px-3 py-2 text-sm hover:bg-muted/60 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
              >
                <Checkbox
                  id={optionId}
                  checked={selectedSet.has(option.value)}
                  onCheckedChange={(checked) =>
                    toggleOption(option.value, checked === true)
                  }
                  disabled={disabled}
                  className="mt-0.5"
                />
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </span>
              </label>
            );
          })
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
};
