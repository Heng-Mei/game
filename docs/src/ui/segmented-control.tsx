import type { ReactNode } from 'react';

type SegmentedOption<T extends string> = {
  label: ReactNode;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  options: Array<SegmentedOption<T>>;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange
}: SegmentedControlProps<T>) {
  return (
    <div className="ui-segmented" role="radiogroup">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={option.value === value ? 'is-active' : ''}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
