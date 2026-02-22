import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createTenantUserApi } from "../../api/tenantApi";
import { ROLES, USER_STATUS } from "../../utils/constants";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const CreateUserPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: ROLES.EMPLOYEE,
    status: USER_STATUS.ACTIVE,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.id]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.id]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
    if (!form.phoneNumber.trim()) errs.phoneNumber = "Phone number is required";
    if (form.password.length < 6) errs.password = "At least 6 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // ✅ Debug — check tenantId before sending
    console.log("user.tenantId before submit:", user?.tenantId);

    if (!user?.tenantId) {
      setErrors({ form: "Tenant ID is missing. Please re-login." });
      return;
    }

    setLoading(true);
    try {
      await createTenantUserApi(user.tenantId, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        role: form.role,
        status: form.status,
        tenantId: user.tenantId, // ✅ Also send in body as fallback
      });
      navigate("/users");
    } catch (err) {
      setErrors({
        form: err.response?.data?.message || "Failed to create user",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => navigate("/users")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Users
      </button>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          Create Employee
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Create a new user account. They can log in with their email and
          password.
        </p>

        {errors.form && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Info */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Personal Information
          </p>
          <div className="grid grid-cols-2 gap-x-4">
            <Input
              id="firstName"
              label="First Name"
              placeholder="John"
              value={form.firstName}
              onChange={handleChange}
              error={errors.firstName}
              required
            />
            <Input
              id="lastName"
              label="Last Name"
              placeholder="Doe"
              value={form.lastName}
              onChange={handleChange}
              error={errors.lastName}
              required
            />
          </div>
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="john@company.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <Input
            id="phoneNumber"
            label="Phone Number"
            placeholder="+91 98765 43210"
            value={form.phoneNumber}
            onChange={handleChange}
            error={errors.phoneNumber}
            required
          />

          {/* Login Credentials */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-2">
            Login Credentials
          </p>
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />

          {/* Role & Status */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-2">
            Access Control
          </p>
          <div className="grid grid-cols-2 gap-x-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={ROLES.EMPLOYEE}>Employee</option>
                <option value={ROLES.MANAGER}>Manager</option>
                <option value={ROLES.ADMIN}>Admin</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={USER_STATUS.ACTIVE}>Active</option>
                <option value={USER_STATUS.DISABLED}>Disabled</option>
              </select>
            </div>
          </div>

          {/* Role description */}
          <div className="mb-4 p-3 bg-indigo-50 rounded-lg text-xs text-indigo-700">
            {form.role === ROLES.EMPLOYEE &&
              "👤 Employee: Can view & work on assigned tasks only."}
            {form.role === ROLES.MANAGER &&
              "🧑‍💼 Manager: Can create & manage projects and tasks."}
            {form.role === ROLES.ADMIN &&
              "🔑 Admin: Full access — can manage users, projects, billing."}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => navigate("/users")}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserPage;
