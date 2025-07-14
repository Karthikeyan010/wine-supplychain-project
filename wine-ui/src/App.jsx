import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import MetaMaskConnect from "./components/MetaMaskConnect";
import RegisterBatchForm from "./components/RegisterBatchForm";
import UpdateStatusForm from "./components/UpdateStatusForm";
import BatchViewer from "./components/BatchViewer";
import BatchHistoryViewer from "./components/BatchHistoryViewer";
import BatchDetails from "./components/BatchDetails";
import AdminDashboard from "./components/AdminDashboard";
import MainLayout from "./components/MainLayout"; // ✅ your new layout
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
    <>
      <Routes>
        {/* Public Read-Only Batch Route */}
        <Route path="/batch/:batchId" element={<BatchDetails />} />

        {/* Main App Routes (Protected behind Layout) */}
        <Route
          path="/"
          element={
            <MainLayout
              userAddress={userAddress}
              userRole={userRole}
              handleConnect={handleConnect}
            />
          }
        >
          {/* Home - role based forms */}
          <Route
            index
            element={
              <>
                {userRole === "Producer" && <RegisterBatchForm />}
                {userRole === "Distributor" && <UpdateStatusForm />}
                <BatchViewer />
                <BatchHistoryViewer />
              </>
            }
          />

          {/* Admin Panel */}
          <Route
            path="admin"
            element={
              userAddress.toLowerCase() === ADMIN_ADDRESS.toLowerCase() ? (
                <AdminDashboard currentAccount={userAddress} />
              ) : (
                <p>⛔ Access Denied – Admins Only</p>
              )
            }
          />
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
