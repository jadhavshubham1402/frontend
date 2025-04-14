import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { RootState } from "../redux/store";

export const Sidebar = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);

  if (!token) return null;

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen p-6 shadow-xl">
      <div className="bg-gradient-to-b from-blue-700 to-blue-900 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold tracking-wide">Menu</h2>
      </div>
      <ul className="space-y-2">
        {user?.role === "Admin" && (
          <>
            <li>
              <NavLink
                to="/team"
                className={({ isActive }) =>
                  `block p-3 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-blue-700 hover:text-white ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-300"
                  }`
                }
              >
                Team
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `block p-3 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-blue-700 hover:text-white ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-300"
                  }`
                }
              >
                Products
              </NavLink>
            </li>
          </>
        )}
        {user?.role === "Manager" && (
          <>
            <li>
              <NavLink
                to="/team"
                className={({ isActive }) =>
                  `block p-3 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-blue-700 hover:text-white ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-300"
                  }`
                }
              >
                Team
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `block p-3 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-blue-700 hover:text-white ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-300"
                  }`
                }
              >
                Products
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `block p-3 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-blue-700 hover:text-white ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-300"
                  }`
                }
              >
                Orders
              </NavLink>
            </li>
          </>
        )}
        {user?.role === "Employee" && (
          <>
            {" "}
            <li>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `block p-3 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-blue-700 hover:text-white ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-300"
                  }`
                }
              >
                Products
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `block p-3 rounded-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-blue-700 hover:text-white ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-300"
                  }`
                }
              >
                Orders
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
};
