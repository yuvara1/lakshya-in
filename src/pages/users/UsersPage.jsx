import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getTenantUsersApi } from "../../api/tenantApi";
import { canManageUsers, getRoleLabel } from "../../utils/role";
import { formatDate } from "../../utils/dateUtils";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";

const UsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    if (!canManageUsers(user)) {
      navigate("/dashboard");
      return;
    }

    if (!user.tenantId) {
      setError("Tenant ID is missing. Please re-login.");
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        console.log("Fetching users for tenantId:", user.tenantId);
        console.log(
          "Access token present:",
          !!document.cookie.includes("lakshya_access_token"),
        );

        const { data } = await getTenantUsersApi(user.tenantId);
        console.log("Users raw response:", JSON.stringify(data));

        // ✅ Handle all possible response shapes from Spring Boot
        const usersList =
          data.users ||
          data.data?.users ||
          data.content || // Spring Page object
          data.data?.content ||
          (Array.isArray(data) ? data : []);

        console.log("Parsed users list:", usersList);
        setUsers(usersList);
      } catch (err) {
        console.error(
          "Failed to fetch users:",
          err?.response?.status,
          err?.response?.data,
        );
        setError(err.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user?.tenantId]);

  if (loading) return <Loader text="Loading users..." />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm max-w-md text-center">
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-indigo-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const columns = [
    {
      key: "firstName",
      label: "Name",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
            {row.profileImage ? (
              <img
                src={row.profileImage}
                alt=""
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <span className="text-indigo-700 text-xs font-medium">
                {val?.charAt(0)?.toUpperCase()}
                {row.lastName?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {val} {row.lastName}
            </p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phoneNumber",
      label: "Phone",
      render: (val) => <span className="text-gray-600">{val || "—"}</span>,
    },
    {
      key: "role",
      label: "Role",
      render: (val) => (
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            val === "ADMIN"
              ? "bg-purple-100 text-purple-700"
              : val === "MANAGER"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
          }`}
        >
          {getRoleLabel(val)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (val) => formatDate(val),
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (val) => formatDate(val),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            val === "ACTIVE" || !val
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {val || "ACTIVE"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            {users.length} member{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => navigate("/users/create")}>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Invite User
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <Table
          columns={columns}
          data={users}
          loading={false}
          emptyMessage="No users found"
        />
      </div>
    </div>
  );
};

export default UsersPage;
