export default function FormField({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  placeholder,
  autoComplete,
  helperText,
  inputMode,
  required = false,
}) {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <div className="min-w-0">
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={errorId}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 ${error ? "border-rose-400" : "border-slate-200"}`}
      />
      {helperText && !error ? (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
