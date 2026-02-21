import type { PropsWithChildren } from 'react';

type DrawerProps = PropsWithChildren<{
  open: boolean;
  title: string;
  onClose: () => void;
}>;

export function Drawer({ open, title, onClose, children }: DrawerProps) {
  return (
    <section className={['ui-drawer', open ? 'ui-drawer--open' : ''].filter(Boolean).join(' ')}>
      <header className="ui-drawer-head">
        <h3>{title}</h3>
        <button type="button" onClick={onClose}>
          收起
        </button>
      </header>
      <div className="ui-drawer-body">{children}</div>
    </section>
  );
}
