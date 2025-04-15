import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { getAllProducts, deleteProduct } from "../services/api";
import { ProductForm } from "../components/ProductForm";
import { Product } from "../types";
import { errorToast, successToast } from "../toastConfig";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { OrderForm } from "../components/OrderForm";

type SortKey = "name" | "price";
type SortOrder = "asc" | "desc";

export const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOrder, setIsModalOrder] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch products
  const fetchProducts = useCallback(
    async (page: number) => {
      try {
        setError("");
        const params = {
          page,
          sortBy: sortKey,
          sortOrder,
          search: searchQuery,
        };
        const { data } = await getAllProducts(params);
        setProducts(Array.isArray(data.data.data) ? data.data.data : []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(page);
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Failed to fetch products";
        setError(message);
        setProducts([]);
        setTotalPages(1);
        errorToast(message);
      }
    },
    [sortKey, sortOrder, searchQuery]
  );

  useEffect(() => {
    fetchProducts(1);
  }, [sortKey, sortOrder, searchQuery, fetchProducts]);

  // Handle sorting
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchProducts(page);
    }
  };

  // Handle form submission
  const handleFormSubmit = () => {
    setIsModalOpen(false);
    setEditingProduct(undefined);
    fetchProducts(currentPage);
  };

  const handleFormOrderSubmit = () => {
    setIsModalOrder(false);
    setEditingProduct(undefined);
    fetchProducts(currentPage);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        successToast("Product deleted successfully");
        fetchProducts(currentPage);
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Failed to delete product";
        errorToast(message);
      }
    }
  };

  // Handle add/edit
  const handleAdd = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleEditOrder = (product: Product) => {
    setIsModalOrder(true);
    setEditingProduct(product);
  };

  if (!["Admin", "Manager", "Employee"].includes(user?.role || "")) return null;

  return (
    <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Product Management</h2>
        {user?.role !== "Employee" && (
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Add Product
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {[
                { key: "name", label: "Name" },
                { key: "", label: "Description" },
                { key: "price", label: "Price" },
                { key: "", label: "Image" },
              ].map(({ key, label }) => (
                <th
                  key={key || label}
                  onClick={() => key && handleSort(key as SortKey)}
                  className={`py-3 px-4 text-left text-gray-600 font-semibold ${
                    key ? "cursor-pointer hover:text-gray-800" : ""
                  } transition-colors duration-200`}
                >
                  <div className="flex items-center">
                    {label}
                    {sortKey === key && key && (
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
              <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product: any) => (
                <tr
                  key={product._id}
                  className="border-b hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="py-3 px-4 text-gray-800">{product.name}</td>
                  <td className="py-3 px-4 text-gray-800">
                    {product.description}
                  </td>
                  <td className="py-3 px-4 text-gray-800">
                    ₹{product.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-gray-800">
                    {product.image ? (
                      <img
                        src={`http://localhost:5000${product.image}`}
                        alt={product.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 px-4 flex space-x-2">
                    {user?.role !== "Employee" && (
                      <>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800 transition-all duration-200 transform hover:scale-110 focus:outline-none"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-800 transition-all duration-200 transform hover:scale-110 focus:outline-none"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    {user?.role === "Employee" && (
                      <>
                        <button
                          onClick={() => handleEditOrder(product)}
                          className="text-blue-600 hover:text-blue-800 transition-all duration-200 transform hover:scale-110 focus:outline-none"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </td>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h3>
            <ProductForm
              product={editingProduct}
              onSuccess={handleFormSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}

      {isModalOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <OrderForm
              product={editingProduct}
              onSuccess={handleFormOrderSubmit}
              onCancel={() => setIsModalOrder(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
