import { Link } from 'react-router-dom';
import '../styles/Welcome.css';

export default function Welcome() {
  return (
    <div className="welcome-container">
      <div className="welcome-left">
          <div className="welcome-item">
              <i id="welcome-icon" className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <span className="welcome-label">Look for information about your favourite movie titles</span>
          </div>
      </div>
      <div className="welcome-right">
        <i id="welcome-logo" className="fa-solid fa-film" aria-hidden="true"></i>
        <div className='welcome-h1'>
          All movies
          <br />
          in one place for you
        </div>
        <Link to="/signup" className="welcome-btn-sign-up">
          Sign up
        </Link>
        <Link to="/login" className="welcome-btn-login">
          Log in
        </Link>
      </div>
    </div>
  )
}