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
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeDrawer}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-slate-50 border-r border-slate-200 flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Horizon</h2>

          <button
            className="md:hidden text-2xl"
            onClick={closeDrawer}
          >
            &times;
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-2">
          {sidebarItems.map((link) => (
            <NavLink
              key={link.id}
              to={link.path}
              onClick={closeDrawer}
              className={({ isActive }) =>
                `px-4 py-3 rounded-md transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white font-medium"
                    : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
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