import { ErrorMessage, Field, Form, Formik } from "formik";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { RootState } from "../redux/store";
import { createOrder } from "../services/api";
import { errorToast, successToast } from "../toastConfig";

interface OrderFormValues {
  customerName: string;
}

export const OrderForm = ({ product, onSuccess, onCancel }: any) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const initialValues: OrderFormValues = {
    customerName: "",
  };

  const validationSchema = Yup.object({
    customerName: Yup.string().required("Customer name is required"),
  });

  const handleSubmit = async (
    values: OrderFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    try {
      await createOrder({ ...values, productId: product._id });
      successToast("Order placed successfully");
      onSuccess();
      navigate("/orders");
      resetForm();
    } catch (err: any) {
      errorToast(err.response?.data?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== "Employee") return null;

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
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {isSubmitting ? "Placing..." : "Place Order"}
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
                onClick={() => onCancel()}
              >
                Close
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
