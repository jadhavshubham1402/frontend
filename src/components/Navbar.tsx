import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../redux/reducer';
import { RootState } from '../redux/store';

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);

  // Determine panel name based on user role
  const getPanelName = () => {
    if (!token || !user) return 'Admin Panel'; // Default for unauthenticated users
    switch (user.role) {
      case 'Admin':
        return 'Admin Panel';
      case 'Manager':
        return 'Manager Panel';
      case 'Employee':
        return 'Employee Panel';
      default:
        return 'Admin Panel'; // Fallback
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">
          {getPanelName()}
        </Link>
        <div>
          {token ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="text-white hover:text-blue-200 font-medium transition-colors duration-300"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};