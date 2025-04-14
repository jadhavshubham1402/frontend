import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createOrder, getAllProducts } from '../services/api';
import { Product } from '../types';
import { errorToast, successToast } from '../toastConfig';

interface OrderFormValues {
  customerName: string;
  productId: string;
}

export const OrderForm = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.role === 'Employee') {
      getAllProducts({ page: 1 })
        .then(({ data }) => {
          setProducts(data.data);
        })
        .catch(() => errorToast('Failed to fetch products'));
    }
  }, [user]);

  const initialValues: OrderFormValues = {
    customerName: '',
    productId: '',
  };

  const validationSchema = Yup.object({
    customerName: Yup.string().required('Customer name is required'),
    productId: Yup.string().required('Product is required'),
  });

  const handleSubmit = async (values: OrderFormValues, { setSubmitting, resetForm }: any) => {
    try {
      await createOrder(values);
      successToast('Order placed successfully');
      resetForm();
    } catch (err: any) {
      errorToast(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'Employee') return null;

  return (
    <div className="card mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Place Order</h3>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="mb-5">
              <label
                htmlFor="customerName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Customer Name
              </label>
              <Field
                type="text"
                name="customerName"
                id="customerName"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <ErrorMessage
                name="customerName"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="productId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product
              </label>
              <Field
                as="select"
                name="productId"
                id="productId"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="productId"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isSubmitting ? 'Placing...' : 'Place Order'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};