import { Search, Bell, ShieldCheck } from "lucide-react";

function Header() {

  return (
    <header className="header">

      <div className="search-box">

        <Search size={19} />

        <input
          type="text"
          placeholder="Search case, person, organization..."
        />

        <span className="shortcut">
          /
        </span>

      </div>

      <div className="header-right">

        <div className="secure-status">
          <ShieldCheck size={17} />
          Secure Investigation Mode
        </div>

        <button className="icon-button">
          <Bell size={19} />
        </button>

        <div className="profile">
          <div className="avatar">
            H
          </div>

          <div>
            <strong>Investigator</strong>
            <small>Analyst</small>
          </div>
        </div>

      </div>

    </header>
  );
}

export default Header;