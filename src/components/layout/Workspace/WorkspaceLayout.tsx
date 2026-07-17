interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  return (
    <div
      className="
        min-h-screen
        w-full
        bg-slate-100
        overflow-hidden
        grid
        grid-cols-1
        md:grid-cols-[clamp(200px,25vw,260px)_1fr]
      "
    >
      {children}
    </div>
  );
}