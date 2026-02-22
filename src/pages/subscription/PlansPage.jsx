import { useEffect, useState } from "react";
import {
  getPlansApi,
  createOrderApi,
  verifyPaymentApi,
  getCurrentSubscriptionApi,
} from "../../api/subscriptionApi";
import { SUBSCRIPTION_PLANS } from "../../utils/constants";
import { formatDate } from "../../utils/dateUtils";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

const PLAN_META = {
  [SUBSCRIPTION_PLANS.FREE]: {
    color: "border-gray-200",
    badge: "",
    btnVariant: "secondary",
  },
  [SUBSCRIPTION_PLANS.BASIC]: {
    color: "border-blue-200",
    badge: "",
    btnVariant: "outline",
  },
  [SUBSCRIPTION_PLANS.PRO]: {
    color: "border-indigo-500",
    badge: "Most Popular",
    btnVariant: "primary",
  },
  [SUBSCRIPTION_PLANS.ENTERPRISE]: {
    color: "border-purple-400",
    badge: "Best Value",
    btnVariant: "primary",
  },
};

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          getPlansApi(),
          getCurrentSubscriptionApi(),
        ]);
        setPlans(pRes.data.plans || []);
        setCurrent(cRes.data.subscription);
      } catch {
        /**/
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSubscribe = async (plan) => {
    setProcessing(plan._id);
    try {
      const { data } = await createOrderApi(plan._id);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Lakshya",
        description: `${plan.planType} Plan`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await verifyPaymentApi({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan._id,
            });
            window.location.href = "/payment-success";
          } catch {
            alert("Payment verification failed");
          }
        },
        theme: { color: "#4f46e5" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert("Failed to create order");
    } finally {
      setProcessing("");
    }
  };

  if (loading) return <Loader text="Loading plans..." />;

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-gray-500 mt-2">
          Scale your team with the right plan
        </p>
        {current && (
          <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-sm text-green-700">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Current: <strong>{current.planType}</strong>
            {current.endDate && (
              <span className="text-xs text-gray-500">
                • Expires {formatDate(current.endDate)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = current?.planType === plan.planType;
          const meta = PLAN_META[plan.planType] || {};

          return (
            <div
              key={plan._id}
              className={`relative bg-white rounded-2xl border-2 shadow-sm p-6 flex flex-col ${meta.color}`}
            >
              {meta.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {meta.badge}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {plan.planType}
                </h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{plan.price?.toLocaleString("en-IN") || "0"}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">/month</span>
                </div>
              </div>

              {/* Limits */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-1 text-xs text-gray-600">
                <p>
                  👥 Up to <strong>{plan.maxUsers}</strong> users
                </p>
                <p>
                  📁 Up to <strong>{plan.maxProjects}</strong> projects
                </p>
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plan.features?.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <svg
                      className="w-4 h-4 text-green-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <Button variant="success" disabled className="w-full">
                  ✓ Current Plan
                </Button>
              ) : plan.price === 0 ? (
                <Button variant="secondary" disabled className="w-full">
                  Free Plan
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubscribe(plan)}
                  loading={processing === plan._id}
                  variant={meta.btnVariant || "outline"}
                  className="w-full"
                >
                  Subscribe Now
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlansPage;
