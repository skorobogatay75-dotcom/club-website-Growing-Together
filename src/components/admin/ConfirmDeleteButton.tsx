"use client";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  confirmMessage?: string;
  hiddenFields?: Record<string, string>;
};

export function ConfirmDeleteButton({
  action,
  id,
  label = "Удалить",
  confirmMessage = "Удалить запись безвозвратно?",
  hiddenFields,
}: Props) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      <button type="submit" className="btn-secondary text-accent">
        {label}
      </button>
    </form>
  );
}
