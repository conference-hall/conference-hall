type Props = {
  label: string;
  error?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ id, label, children, className, error, ...rest }: Props) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={id}
        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        {...rest}
      >
        <option></option>
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600" id="email-error">
          {error}
        </p>
      )}
    </div>
  );
}
