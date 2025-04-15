import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { getAllOrders, updateOrder } from "../services/api";
import { OrderForm } from "../components/OrderForm";
import { Order } from "../types";
import { errorToast, successToast } from "../toastConfig";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

type SortKey = "customerName" | "productName" | "employeeName" | "status";
type SortOrder = "asc" | "desc";

export const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("customerName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const { user } = useSelector((state: RootState) => state.auth);

  const fetchOrders = async (page: number) => {
    try {
      setError("");
      const params = {
        page,
        sortBy: sortKey,
        sortOrder,
      };
      const { data } = await getAllOrders(params);
      setOrders(Array.isArray(data.data.data) ? data.data.data : []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(page);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch orders";
      setError(message);
      setOrders([]);
      setTotalPages(1);
      errorToast(message);
    }
  };

  useEffect(() => {
    if (["Manager", "Employee"].includes(user?.role || "")) {
      fetchOrders(1);
    }
  }, [user, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrder({ orderId, status });
      successToast("Order updated successfully");
      fetchOrders(currentPage);
    } catch (err: any) {
      errorToast(err.response?.data?.message || "Failed to update order");
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchOrders(page);
    }
  };

  // Badge styling based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!["Manager", "Employee"].includes(user?.role || "")) return null;

  return (
    <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Order Management
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {[
                { key: "customerName", label: "Customer Name" },
                { key: "productName", label: "Product Name" },
                { key: "employeeName", label: "Employee Name" },
                { key: "status", label: "Status" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key as SortKey)}
                  className="py-3 px-4 text-left text-gray-600 font-semibold cursor-pointer hover:text-gray-800 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    {label}
                    {sortKey === key && (
                      <span className="ml-2">
                        {sortOrder === "asc" ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {user?.role === "Manager" && (
                <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={user?.role === "Manager" ? 5 : 4}
                  className="py-4 px-4 text-center text-gray-500"
                >
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order: any) => (
                <tr
                  key={order._id}
                  className="border-b hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="py-3 px-4 text-gray-800">
                    {order.customerName}
                  </td>
                  <td className="py-3 px-4 text-gray-800">
                    {order.productId.name}
                  </td>
                  <td className="py-3 px-4 text-gray-800">
                    {order.employeeId.name}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-sm font-medium ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  {user?.role === "Manager" && order.status == "Pending" && (
                    <td className="py-3 px-4 flex space-x-2">
                      <button
                        onClick={() =>
                          handleStatusChange(order._id, "Delivered")
                        }
                        disabled={order.status === "Delivered"}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          order.status === "Delivered"
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        } transition-all duration-200`}
                      >
                        Delivered
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(order._id, "Cancelled")
                        }
                        disabled={order.status === "Cancelled"}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          order.status === "Cancelled"
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-red-600 text-white hover:bg-red-700"
                        } transition-all duration-200`}
                      >
                        Cancelled
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all duration-300"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              } transition-all duration-300`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all duration-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
