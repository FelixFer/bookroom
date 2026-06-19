const generateId = (label: React.ReactNode): string | undefined =>
  typeof label === 'string'
    ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : undefined

type TextFieldProps = {
  label: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const TextField = ({ label, id, ...props }: TextFieldProps) => {
  const inputId = id ?? generateId(label)
  return (
    <label className="form-label" htmlFor={inputId}>
      {label}
      <input id={inputId} className="form-input" {...props} />
    </label>
  )
}

type SelectFieldProps = {
  label: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export const SelectField = ({ label, children, id, ...props }: SelectFieldProps) => {
  const selectId = id ?? generateId(label)
  return (
    <label className="form-label" htmlFor={selectId}>
      {label}
      <select id={selectId} className="form-input" {...props}>
        {children}
      </select>
    </label>
  )
}

export const FormError = ({ error }: { error: string | null }) =>
  error ? <p className="form-error">{error}</p> : null
