export function FormField({ id, label, type = "text", value, onChange, wrapperClassName = "", ...props }) {
  return (
    <div className={wrapperClassName}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        {...props}
      />
    </div>
  );
}
