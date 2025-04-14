import { useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { RootState } from "../redux/store";
import { createProduct, updateProduct } from "../services/api";
import { Product } from "../types";
import { errorToast, successToast } from "../toastConfig";

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  image: string | File | null; // Allow File for uploads, string for existing
}

export const ProductForm = ({
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image || null
  );
  const [imageError, setImageError] = useState<string>("");

  const initialValues: ProductFormValues = {
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    image: product?.image || null,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required"),
    price: Yup.number()
      .typeError("Price must be a number")
      .positive("Price must be positive")
      .required("Price is required"),
    image: Yup.mixed()
      .test("fileRequired", "Image is required", (value) => {
        if (product?._id) return true; // Allow no new image when editing
        return !!value; // Require image for new products
      })
      .test("fileType", "Only JPEG/PNG images are allowed", (value) => {
        if (!value || typeof value === "string") return true;
        return ["image/jpeg", "image/png"].includes((value as File).type);
      })
      .test("fileSize", "Image must be less than 5MB", (value) => {
        if (!value || typeof value === "string") return true;
        return (value as File).size <= 5 * 1024 * 1024; // 5MB
      }),
  });

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    setImageError("");
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setImageError("Only JPEG/PNG images are allowed");
        setFieldValue("image", null);
        setImagePreview(null);
        return;
      }
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Image must be less than 5MB");
        setFieldValue("image", null);
        setImagePreview(null);
        return;
      }
      // Set preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFieldValue("image", file);
    } else {
      setImagePreview(product?.image || null);
      setFieldValue("image", product?.image || null);
    }
  };

  const handleSubmit = async (
    values: ProductFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("price", values.price);

      if (values.image instanceof File) {
        formData.append("file", values.image);
      } else if (product?._id && values.image) {
        formData.append("file", values.image); // Send existing URL
      }

      if (product?._id) {
        formData.append("productId", product._id);
        await updateProduct(formData);
        successToast("Product updated successfully");
      } else {
        await createProduct(formData);
        successToast("Product added successfully");
        resetForm();
        setImagePreview(null);
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      errorToast(err.response?.data?.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== "Admin") return null;

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form>
            <div className="mb-5">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <Field
                type="text"
                name="name"
                id="name"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <ErrorMessage
                name="name"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <Field
                as="textarea"
                name="description"
                id="description"
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <ErrorMessage
                name="description"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price
              </label>
              <Field
                type="number"
                name="price"
                id="price"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <ErrorMessage
                name="price"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Image
              </label>
              <input
                type="file"
                name="image"
                id="image"
                accept="image/jpeg,image/png"
                onChange={(e) => handleImageChange(e, setFieldValue)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <ErrorMessage
                name="image"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
              {imageError && (
                <p className="text-red-500 text-sm mt-1">{imageError}</p>
              )}
              {imagePreview && (
                <img
                  src={`http://localhost:5000${imagePreview}`}
                  alt="Preview"
                  className="mt-3 w-32 h-32 object-cover rounded-md"
                />
              )}
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {isSubmitting
                  ? "Saving..."
                  : product
                  ? "Update Product"
                  : "Add Product"}
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
