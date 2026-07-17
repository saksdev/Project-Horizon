
interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <div className="grid grid-cols-[260px_1fr] min-h-screen w-full bg-slate-100 overflow-hidden">
      {children}
    </div>
  );
}