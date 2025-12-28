import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
const Header = () => {
    return (_jsxs("header", { className: "Header", children: [_jsx("h1", { children: "Tanks fer Nuthin'" }), _jsx("nav", { children: _jsx("ul", { children: _jsx("li", { children: _jsx(Link, { to: "Start", children: "Start" }) }) }) })] }));
};
export default Header;
