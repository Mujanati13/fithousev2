import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  PieChartOutlined,
  NotificationOutlined,
  CreditCardOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  LayoutOutlined,
  BookOutlined,
  UserOutlined,
  ContactsOutlined,
  FieldTimeOutlined,
  FundOutlined,
  ReconciliationOutlined,
  CopyOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  theme,
  Button,
  Card,
  Typography,
  Switch,
  Space,
  Tooltip,
  Row,
  Col,
  Collapse,
} from "antd";
// Import your other components
import Etablisiment from "../../../pages/screens/etablisimment";
import Client from "../../../pages/screens/client";
import Contract from "../../../pages/screens/contract";
import Reservation from "../../../pages/screens/reservation";
import Staff from "../../../pages/screens/staff";
import Coach from "../../../pages/screens/coach";
import Peroid from "../../../pages/screens/peroid";
import Payment from "../../../pages/screens/payment";
import ContractStaff from "../../../pages/screens/contractStaff";
import Cours from "../../../pages/screens/cours";
import Salle from "../../../pages/screens/salle";
import Seance from "../../../pages/screens/seance";
import Abonnement from "../../../pages/screens/abonnement";
import Transication from "../../../pages/screens/transication";
import Notification from "../../../pages/screens/notification";
import Dashboard from "../../../pages/screens/dashboard";
import Record from "../../../pages/screens/record";
import ReservationCoachs from "../../../pages/screens/reservationC";
import CoursC from "../../../pages/screens/coursC";
import SeanceCoach from "../../../pages/screens/seancC";
import Fournisseur from "../../screens/fournisseur";
import Servies from "../../screens/servies";
import ReservationService from "../../screens/reservation_srv";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { Panel } = Collapse;

