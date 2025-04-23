import AppRoutes from "./routes/AppRoutes";
import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <>
      <AppRoutes />
      <Outlet />
    </>
  );
}
