import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getAllOrders, updateOrder } from '../services/api';
import { OrderForm } from '../components/OrderForm';
import { Order } from '../types';
import { errorToast, successToast } from '../toastConfig';

export const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const { user } = useSelector((state: RootState) => state.auth);

  const fetchOrders = async () => {
    try {
      const { data } = await getAllOrders({ page: 1 });
      setOrders(data.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch orders';
      setError(message);
      errorToast(message);
    }
  };

  useEffect(() => {
    if (['Manager', 'Employee'].includes(user?.role || '')) {
      fetchOrders();
    }
  }, [user]);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrder({ orderId, status });
      successToast('Order updated successfully');
      fetchOrders();
    } catch (err: any) {
      errorToast(err.response?.data?.message || 'Failed to update order');
    }
  };

  if (!['Manager', 'Employee'].includes(user?.role || '')) return null;

  return (
    <div className="mt-10">
      <h2 className="text-3xl mb-6">Order Management</h2>
      {user?.role === 'Employee' && <OrderForm />}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((order:any) => (
          <div key={order._id} className="p-4 bg-white rounded shadow">
            <h3 className="text-xl">Order by {order.customerName}</h3>
            <p>Product: {order.productId.name}</p>
            <p>Status: {order.status}</p>
            {user?.role === 'Manager' && (
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order._id || '', e.target.value)}
                className="mt-2 p-2 border rounded"
              >
                <option value="Pending">Pending</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};