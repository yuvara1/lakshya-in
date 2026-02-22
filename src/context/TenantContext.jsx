import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getTenantByIdApi } from '../api/tenantApi';

const TenantContext = createContext(null);

export const TenantProvider = ({ children }) => {
  const { user } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTenant = async () => {
      if (user?.tenantId) {
        setLoading(true);
        try {
          const { data } = await getTenantByIdApi(user.tenantId);
          setTenant(data.tenant);
        } catch {
          setTenant(null);
        } finally {
          setLoading(false);
        }
      } else {
        setTenant(null);
      }
    };
    fetchTenant();
  }, [user]);

  return (
    <TenantContext.Provider value={{ tenant, setTenant, loading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
};

export default TenantContext;