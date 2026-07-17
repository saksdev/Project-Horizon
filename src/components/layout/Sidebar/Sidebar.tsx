import { NavLink } from "react-router-dom";
import { sidebarItems } from "./SidebarData";

interface SidebarProps {
  isOpen: boolean;
  closeDrawer: () => void;
}

export default function Sidebar({
  isOpen,
  closeDrawer,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={closeDrawer}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="border-b border-slate-200 px-6 py-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Horizon
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Admin Dashboard
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-2 p-4">
          {sidebarItems.map((link) => (
            <NavLink
              key={link.id}
              to={link.path}
              onClick={closeDrawer}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
}