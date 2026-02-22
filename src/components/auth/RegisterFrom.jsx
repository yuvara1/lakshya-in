import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../common/Input";
import Button from "../common/Button";

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    // Tenant fields
    companyName: "",
    domain: "",
    address: "",
    contactNumber: "",
    // Admin User fields
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.id]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.id]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.companyName.trim())
      newErrors.companyName = "Company name is required";
    if (!form.domain.trim()) newErrors.domain = "Domain is required";
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await register({
        // Tenant
        companyName: form.companyName,
        domain: form.domain,
        address: form.address,
        contactNumber: form.contactNumber,
        // User
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      setErrors({ form: err.response?.data?.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-indigo-600 rounded-2xl items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Register your Organization
          </h1>
          <p className="text-gray-500 mt-1">Start your journey with Lakshya</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {errors.form && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Tenant Section */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
                🏢 Company Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <Input
                  id="companyName"
                  label="Company Name"
                  placeholder="Acme Corp"
                  value={form.companyName}
                  onChange={handleChange}
                  error={errors.companyName}
                  required
                />
                <Input
                  id="domain"
                  label="Domain"
                  placeholder="acme.com"
                  value={form.domain}
                  onChange={handleChange}
                  error={errors.domain}
                  required
                />
                <Input
                  id="contactNumber"
                  label="Contact Number"
                  placeholder="+91 98765 43210"
                  value={form.contactNumber}
                  onChange={handleChange}
                  error={errors.contactNumber}
                />
                <Input
                  id="address"
                  label="Address"
                  placeholder="123, Business Park, City"
                  value={form.address}
                  onChange={handleChange}
                  error={errors.address}
                />
              </div>
            </div>

            {/* Admin User Section */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
                👤 Admin Account
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
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
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="john@acme.com"
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
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                />
                <Input
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Create Organization
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
