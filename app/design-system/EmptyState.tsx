type Icon = React.ComponentType<{ className?: string }>;

type Props = {
  icon: Icon;
  label?: string;
  description?: string;
  children?: React.ReactNode;
};

export function EmptyState({ label, description, children, icon: Icon }: Props) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <Icon className="mx-auto h-12 w-12 text-gray-400" aria-hidden={true} />
      {label && <h3 className="mt-2 text-sm font-medium text-gray-900">{label}</h3>}
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
