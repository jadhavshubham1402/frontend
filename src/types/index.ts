export interface User {
    _id?: string;
    name: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Employee';
    managerId?: string;
  }
  
  export interface Product {
    _id?: string;
    name: string;
    description: string;
    price: number;
    image: string;
    createdBy?: string;
  }
  
  export interface Order {
    _id?: string;
    customerName: string;
    productId: string;
    employeeId?: string;
    status: 'Pending' | 'Delivered' | 'Cancelled';
    createdAt?: string;
  }
  
  export interface AuthState {
    token: string | null;
    user: User | null;
  }