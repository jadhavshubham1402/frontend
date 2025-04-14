import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { register, updateUser, getAllUsers } from "../services/api";
import { User } from "../types";
import { errorToast, successToast } from "../toastConfig";

interface TeamFormProps {
  member?: User | null; // For editing
  onSubmit: () => void; // Refresh table after submit
  onCancel: () => void; // Close modal
}

interface TeamFormValues {
  name: string;
  email: string;
  password: string;
  role: string;
  managerId: string;
}

export const TeamForm = ({ member, onSubmit, onCancel }: TeamFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.role === "Admin") {
      getAllUsers({ page: 1 })
        .then(({ data }) => {
          setManagers(data.data.data.filter((u: User) => u.role === "Manager"));
        })
        .catch(() => errorToast("Failed to fetch managers"));
    }
  }, [user]);

  const initialValues: TeamFormValues = {
    name: member?.name || "",
    email: member?.email || "",
    password: "", // Empty for edit to avoid overwriting unless provided
    role: member?.role || "Employee",
    managerId: member?.managerId || "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: member
      ? Yup.string().optional() // Password optional for editing
      : Yup.string()
          .min(6, "Password must be at least 6 characters")
          .matches(
            /[A-Z]/,
            "Password must include at least one uppercase letter"
          )
          .matches(
            /[!@#$%^&*(),.?":{}|<>]/,
            "Password must include at least one symbol"
          )
          .matches(/[0-9]/, "Password must include at least one number")
          .required("Password is required"),
    role: Yup.string()
      .oneOf(["Manager", "Employee", "Admin"], "Invalid role")
      .required("Role is required"),
    managerId: Yup.string().when("role", {
      is: "Employee",
      then: (schema) => schema.required("Manager is required for Employee"),
      otherwise: (schema) => schema.optional(),
    }),
  });

  const handleSubmit = async (
    values: TeamFormValues,
    { setSubmitting, resetForm }: any
  ) => {
    try {
      if (member) {
        // Update existing user
        const updateData: any = {
          name: values.name,
          email: values.email,
          role: values.role,
        };
        if (values.password) updateData.password = values.password;
        if (values.managerId) updateData.managerId = values.managerId;
        await updateUser({ userId: member._id, ...updateData });
        successToast("Team member updated successfully");
      } else {
        // Create new user
        await register({
          ...values,
          managerId: values.managerId || undefined,
        });
        successToast("Team member added successfully");
        resetForm();
      }
      onSubmit();
    } catch (err: any) {
      errorToast(
        err.response?.data?.message || member
          ? "Failed to update team member"
          : "Failed to add team member"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== "Admin") return null;

  return (
    <div className="mb-8">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => (
          <Form className="space-y-5">
            <div>
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
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <Field
                type="email"
                name="email"
                id="email"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <ErrorMessage
                name="email"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password {member && "(Optional)"}
              </label>
              <div className="relative">
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <ErrorMessage
                name="password"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
              </label>
              <Field
                as="select"
                name="role"
                id="role"
                disabled={member ? true : false}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
              </Field>
              <ErrorMessage
                name="role"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            {values.role === "Employee" && (
              <div>
                <label
                  htmlFor="managerId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Manager
                </label>
                <Field
                  as="select"
                  name="managerId"
                  id="managerId"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="">Select Manager</option>
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="managerId"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : member ? "Update" : "Add"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
