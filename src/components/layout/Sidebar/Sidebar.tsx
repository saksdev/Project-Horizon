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
        w-64 h-screen bg-white border-r border-slate-200
        transform transition-transform duration-300 ease-in-out
        md:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-6 py-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">Horizon</h1>
          <p className="mt-1 text-sm text-slate-500">Admin Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((link) => (
            <NavLink
              key={link.id}
              to={link.path}
              onClick={closeDrawer}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {link.title}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
});

export default Sidebar;