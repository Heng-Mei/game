import type { PropsWithChildren } from 'react';

type ModalProps = PropsWithChildren<{
  open: boolean;
  title: string;
  onClose: () => void;
}>;

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="ui-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ui-modal-head">
          <h2>{title}</h2>
          <button type="button" className="ui-modal-close" onClick={onClose}>
            关闭
          </button>
        </header>
        <div className="ui-modal-body">{children}</div>
      </section>
    </div>
  );
}
