import { useEffect, useState } from "react";
import {
  getBillingHistoryApi,
  getCurrentSubscriptionApi,
} from "../../api/subscriptionApi";
import { formatDateTime, formatDate } from "../../utils/dateUtils";
import { Link } from "react-router-dom";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { PAYMENT_STATUS } from "../../utils/constants";

const BillingPage = () => {
  const [payments, setPayments] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [bRes, sRes] = await Promise.all([
          getBillingHistoryApi(),
          getCurrentSubscriptionApi(),
        ]);
        setPayments(bRes.data.payments || []);
        setSubscription(sRes.data.subscription);
      } catch {
        /**/
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <Loader text="Loading billing..." />;

  const columns = [
    {
      key: "transactionId",
      label: "Transaction ID",
      render: (val) => (
        <span className="font-mono text-xs text-gray-500">{val || "—"}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (val, row) => (
        <span className="font-semibold text-gray-900">
          {row.currency || "₹"}
          {val?.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Method",
      render: (val) => (
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            val === "UPI"
              ? "bg-purple-100 text-purple-700"
              : val === "CARD"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
          }`}
        >
          {val || "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            val === PAYMENT_STATUS.SUCCESS
              ? "bg-green-100 text-green-700"
              : val === PAYMENT_STATUS.PENDING
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: "paymentDate",
      label: "Date",
      render: (val) => formatDateTime(val),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <Link to="/plans">
          <Button variant="outline">Upgrade Plan</Button>
        </Link>
      </div>

      {/* Current Subscription Card */}
      {subscription && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-indigo-200 text-sm">Current Plan</p>
              <p className="text-3xl font-bold capitalize mt-1">
                {subscription.planType}
              </p>
              <div className="flex gap-4 mt-3 text-sm text-indigo-200">
                <span>
                  👥 Max Users:{" "}
                  <strong className="text-white">
                    {subscription.maxUsers}
                  </strong>
                </span>
                <span>
                  📁 Max Projects:{" "}
                  <strong className="text-white">
                    {subscription.maxProjects}
                  </strong>
                </span>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                subscription.isActive
                  ? "bg-green-400 text-green-900"
                  : "bg-red-400 text-red-900"
              }`}
            >
              {subscription.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex gap-6 mt-4 text-xs text-indigo-200 border-t border-indigo-500 pt-3">
            <span>
              Start:{" "}
              <strong className="text-white">
                {formatDate(subscription.startDate)}
              </strong>
            </span>
            <span>
              End:{" "}
              <strong className="text-white">
                {formatDate(subscription.endDate)}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Payment History</h2>
        </div>
        <Table
          columns={columns}
          data={payments}
          loading={false}
          emptyMessage="No payment history"
        />
      </div>
    </div>
  );
};

export default BillingPage;
