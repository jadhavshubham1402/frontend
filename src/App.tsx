import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import store, { RootState } from './redux/store';
import { getOneUser } from './services/api';
import { setUser, logout, setLoading } from './redux/reducer';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { TeamManagement } from './pages/TeamManagement';
import { ProductManagement } from './pages/ProductManagement';
import { OrderManagement } from './pages/OrderManagement';
import 'react-toastify/dist/ReactToastify.css';

const AuthWrapper = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated && !user) {
        try {
          dispatch(setLoading(true));
          const response = await getOneUser();
          dispatch(setUser(response.data.data));
        } catch (err) {
          dispatch(logout());
        } finally {
          dispatch(setLoading(false));
        }
      } else {
        dispatch(setLoading(false));
      }
    };
    loadUser();
  }, [isAuthenticated, user, dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={<ProtectedRoute roles={['Admin', 'Manager', 'Employee']} />}
        >
          <Route index element={<Dashboard />} />
        </Route>
        <Route
          path="/team"
          element={<ProtectedRoute roles={['Admin', 'Manager']} />}
        >
          <Route index element={<TeamManagement />} />
        </Route>
        <Route
          path="/products"
          element={<ProtectedRoute roles={['Admin', 'Manager','Employee']} />}
        >
          <Route index element={<ProductManagement />} />
        </Route>
        <Route
          path="/orders"
          element={<ProtectedRoute roles={['Manager', 'Employee']} />}
        >
          <Route index element={<OrderManagement />} />
        </Route>
        <Route path="/" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthWrapper />
        <ToastContainer />
      </Router>
    </Provider>
  );
}

export default App;