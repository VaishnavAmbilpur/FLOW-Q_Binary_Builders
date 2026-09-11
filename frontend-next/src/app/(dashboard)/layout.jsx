import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import QRTerminal from "@/components/QRTerminal";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white relative">
        <Navbar />
        <QRTerminal />
        <div className="relative z-10 pt-20">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
