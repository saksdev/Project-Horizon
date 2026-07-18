import { memo } from "react";
import { NavLink } from "react-router-dom";
import { sidebarItems } from "./SidebarData";

interface SidebarProps {
  isOpen: boolean;
  closeDrawer: () => void;
}

const Sidebar = memo(function Sidebar({ isOpen, closeDrawer }: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={closeDrawer}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-[260px] h-screen bg-white border-r border-slate-200
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        md:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg">H</span>
              Horizon
            </h1>
            <p className="mt-1 text-xs text-slate-500 font-medium tracking-wide uppercase">Admin Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1.5">
            {sidebarItems.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.id}
                  to={link.path}
                  onClick={closeDrawer}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{link.title}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
});

export default Sidebar;