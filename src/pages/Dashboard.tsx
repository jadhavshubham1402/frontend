import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../redux/store';

export const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="mt-10">
      <h2 className="text-3xl mb-6">Welcome, {user?.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {user?.role === 'Admin' && (
          <>
            <Link
              to="/team"
              className="p-4 bg-white rounded shadow hover:bg-gray-50"
            >
              <h3 className="text-xl">Team Management</h3>
              <p>Add and manage team members.</p>
            </Link>
            <Link
              to="/products"
              className="p-4 bg-white rounded shadow hover:bg-gray-50"
            >
              <h3 className="text-xl">Product Management</h3>
              <p>Add and edit products.</p>
            </Link>
          </>
        )}
        {user?.role === 'Manager' && (
          <>
            <Link
              to="/team"
              className="p-4 bg-white rounded shadow hover:bg-gray-50"
            >
              <h3 className="text-xl">Team Management</h3>
              <p>View your team members.</p>
            </Link>
            <Link
              to="/products"
              className="p-4 bg-white rounded shadow hover:bg-gray-50"
            >
              <h3 className="text-xl">Product Management</h3>
              <p>Add and edit products.</p>
            </Link>
            <Link
              to="/orders"
              className="p-4 bg-white rounded shadow hover:bg-gray-50"
            >
              <h3 className="text-xl">Order Management</h3>
              <p>View and manage orders.</p>
            </Link>
          </>
        )}
        {user?.role === 'Employee' && (
          <Link
            to="/orders"
            className="p-4 bg-white rounded shadow hover:bg-gray-50"
          >
            <h3 className="text-xl">Order Management</h3>
            <p>Place new orders.</p>
          </Link>
        )}
      </div>
    </div>
  );
};