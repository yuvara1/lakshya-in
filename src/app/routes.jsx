import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./protectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";

// Pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import Dashboard from "../pages/dashboard/Dashboard";
import ProjectsPage from "../pages/projects/projectsPage";
import ProjectDetailsPage from "../pages/projects/ProjectDetailsPage";
import TasksPage from "../pages/tasks/TasksPage";
import UsersPage from "../pages/users/UsersPage";
import CreateUserPage from "../pages/users/CreateUserPage";
import PlansPage from "../pages/subscription/PlansPage";
import BillingPage from "../pages/subscription/BillingPage";
import PaymentSuccessPage from "../pages/subscription/PaymentSuccessPage";
import SuperAdminPage from "../pages/admin/SuperAdminPage";

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/payment-success" element={<PaymentSuccessPage />} />

    {/* Protected – Dashboard layout */}
    <Route
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetailsPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route
        path="/users"
        element={
          <ProtectedRoute roles={["ADMIN", "superadmin"]}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/create"
        element={
          <ProtectedRoute roles={["ADMIN", "superadmin"]}>
            <CreateUserPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute roles={["ADMIN", "superadmin"]}>
            <BillingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans"
        element={
          <ProtectedRoute roles={["ADMIN", "superadmin"]}>
            <PlansPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute roles={["superadmin"]}>
            <SuperAdminPage />
          </ProtectedRoute>
        }
      />
    </Route>

    {/* Fallback */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
