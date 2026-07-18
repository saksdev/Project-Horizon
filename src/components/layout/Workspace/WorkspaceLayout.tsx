import { memo } from "react";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

const WorkspaceLayout = memo(function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <div className="min-h-screen w-full max-w-[1440px] mx-auto bg-slate-100 shadow-2xl border-x border-slate-800/20 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
        {children}
      </div>
    </div>
  );
});

export default WorkspaceLayout;