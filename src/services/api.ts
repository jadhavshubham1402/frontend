import Axios from "./axios";

export const login = (data: { email: string; password: string }) => {
  return Axios.post("/api/login", data);
};

export const register = (data: {
  name: string;
  email: string;
  password: string;
  role: string;
  managerId?: string;
}) => {
  return Axios.post("/api/register", data);
};

export const getOneUser = () => {
  return Axios.get("/api/users/me");
};

export const getAllUsers = ({
  page = 1,
  sortBy = "name",
  sortOrder = "asc",
  search = "",
  role = "",
}: {
  page?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  role?: string;
} = {}) => {
  return Axios.get("/api/users", {
    params: { page, sortBy, sortOrder, search, role },
  });
};

export const updateUser = (data: {
  userId: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  managerId?: string;
}) => {
  return Axios.put("/api/users", data);
};

export const deleteUser = (userId: string) => {
  return Axios.delete("/api/users", { data: { userId } });
};

export const getTeamMembers = ({
  page = 1,
  sortBy = "name",
  sortOrder = "asc",
  search = "",
  role = "",
}: {
  page?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  role?: string;
} = {}) => {
  return Axios.get("/api/team", {
    params: { page, sortBy, sortOrder, search, role },
  });
};

export const createProduct = (data: any) => {
  return Axios.post("/api/products", data);
};

export const updateProduct = (data: any) => {
  return Axios.put("/api/products", data);
};

export const deleteProduct = (productId: string) => {
  return Axios.delete("/api/products", { data: { productId } });
};

export const getAllProducts = ({
  page = 1,
  sortBy = "name",
  sortOrder = "asc",
  search = "",
  role = "",
}: {
  page?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  role?: string;
} = {}) => {
  return Axios.get("/api/products", {
    params: { page, sortBy, sortOrder, search, role },
  });
};

export const createOrder = (data: {
  customerName: string;
  productId: string;
}) => {
  return Axios.post("/api/orders", data);
};

export const getAllOrders = ({
  page = 1,
  sortBy = "customerName",
  sortOrder = "asc",
  search = "",
}: {
  page?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
} = {}) => {
  return Axios.get("/api/orders", {
    params: { page, sortBy, sortOrder, search },
  });
};

export const updateOrder = (data: { orderId: string; status: string }) => {
  return Axios.put("/api/orders", data);
};
