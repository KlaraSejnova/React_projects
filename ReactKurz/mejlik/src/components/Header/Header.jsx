import "./Header.css";

export const Header = ({ user }) => {
  return (
    <header>
      <div className="topbar container">
        <div className="topbar__brand">
          <div className="logo"></div>
          <div className="company">Mejlík.cz</div>
        </div>
        {user == undefined ? (
          <div className="login">Přihlásit se</div>
        ) : (
          <div className="user">
            <div className="user__name">{user}</div>
            <div className="user__icon"></div>
          </div>
        )}
      </div>
    </header>
  );
};
