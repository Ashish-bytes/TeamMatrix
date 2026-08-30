import { NavLink } from "react-router-dom";
import "./header.css";
import { CircleUser, Home } from "lucide-react";
import { translateLocalStorage } from "../../translate/translate";

const Header = () => {
  const handleTranslate = async () => {
  const currentLanguage =
    localStorage.getItem("language") || "English";

  const newLanguage =
    currentLanguage === "English" ? "Hindi" : "English";

  try {
    await translateLocalStorage("roadmaps", newLanguage);

    localStorage.setItem("language", newLanguage);

    window.location.reload();
  } catch (error) {
    console.error("Translation failed:", error);
  }
};

  return (
    <header>
      <img
        src="logo.png"
        alt="LearnX"
        height={40}
        className="logo"
      />

      <button
        className="languageButton"
        onClick={handleTranslate}
      >
        हिंदी / English
      </button>

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