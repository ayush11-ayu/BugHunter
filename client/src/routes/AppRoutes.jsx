import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Bugs from "../pages/Bugs";
import CreateBug from "../pages/CreateBug";
import BugDetails from "../pages/BugDetails";
import Projects from "../pages/Projects";
import Users from "../pages/Users";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>BugHunter</h1>} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/bugs" element={<Bugs />} />
          <Route path="/bugs/create" element={<CreateBug />} />
          <Route path="/bugs/:id" element={<BugDetails />} />

          <Route path="/projects" element={<Projects />} />

          {/* Admin and Manager only */}
          <Route element={<RoleRoute allowedRoles={["admin", "manager"]} />}>
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;