import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Tag } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import MenuPrime from "../components/MenuPrim";
function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      const token = localStorage.getItem("jwtToken");
      if (token == null) {
        navigate("/login");
      }
    };
    handleLogout();
  }, []);

  return (
    <div className="flex flex-col items-start w-full ">
      <MenuPrime />
    </div>
  );
}

export default Dashboard;
