import { useState } from "react";
import { sidebarItems } from "./sidebarData";

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<string>("Dashboard");

  return (
    <aside className="w-64 h-screen bg-slate-50 border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Horizon</h2>
      </div>

      <nav className="flex flex-col p-4 gap-2">
        {sidebarItems.map((link) => (
          <button
            key={link.id}
            onClick={() => setActiveTab(link.title)}
            className={`text-left px-4 py-3 rounded-md text-base transition-colors duration-200 ${
              activeTab === link.title
                ? "bg-blue-600 text-white font-medium"
                : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            {link.title}
          </button>
        ))}
      </nav>
    </aside>
  );
}