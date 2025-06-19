interface AdminContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminContainer({ children, className = '' }: AdminContainerProps) {
  return (
    <div className={`container mx-auto px-6 py-8 ${className}`}>
      {children}
    </div>
  );
}