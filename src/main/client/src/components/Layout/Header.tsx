import { Link } from "react-router-dom"

const Header = () => {

    return (
        <header className="Header">
            <h1>Tanks fer Nuthin'</h1>
            <nav>
                <ul>
                    <li><Link to="Start">Start</Link></li>
                </ul>
            </nav>
        </header>
    )
}

export default Header