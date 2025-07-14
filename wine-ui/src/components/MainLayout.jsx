// src/components/MainLayout.jsx
import { Outlet, Link, useLocation } from "react-router-dom";
import MetaMaskConnect from "./MetaMaskConnect";

const ADMIN_ADDRESS = "0xeCeBBC9a32d33AbCFB5EB452066084083500bdD9";

const MainLayout = ({ userAddress, userRole, handleConnect }) => {
  const location = useLocation();
  const isPublicRoute = location.pathname.startsWith("/batch/");

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🍷 Wine Supply Chain DApp</h1>

      {!isPublicRoute && (
        <>
          {userAddress.toLowerCase() === ADMIN_ADDRESS.toLowerCase() && (
            <p><Link to="/admin">Go to Admin Panel</Link></p>
          )}
          <MetaMaskConnect onConnect={handleConnect} />
        </>
      )}

      <Outlet />
    </div>
  );
};

export default MainLayout;
