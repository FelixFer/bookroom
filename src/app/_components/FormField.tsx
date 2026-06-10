type TextFieldProps = {
  label: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const TextField = ({ label, ...props }: TextFieldProps) => (
  <label className="form-label">
    {label}
    <input className="form-input" {...props} />
  </label>
)

type SelectFieldProps = {
  label: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export const SelectField = ({ label, children, ...props }: SelectFieldProps) => (
  <label className="form-label">
    {label}
    <select className="form-input" {...props}>
      {children}
    </select>
  </label>
)

export const FormError = ({ error }: { error: string | null }) =>
  error ? <p className="form-error">{error}</p> : null
