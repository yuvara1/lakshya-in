import { useEffect, useState } from "react";
import { getAllTenantsApi, deleteTenantApi } from "../../api/tenantApi";
import { formatDate } from "../../utils/dateUtils";
import Table from "../../components/common/Table";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import { TENANT_STATUS } from "../../utils/constants";

const SuperAdminPage = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    try {
      const { data } = await getAllTenantsApi();
      setTenants(data.tenants || []);
    } catch {
      /**/
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this tenant? This action is irreversible.")) return;
    try {
      await deleteTenantApi(id);
      setTenants((t) => t.filter((tenant) => tenant._id !== id));
    } catch {
      /**/
    }
  };

  const columns = [
    {
      key: "name",
      label: "Company",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-700 text-xs font-bold">
              {val?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{val}</p>
            <p className="text-xs text-gray-400">{row.domain}</p>
          </div>
        </div>
      ),
    },
    { key: "email", label: "Email" },
    { key: "contactNumber", label: "Contact" },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            val === TENANT_STATUS.ACTIVE
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {val || "ACTIVE"}
        </span>
      ),
    },
    { key: "createdAt", label: "Created", render: (val) => formatDate(val) },
    {
      key: "_id",
      label: "Actions",
      render: (id) => (
        <Button variant="danger" size="sm" onClick={() => handleDelete(id)}>
          Delete
        </Button>
      ),
    },
  ];

  if (loading) return <Loader text="Loading tenants..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tenant Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {tenants.length} organization{tenants.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Total Tenants</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {tenants.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {
              tenants.filter(
                (t) => t.status === TENANT_STATUS.ACTIVE || !t.status,
              ).length
            }
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-red-500 mt-1">
            {tenants.filter((t) => t.status === TENANT_STATUS.INACTIVE).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <Table
          columns={columns}
          data={tenants}
          loading={false}
          emptyMessage="No tenants found"
        />
      </div>
    </div>
  );
};

export default SuperAdminPage;
