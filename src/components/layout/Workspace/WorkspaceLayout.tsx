import { memo } from "react";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

const WorkspaceLayout = memo(function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <div className="min-h-screen w-full mx-auto bg-slate-100 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
        {children}
      </div>
    </div>
  );
});

export default WorkspaceLayout;