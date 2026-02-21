import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost';
  }
>;

export function Button({ variant = 'ghost', className = '', children, ...rest }: ButtonProps) {
  const klass = ['ui-button', variant === 'primary' ? 'ui-button--primary' : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={klass} {...rest}>
      {children}
    </button>
  );
}