const MenuPrime = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState("home");
  const [openKeys, setOpenKeys] = useState(["1"]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const handleLogout = async () => {
      const token = localStorage.getItem("jwtToken");
      if (token == null) {
        navigate("/");
      } else {
        // Assuming the user role is stored in localStorage
        const userData = JSON.parse(localStorage.getItem("data"));
        setUserRole(userData[0].fonction);
      }
    };
    handleLogout();
  }, [navigate]);

  const adminMenuConfig = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: "Gestion D'Etablissement",
      children: [
        { key: "11", icon: <HomeOutlined />, label: "Etablissement" },
        { key: "12", icon: <PieChartOutlined />, label: "Dashboard" },
        { key: "13", icon: <NotificationOutlined />, label: "Notification" },
        { key: "14", icon: <CreditCardOutlined />, label: "Transactions" },
        { key: "18", icon: <AppstoreOutlined />, label: "Abonnements" },
        { key: "150", icon: <FundOutlined />, label: "Services" },
        {
          key: "15",
          icon: <BookOutlined />,
          label: "Gestion de cours",
          children: [
            { key: "151", icon: <ClockCircleOutlined />, label: "Séance" },
            { key: "152", icon: <LayoutOutlined />, label: "Salle" },
            { key: "153", icon: <BookOutlined />, label: "Cours" },
          ],
        },
      ],
    },
    {
      key: "2",
      icon: <AppstoreOutlined />,
      label: "Gestion des clients",
      children: [
        { key: "21", icon: <UserOutlined />, label: "Clients" },
        { key: "22", icon: <ContactsOutlined />, label: "Contrats" },
        { key: "230", icon: <BookOutlined />, label: "Réservations" },
      ],
    },
    {
      key: "3",
      icon: <UserOutlined />,
      label: "Gestion du Personnel",
      children: [
        { key: "31", icon: <UserOutlined />, label: "Staff" },
        { key: "32", icon: <FieldTimeOutlined />, label: "Période" },
        { key: "33", icon: <FundOutlined />, label: "Paiement" },
        { key: "35", icon: <ReconciliationOutlined />, label: "Contrat Staff" },
      ],
    },
    { key: "41", icon: <CopyOutlined />, label: "Journal des événements" },
    { key: "39", icon: <UserOutlined />, label: "Fournisseur" },
  ];

  const coachMenuConfig = [
    {
      key: "4",
      icon: <AppstoreOutlined />,
      label: "Coachs",
      children: [
        { key: "36", icon: <UserOutlined />, label: "Pointage" },
        { key: "37", icon: <ContactsOutlined />, label: "Cours" },
        { key: "38", icon: <BookOutlined />, label: "Séances" },
      ],
    },
  ];

  const menuConfig = userRole === "Administration" || userRole === "secretaire" 
    ? adminMenuConfig 
    : coachMenuConfig;

  const groupedMenuItems = userRole === "Administration" || userRole === "secretaire" 
    ? [
        {
          title: "Gestion d'Établissement",
          items: menuConfig[0].children.slice(0, 6),
        },
        {
          title: "Gestion des Cours",
          items: menuConfig[0].children[6].children,
        },
        {
          title: "Gestion des Clients",
          items: menuConfig[1].children,
        },
        {
          title: "Gestion du Personnel",
          items: menuConfig[2].children,
        },
        {
          title: "Système",
          items: [menuConfig[3], menuConfig[4]],
        },
      ]
    : [
        {
          title: "Coachs",
          items: menuConfig[0].children,
        },
      ];

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (
      latestOpenKey &&
      menuConfig.map((item) => item.key).indexOf(latestOpenKey) === -1
    ) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const handleMenuClick = (e) => {
    setSelectedComponent(e.key);
  };

  const renderComponent = () => {
    switch (selectedComponent) {
      case "home":
        return renderHomeScreen();
      case "11":
        return <Etablisiment />;
      case "12":
        return <Dashboard />;
      case "13":
        return <Notification />;
      case "14":
        return <Transication />;
      case "18":
        return <Abonnement />;
      case "151":
        return <Seance />;
      case "152":
        return <Salle />;
      case "153":
        return <Cours />;
      case "21":
        return <Client />;
      case "22":
        return <Contract />;
      case "230":
        return <ReservationService />;
      case "31":
        return <Staff />;
      case "32":
        return <Peroid />;
      case "33":
        return <Payment />;
      case "35":
        return <ContractStaff />;
      case "41":
        return <Record />;
      case "39":
        return <Fournisseur />;
      case "150":
        return <Servies />;
      case "36":
        return <ReservationCoachs />;
      case "37":
        return <CoursC />;
      case "38":
        return <SeanceCoach />;
      default:
        return <Dashboard />;
    }
  };

  const renderHomeScreen = () => (
    <div style={{ padding: "24px" }}>
      <Collapse accordion bordered={false} defaultActiveKey={["0"]}>
        {groupedMenuItems.map((group, groupIndex) => (
          <Panel header={group.title} key={groupIndex}>
            <Row gutter={[16, 16]}>
              {group.items.map((item) => (
                <Col xs={24} sm={12} md={8} lg={8} key={item.key}>
                  <Card
                    hoverable
                    style={{ textAlign: "center" }}
                    onClick={() => setSelectedComponent(item.key)}
                  >
                    {React.cloneElement(item.icon, {
                      style: { fontSize: "25px", marginBottom: "8px" },
                    })}
                    <Title level={4}>{item.label}</Title>
                  </Card>
                </Col>
              ))}
            </Row>
          </Panel>
        ))}
      </Collapse>
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/");
  };

  const toggleDarkMode = (checked) => {
    setIsDarkMode(checked);
    document.body.classList.toggle("dark-mode", checked);
  };

  return (
    <Layout
      style={{ minHeight: "100vh" }}
      className={isDarkMode ? "dark-mode" : ""}
    >
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          backgroundColor: isDarkMode ? "#001529" : "#fff",
        }}
      >
        <Menu
          theme={isDarkMode ? "dark" : "light"}
          mode="inline"
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          onClick={handleMenuClick}
          selectedKeys={[selectedComponent]}
          style={{ marginTop: 10 }}
          items={[
            { key: "home", icon: <HomeOutlined />, label: "Home" },
            ...menuConfig,
          ]}
        />
      </Sider>
      <Layout
        style={{ marginLeft: collapsed ? 80 : 200, transition: "all 0.2s" }}
      >
        <Header
          style={{
            padding: 0,
            background: isDarkMode ? "#001529" : colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "fixed",
            zIndex: 1000,
            width: `calc(100% - ${collapsed ? 80 : 200}px)`,
            transition: "all 0.2s",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <Space>
            <Switch
              checkedChildren="🌙"
              unCheckedChildren="☀️"
              checked={isDarkMode}
              onChange={toggleDarkMode}
            />
            <Tooltip title="Déconnexion">
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ marginRight: 16 }}
              />
            </Tooltip>
          </Space>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: isDarkMode ? "#141414" : colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {renderComponent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MenuPrime;