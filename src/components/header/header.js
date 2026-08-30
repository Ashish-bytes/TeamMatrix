import { NavLink } from "react-router-dom";
import "./header.css";
import { CircleUser, Home } from "lucide-react";

const Header = () => {
  return (
    <header>
      <img
        src="logo.png"
        alt="TeamMatrix"
        height={40}
        className="logo"
      />

      <NavLink to="/" className="Home">
        <Home
          size={40}
          strokeWidth={1}
          color="white"
        />
      </NavLink>

      <NavLink to="/profile" className="ProfileAvatar">
        <CircleUser
          size={50}
          strokeWidth={1}
          color="white"
        />
      </NavLink>
    </header>
  );
};

export default Header;