import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import TransactionsPage from "@/pages/TransactionsPage";
import AddTransactionPage from "@/pages/AddTransactionPage";
import CategoriesPage from "@/pages/CategoriesPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import EventsPage from "@/pages/EventsPage";
import ImportExportPage from "@/pages/ImportExportPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<TransactionsPage />} />
            <Route path="/add-transaction" element={<AddTransactionPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/import-export" element={<ImportExportPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
