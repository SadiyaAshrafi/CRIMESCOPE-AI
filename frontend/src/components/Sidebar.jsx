import {
  LayoutDashboard,
  FolderSearch,
  Network,
  Clock3,
  Bot,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Cases",
      path: "/cases",
      icon: FolderSearch,
    },
    {
      name: "Network DNA",
      path: "/network-dna",
      icon: Network,
    },
    {
      name: "Timeline",
      path: "/timeline",
      icon: Clock3,
    },
    {
      name: "Investigator Copilot",
      path: "/copilot",
      icon: Bot,
    },
  ];

  return (
    <aside className="sidebar">

      <div className="logo-area">

        <div className="logo-icon">
          C
        </div>

        <div>
          <h2>CRIMESCOPE</h2>
          <span>AI INTELLIGENCE</span>
        </div>

      </div>

      <nav className="sidebar-nav">

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "nav-item active"
                  : "nav-item"
              }
            >

              <Icon size={19} />

              <span>{item.name}</span>

            </NavLink>
          );

        })}

      </nav>

      <div className="system-status">

        <div className="status-dot"></div>

        <div>
          <strong>System Online</strong>
          <small>Evidence engine active</small>
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;