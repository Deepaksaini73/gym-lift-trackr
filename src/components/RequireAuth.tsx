import React from "react";
import { Outlet } from "react-router-dom";

const RequireAuth: React.FC = () => {
  return <Outlet />;
};

export default RequireAuth;