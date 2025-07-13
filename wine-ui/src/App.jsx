import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import MetaMaskConnect from "./components/MetaMaskConnect";
import RegisterBatchForm from "./components/RegisterBatchForm";
import UpdateStatusForm from "./components/UpdateStatusForm";
import BatchViewer from "./components/BatchViewer";
import BatchHistoryViewer from "./components/BatchHistoryViewer";
import BatchDetails from "./components/BatchDetails";
import AdminDashboard from "./components/AdminDashboard";
import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ADMIN_ADDRESS = "0xeCeBBC9a32d33AbCFB5EB452066084083500bdD9";

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [userRole, setUserRole] = useState("");

  const handleConnect = (address, role) => {
    setUserAddress(address);
    setUserRole(role);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🍷 Wine Supply Chain DApp</h1>

      <Routes>
        {/* ✅ PUBLIC Route - No MetaMask */}
        <Route path="/batch/:batchId" element={<BatchDetails />} />

        {/* ✅ Admin-only Route */}
        <Route
          path="/admin"
          element={
            userAddress.toLowerCase() === ADMIN_ADDRESS.toLowerCase() ? (
              <AdminDashboard currentAccount={userAddress} />
            ) : (
              <p>⛔ Access Denied – Admins Only</p>
            )
          }
        />

        {/* ✅ Authenticated User View */}
        <Route
          path="/"
          element={
            <>
              {/* Connect only on home route */}
              <MetaMaskConnect onConnect={handleConnect} />

              {userAddress.toLowerCase() === ADMIN_ADDRESS.toLowerCase() && (
                <p style={{ marginTop: "1rem" }}>
                  <Link to="/admin">Go to Admin Panel</Link>
                </p>
              )}

              {userRole === "Producer" && <RegisterBatchForm />}
              {userRole === "Distributor" && <UpdateStatusForm />}
              <BatchViewer />
              <BatchHistoryViewer />
            </>
          }
        />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
