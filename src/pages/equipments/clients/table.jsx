import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Input,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
  Button,
  Drawer,
  Space,
  Tooltip,
  Upload,
  DatePicker,
  Progress,
} from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  PrinterOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  DownloadOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  addNewTrace,
  getCurrentDate,
  validateEmail,
  validateMoroccanPhoneNumber,
} from "../../../utils/helper";
import * as XLSX from "xlsx";
import moment from "moment";
const TableClient = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [update, setUpdate] = useState(null);
  const [form] = Form.useForm();
  const [open1, setOpen1] = useState(false);
  const [add, setAdd] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [imagePath, setimagePath] = useState("");
  const [changedFields, setChangedFields] = useState([]);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [villes, setVilles] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [exportFilters, setExportFilters] = useState({
    statut: null, // null means all statuses
    date_inscription_start: null,
    date_inscription_end: null,
    blackliste: null, // null means both blacklisted and non-blacklisted
    date_naissance_start: null,
    date_naissance_end: null,
  });
  const [formErrors, setFormErrors] = useState({
    tel: "",
    mail: "",
  });
  const [ClientData, setClientData] = useState({
    civilite: "",
    nom_client: "",
    prenom_client: "",
    adresse: "",
    tel: "",
    mail: "",
    cin: "",
    ville: 1,
    date_naissance: "",
    date_inscription: getCurrentDate(),
    statut: true,
    blackliste: false,
    newsletter: true,
    nom_ville: "",
    password: null,
    image: imagePath,
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState([]);
  const handleCancel = () => setPreviewOpen(false);
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name ||
        (file.url ? file.url.substring(file.url.lastIndexOf("/") + 1) : "")
    );
  };
  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);
  const handleUploadImage = async () => {
    // Check if there is a file to upload
    if (fileList.length === 0) {
      // message.error("No files to upload.");
      return;
    }

    const file = fileList[0]; // Only upload the first file
    console.log(file.originFileObj);

    const formData = new FormData();
    formData.append("uploadedFile", file.originFileObj);
    formData.append("path", "client/");

    try {
      const response = await fetch(
        "https://fithouse.pythonanywhere.com/api/saveImage/",
        {
          method: "POST",
          body: formData, // Corrected: Pass formData directly as the body
        }
      );

      if (response.ok) {
        const res = await response.json();
        setimagePath(res.path);
        ClientData.image = res.path;
      } else {
        const errorResponse = await response.json();
        message.error(`File upload failed: ${errorResponse.detail}`);
      }
    } catch (error) {
      console.error("Error during file upload:", error);
      message.error("File upload failed");
    }
  };
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const showExportModal = () => {
    setIsExportModalVisible(true);
  };
  const handleExport = () => {
    const filteredData = data.filter((item) => {
      // Status filter
      if (
        exportFilters.statut !== null &&
        item.statut !== exportFilters.statut
      ) {
        return false;
      }

      // Date d'inscription filter
      if (
        exportFilters.date_inscription_start &&
        new Date(item.date_inscription) <
          new Date(exportFilters.date_inscription_start)
      ) {
        return false;
      }
      if (
        exportFilters.date_inscription_end &&
        new Date(item.date_inscription) >
          new Date(exportFilters.date_inscription_end)
      ) {
        return false;
      }

      // Blackliste filter
      if (
        exportFilters.blackliste !== null &&
        item.blackliste !== exportFilters.blackliste
      ) {
        return false;
      }

      // Date de naissance filter
      if (
        exportFilters.date_naissance_start &&
        new Date(item.date_naissance) <
          new Date(exportFilters.date_naissance_start)
      ) {
        return false;
      }
      if (
        exportFilters.date_naissance_end &&
        new Date(item.date_naissance) >
          new Date(exportFilters.date_naissance_end)
      ) {
        return false;
      }

      return true;
    });

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");

    // Generate Excel File & Download
    XLSX.writeFile(wb, "clients_export.xlsx");

    setIsExportModalVisible(false);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setClientData({ ...ClientData, tel: value });

    if (!validateMoroccanPhoneNumber(value)) {
      setFormErrors((prev) => ({
        ...prev,
        tel: "Numéro de téléphone invalide",
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, tel: "" }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setClientData({ ...ClientData, mail: value });

    if (!validateEmail(value)) {
      setFormErrors((prev) => ({ ...prev, mail: "Adresse e-mail invalide" }));
    } else {
      setFormErrors((prev) => ({ ...prev, mail: "" }));
    }
  };

  const isRoomFormValid = () => {
    const errors = {};

    if (ClientData.civilite === "") errors.civilite = true;
    if (ClientData.nom_client === "") errors.nom_client = true;
    if (ClientData.prenom_client === "") errors.prenom_client = true;
    if (ClientData.adresse === "") errors.adresse = true;
    if (!validateMoroccanPhoneNumber(ClientData.tel)) errors.tel = true;
    if (!validateEmail(ClientData.mail)) errors.mail = true;
    if (ClientData.cin === "") errors.cin = true;
    if (ClientData.ville === "") errors.ville = true;
    if (ClientData.date_naissance === "") errors.date_naissance = true;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Function to add a new chamber
  const addClient = async () => {
    try {
      if (!isRoomFormValid()) {
        const firstErrorField = Object.keys(formErrors)[0];
        const errorElement = document.getElementById(firstErrorField);
        if (errorElement) {
          errorElement.focus();
        }
        message.warning(
          "Veuillez remplir tous les champs obligatoires correctement"
        );
        return;
      }

      await handleUploadImage();

      const response = await fetch(
        "https://fithouse.pythonanywhere.com/api/clients/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...ClientData,
            ville: parseInt(ClientData.ville), // Ensure ville is sent as an integer
          }),
        }
      );
      if (response.ok) {
        const res = await response.json();
        if (res.msg == "Added Successfully!!e") {
          message.success("Client ajouté avec succès");
          setAdd(Math.random() * 1000);
          setClientData({
            civilite: "",
            nom_client: "",
            prenom_client: "",
            adresse: "",
            tel: "",
            mail: "",
            cin: "",
            ville: 1,
            date_naissance: "",
            date_inscription: getCurrentDate(),
            statut: true,
            blackliste: false,
            newsletter: true,
            nom_ville: "",
            password: null,
            image: imagePath,
          });
          const id_staff = JSON.parse(localStorage.getItem("data"));
          const res = await addNewTrace(
            id_staff[0].id_employe,
            "Ajout",
            getCurrentDate(),
            `${JSON.stringify(ClientData)}`,
            "client"
          );
          onCloseR();
        } else {
          message.warning(res.msg);
          console.log(res);
        }
      } else {
        console.log(response);
        message.error("Error adding chamber");
      }
    } catch (error) {
      console.log(error);
      message.error("An error occurred:", error);
    }
  };

  const showDrawerR = () => {
    setOpen1(true);
  };

  const onCloseR = () => {
    setOpen1(false);
    setClientData({
      civilite: "",
      nom_client: "",
      prenom_client: "",
      adresse: "",
      tel: "",
      mail: "",
      cin: "",
      ville: 1,
      date_naissance: "",
      date_inscription: getCurrentDate(),
      statut: true,
      blackliste: false,
      newsletter: true,
      nom_ville: "",
      password: null,
      image: imagePath,
    });
  };

  // Function to handle form submission in the room drawer
  const handleRoomSubmit = () => {
    addClient();
  };

  const handleDetailsModalCancel = () => {
    setIsDetailsModalVisible(false);
    setSelectedClient(null);
  };

  const authToken = localStorage.getItem("jwtToken"); // Replace with your actual auth token
  "https://fithouse.pythonanywhere.com/api/clients/",

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://fithouse.pythonanywhere.com/api/clients/",
          {
            headers: {
              Authorization: `Bearer ${authToken}`, // Include the auth token in the headers
            },
          }
        );
        const jsonData = await response.json();

        // Ensure each row has a unique key
        const processedData = jsonData.data.map((item, index) => ({
          ...item,
          key: item.id_client || index, // Assuming each item has a unique id, otherwise use index
        }));

        setData(processedData);
        setFilteredData(processedData);

        const desiredKeys = [
          "nom_complet",
          "tel",
          "mail",
          "adresse",
          "date_inscription",
          "actions",
        ];

        const generatedColumns = desiredKeys.map((key) => ({
          title: (() => {
            switch (key) {
              case "nom_complet":
                return "Nom & Prenom";
              case "tel":
                return "Téléphone";
              case "mail":
                return "Mail";
              case "adresse":
                return "Adresse";
              case "date_inscription":
                return "Date d'inscription";
              case "actions":
                return "Actions";
              default:
                return capitalizeFirstLetter(key.replace(/\_/g, " "));
            }
          })(),
          dataIndex: key,
          key,
          render: (text, record) => {
            if (key === "nom_complet") {
              return `${record.nom_client} ${record.prenom_client}`;
            } else if (key === "date_inscription") {
              return <Tag>{text}</Tag>;
            } else if (key === "actions") {
              return (
                <Tooltip title="Voir les détails">
                  <EyeOutlined
                    onClick={() => {
                      setSelectedClient(record);
                      setIsDetailsModalVisible(true);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                </Tooltip>
              );
            }
            return text;
          },
        }));
        setColumns(generatedColumns);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    const fetchVilles = async () => {
      try {
        const response = await fetch(
          "https://fithouse.pythonanywhere.com/api/villes/"
        );
        const data = await response.json();
        setVilles(
          data.data.map((ville) => ({
            value: ville.id_ville,
            label: ville.nom_ville,
          }))
        );
      } catch (error) {
        console.error("Error fetching villes:", error);
      }
    };

    fetchVilles();
    fetchData();
  }, [authToken, update, add]);

  // Function to capitalize the first letter of a string
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = data.filter((item) =>
      item.nom_client.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  // Row selection object indicates the need for row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys);
      console.log("selectedRowKeys changed: ", selectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === "Disabled User", // Disable checkbox for specific rows
    }),
  };

  // Handle edit button click
  const handleEditClick = () => {
    if (selectedRowKeys.length === 1) {
      const clientToEdit = data.find(
        (client) => client.key === selectedRowKeys[0]
      );
      setEditingClient(clientToEdit);
      console.log(clientToEdit);
      form.setFieldsValue(clientToEdit);
      setIsModalVisible(true);
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { date_naissance, newsletter, password } = values;

      // Check if date_naissance is not empty
      if (!date_naissance) {
        message.error("Veuillez entrer la date de naissance");
        return;
      }

      // Check if newsletter is not empty
      if (newsletter === null) {
        message.error("Veuillez sélectionner l'option de newsletter");
        return;
      }

      if (values.password == "" || values.password == undefined) {
        values.password = null;
      }

      console.log(values.password);

      // Add id_client to the values object
      values.id_client = editingClient.key;

      const response = await fetch(
        `https://fithouse.pythonanywhere.com/api/clients/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(values),
        }
      );

      if (response.ok) {
        const updatedClient = await response.json();
        const updatedData = data.map((client) =>
          client.key === editingClient.key ? updatedClient : client
        );
        setUpdate(updatedData);
        setData(updatedData);
        setFilteredData(updatedData);
        message.success("Client mis à jour avec succès");
        const id_staff = JSON.parse(localStorage.getItem("data"));
        const res = await addNewTrace(
          id_staff[0].id_employe,
          "Modification",
          getCurrentDate(),
          `${JSON.stringify(changedFields)}`,
          "client"
        );
        console.log("====================================");
        console.log(res);
        console.log("====================================");
        setChangedFields([]);
        setIsFormChanged(false);
        setIsModalVisible(false);
        setEditingClient(null);
        setSelectedRowKeys([]);
        // Reset the form fields
        form.resetFields();
      } else {
        message.error("Erreur lors de la mise à jour du client");
      }
    } catch (error) {
      console.error("Error updating client:", error);
      message.error("An error occurred while updating the client");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setChangedFields([]);
    setIsFormChanged(false);
    setEditingClient(null);
  };

  const handleDelete = async () => {
    if (selectedRowKeys.length >= 1) {
      try {
        const promises = selectedRowKeys.map(async (key) => {
          const clientToDelete = data.find((client) => client.key === key);
          console.log(clientToDelete);
          const response = await fetch(
            `https://fithouse.pythonanywhere.com/api/clients/${clientToDelete.id_client}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify(clientToDelete),
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to delete client with key ${key}`);
          }
          const id_staff = JSON.parse(localStorage.getItem("data"));
          const res = await addNewTrace(
            id_staff[0].id_employe,
            "Supprimer",
            getCurrentDate(),
            `${JSON.stringify(clientToDelete)}`,
            "client"
          );
        });

        await Promise.all(promises);

        const updatedData = data.filter(
          (client) => !selectedRowKeys.includes(client.key)
        );
        setData(updatedData);
        setFilteredData(updatedData);
        setSelectedRowKeys([]);
        message.success(
          `${selectedRowKeys.length} client(s) supprimé(s) avec succès`
        );
      } catch (error) {
        console.error("Error deleting clients:", error);
        message.error("An error occurred while deleting clients");
      }
    }
  };

  const confirm = (e) => {
    handleDelete();
  };

  const cancel = (e) => {
    console.log(e);
  };

  const handleFormChange = (changedValues, allValues) => {
    const formatFieldName = (name) => {
      return name.replace("_", " ");
    };

    setChangedFields((prevFields) => {
      const updatedFields = [...prevFields];
      Object.keys(changedValues).forEach((key) => {
        const newField = {
          name: formatFieldName(key),
          oldValue: editingClient[key], // Use editingClient instead of selectedRecord
          newValue: changedValues[key],
        };
        const existingIndex = updatedFields.findIndex(
          (field) => field.name === newField.name
        );
        if (existingIndex !== -1) {
          // Update existing field
          updatedFields[existingIndex] = newField;
        } else {
          // Add new field
          updatedFields.push(newField);
        }
      });
      return updatedFields;
    });

    setIsFormChanged(true);
  };

  const exportToExcel = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one client to export");
      return;
    }

    const selectedData = data.filter((item) =>
      selectedRowKeys.includes(item.key)
    );

    const ws = XLSX.utils.json_to_sheet(selectedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");

    // Generate Excel File & Download
    XLSX.writeFile(wb, "clients_export.xlsx");
  };

  const validateAge = (birthDate) => {
    const today = moment();
    const birth = moment(birthDate);
    const age = today.diff(birth, "years");
    return age >= 16;
  };

  const handleDateChange = (e) => {
    const newBirthDate = e.target.value;
    if (validateAge(newBirthDate)) {
      setClientData({
        ...ClientData,
        date_naissance: newBirthDate,
      });
      setFormErrors({
        ...formErrors,
        date_naissance: "",
      });
    } else {
      setFormErrors({
        ...formErrors,
        date_naissance: "L'âge doit être d'au moins 16 ans",
      });
      message.error("L'âge doit être d'au moins 16 ans");
    }
  };

  const [contartData, setContartData] = useState();
  const [isExportModalVisibleContart, setisExportModalVisibleContart] =
    useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://fithouse.pythonanywhere.com/api/contrat/",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const jsonData = await response.json();
        setContartData(jsonData.data);
        console.log(jsonData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  function getClientContracts(contracts, clientId) {
    // Filter contracts that match the given client ID
    if (contracts)
      return contracts.filter((contract) => contract.id_client === clientId);
  }

  const handleOpenContart = () => {
    setisExportModalVisibleContart(true);
    setIsDetailsModalVisible(false);
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]+/)) strength += 25;
    if (password.match(/[A-Z]+/)) strength += 25;
    if (password.match(/[0-9]+/)) strength += 25;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setClientData({ ...ClientData, password: newPassword });
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 25) return "#ff4d4f";
    if (strength <= 50) return "#faad14";
    if (strength <= 75) return "#52c41a";
    return "#1890ff";
  };

  return (
    <div className="w-full p-2">
      <Modal
        title="Exporter les Clients"
        visible={isExportModalVisible}
        onOk={handleExport}
        onCancel={() => setIsExportModalVisible(false)}
        okText="Exporter"
        cancelText="Annuler"
      >
        <Form layout="vertical">
          <Form.Item label="Statut">
            <Select
              value={exportFilters.statut}
              onChange={(value) =>
                setExportFilters({ ...exportFilters, statut: value })
              }
            >
              <Select.Option value={null}>Tous</Select.Option>
              <Select.Option value={true}>Actif</Select.Option>
              <Select.Option value={false}>Inactif</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Date d'inscription">
            <Space>
              <DatePicker
                placeholder="Date de début"
                value={
                  exportFilters.date_inscription_start
                    ? moment(exportFilters.date_inscription_start)
                    : null
                }
                onChange={(date) =>
                  setExportFilters({
                    ...exportFilters,
                    date_inscription_start: date
                      ? date.format("YYYY-MM-DD")
                      : null,
                  })
                }
              />
              <DatePicker
                placeholder="Date de fin"
                value={
                  exportFilters.date_inscription_end
                    ? moment(exportFilters.date_inscription_end)
                    : null
                }
                onChange={(date) =>
                  setExportFilters({
                    ...exportFilters,
                    date_inscription_end: date
                      ? date.format("YYYY-MM-DD")
                      : null,
                  })
                }
              />
            </Space>
          </Form.Item>

          <Form.Item label="Liste noire">
            <Select
              value={exportFilters.blackliste}
              onChange={(value) =>
                setExportFilters({ ...exportFilters, blackliste: value })
              }
            >
              <Select.Option value={null}>Tous</Select.Option>
              <Select.Option value={true}>Sur liste noire</Select.Option>
              <Select.Option value={false}>Pas sur liste noire</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Date de naissance">
            <Space>
              <DatePicker
                placeholder="Date de début"
                value={
                  exportFilters.date_naissance_start
                    ? moment(exportFilters.date_naissance_start)
                    : null
                }
                onChange={(date) =>
                  setExportFilters({
                    ...exportFilters,
                    date_naissance_start: date
                      ? date.format("YYYY-MM-DD")
                      : null,
                  })
                }
              />
              <DatePicker
                placeholder="Date de fin"
                value={
                  exportFilters.date_naissance_end
                    ? moment(exportFilters.date_naissance_end)
                    : null
                }
                onChange={(date) =>
                  setExportFilters({
                    ...exportFilters,
                    date_naissance_end: date ? date.format("YYYY-MM-DD") : null,
                  })
                }
              />
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={"Liste des contrats"}
        visible={isExportModalVisibleContart}
        footer={null}
        onCancel={() => setisExportModalVisibleContart(false)}
        width={"1000px"}
      >
        {(() => {
          const data = getClientContracts(
            contartData,
            selectedClient?.id_client
          );

          // Render the table only if there is data
          return (
            data &&
            data.length > 0 && (
              <Table
                className="mt-4"
                columns={[
                  { title: "Nom", dataIndex: "client", key: "client" },
                  {
                    title: "Prénom Client",
                    dataIndex: "Prenom_client",
                    key: "Prenom_client",
                  },
                  {
                    title: "Abonnement",
                    dataIndex: "abonnement",
                    key: "abonnement",
                  },
                  { title: "Catégorie", dataIndex: "cat_abn", key: "cat_abn" },
                  {
                    title: "Date Début",
                    dataIndex: "date_debut",
                    key: "date_debut",
                  },
                  { title: "Date Fin", dataIndex: "date_fin", key: "date_fin" },
                  { title: "Reste", dataIndex: "reste", key: "reste" },
                  {
                    title: "Établissement",
                    dataIndex: "etablissemnt",
                    key: "etablissemnt",
                  },
                  { title: "Type", dataIndex: "type", key: "type" },
                ]}
                dataSource={data.map((contract, index) => ({
                  key: index.toString(),
                  id_contrat: contract.id_contrat,
                  abonnement: contract.abonnement,
                  cat_abn: contract.cat_abn,
                  date_debut: contract.date_debut,
                  date_fin: contract.date_fin,
                  reste: (
                    <Tag color={contract.reste > 0 ? "red" : "green"}>
                      {contract.reste} MAD
                    </Tag>
                  ),
                  etablissemnt: contract.etablissemnt,
                  type: contract.type,
                  client: contract.client,
                  Prenom_client: contract.Prenom_client,
                }))}
                pagination={false}
                size="small"
                bordered
                scroll={{ x: "max-content" }} // This enables horizontal scrolling if needed
              />
            )
          );
        })()}
      </Modal>

      <Modal
        title="Détails du client"
        visible={isDetailsModalVisible}
        onCancel={handleDetailsModalCancel}
        footer={null}
        width={600}
      >
        {selectedClient && (
          <>
            {getClientContracts( contartData,
            selectedClient?.id_client).length > 0 && (
              <Button onClick={handleOpenContart} type="primary">
                Liste des contrats
              </Button>
            )}
            <Table
              className="mt-4"
              columns={[
                {
                  title: "Champ",
                  dataIndex: "field",
                  key: "field",
                  width: "40%",
                },
                { title: "Valeur", dataIndex: "value", key: "value" },
              ]}
              dataSource={[
                { key: "1", field: "Civilité", value: selectedClient.civilite },
                {
                  key: "2",
                  field: "Nom complet",
                  value: `${selectedClient.nom_client} ${selectedClient.prenom_client}`,
                },
                { key: "3", field: "Adresse", value: selectedClient.adresse },
                { key: "4", field: "Téléphone", value: selectedClient.tel },
                { key: "5", field: "Mail", value: selectedClient.mail },
                {
                  key: "9",
                  field: "Date d'inscription",
                  value: selectedClient.date_inscription,
                },
              ]}
              pagination={false}
              size="small"
              bordered
            />
          </>
        )}
      </Modal>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-7">
          <div className="w-52">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search Client"
              value={searchText}
              onChange={handleSearch}
            />
          </div>
          <div className="flex items-center space-x-6">
            {(JSON.parse(localStorage.getItem(`data`))[0].fonction ==
              "Administration" ||
              JSON.parse(localStorage.getItem(`data`))[0].fonction ==
                "secretaire") &&
            selectedRowKeys.length === 1 ? (
              <EditOutlined
                className="cursor-pointer"
                onClick={handleEditClick}
              />
            ) : (
              ""
            )}
            {(JSON.parse(localStorage.getItem("data"))[0].fonction ===
              "Administration" ||
              JSON.parse(localStorage.getItem("data"))[0].fonction ===
                "secretaire") &&
            selectedRowKeys.length == 1 ? (
              <PrinterOutlined disabled={true} />
            ) : null}
            <Button onClick={showExportModal} icon={<DownloadOutlined />}>
              Exporter vers Excel{" "}
            </Button>
          </div>
        </div>
        {/* add new client  */}
        <div>
          <div className="flex items-center space-x-3">
            {(JSON.parse(localStorage.getItem("data"))[0].fonction ===
              "Administration" ||
              JSON.parse(localStorage.getItem("data"))[0].fonction ===
                "secretaire") && (
              <Button
                type="default"
                onClick={showDrawerR}
                icon={<UserAddOutlined />}
              >
                Ajouter Client
              </Button>
            )}
          </div>
          <Drawer
            title="Saisir un nouveau client"
            width={720}
            onClose={onCloseR}
            closeIcon={false}
            open={open1}
            bodyStyle={{
              paddingBottom: 80,
            }}
          >
            <div>
              <div className="p-3 md:pt-0 md:pl-0 md:pr-10">
                <div className="">
                  <div className="mt-0 text-center pt-0 rounded-md w-full bg-slate-100">
                    <>
                      <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleChange}
                        beforeUpload={() => false} // Prevent automatic upload
                      >
                        {fileList.length >= 1 ? null : uploadButton}
                      </Upload>
                      <Modal
                        open={previewOpen}
                        title={previewTitle}
                        footer={null}
                        onCancel={handleCancel}
                      >
                        <img
                          alt="example"
                          style={{
                            width: "100%",
                            alignContent: "center",
                            alignItems: "center",
                          }}
                          src={previewImage}
                        />
                      </Modal>
                    </>{" "}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-5">
                    <div>
                      <label htmlFor="civilite" className="block font-medium">
                        *Civilité
                      </label>
                      <Select
                        id="civilite"
                        showSearch
                        placeholder="Civilité"
                        className="w-full"
                        optionFilterProp="children"
                        status={formErrors.civilite ? "error" : ""}
                        onChange={(value) =>
                          setClientData({ ...ClientData, civilite: value })
                        }
                        filterOption={(input, option) =>
                          (option?.label ?? "").startsWith(input)
                        }
                        filterSort={(optionA, optionB) =>
                          (optionA?.label ?? "")
                            .toLowerCase()
                            .localeCompare((optionB?.label ?? "").toLowerCase())
                        }
                        options={[
                          {
                            value: "Monsieur",
                            label: "Monsieur",
                          },
                          {
                            value: "Mademoiselle",
                            label: "Mademoiselle",
                          },
                        ]}
                      />
                    </div>
                    <div>
                      <label htmlFor="nom_client" className="block font-medium">
                        *Nom
                      </label>
                      <Input
                        id="nom_client"
                        size="middle"
                        placeholder="Nom"
                        value={ClientData.nom_client}
                        className={
                          formErrors.nom_client ? "border-red-500" : ""
                        }
                        onChange={(e) =>
                          setClientData({
                            ...ClientData,
                            nom_client: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="prenom_client"
                        className="block font-medium"
                      >
                        *Prénom
                      </label>
                      <Input
                        id="prenom_client"
                        size="middle"
                        placeholder="Prénom"
                        value={ClientData.prenom_client}
                        className={
                          formErrors.prenom_client ? "border-red-500" : ""
                        }
                        onChange={(e) =>
                          setClientData({
                            ...ClientData,
                            prenom_client: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label htmlFor="adresse" className="block font-medium">
                        Adresse
                      </label>
                      <Input
                        id="adresse"
                        size="middle"
                        className={formErrors.adresse ? "border-red-500" : ""}
                        placeholder="Adresse"
                        value={ClientData.adresse}
                        onChange={(e) =>
                          setClientData({
                            ...ClientData,
                            adresse: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label htmlFor="tel" className="block font-medium">
                        *Téléphone
                      </label>
                      <Input
                        id="tel"
                        size="middle"
                        status={formErrors.tel ? "error" : ""}
                        placeholder="Téléphone"
                        value={ClientData.tel}
                        onChange={handlePhoneChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="mail" className="block font-medium">
                        *Email
                      </label>
                      <Input
                        id="mail"
                        size="middle"
                        status={formErrors.mail ? "error" : ""}
                        type="danger"
                        placeholder="Email"
                        value={ClientData.mail}
                        onChange={handleEmailChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block font-medium">
                        *Mot de passe
                      </label>
                      <Input.Password
                        id="password"
                        size="middle"
                        status={formErrors.password ? "error" : ""}
                        placeholder="Mot de passe"
                        value={ClientData.password}
                        onChange={handlePasswordChange}
                      />
                      <div style={{ marginTop: "8px" }}>
                        <Progress
                          percent={passwordStrength}
                          strokeColor={getPasswordStrengthColor(
                            passwordStrength
                          )}
                          showInfo={false}
                        />
                      </div>
                      <div style={{ marginTop: "4px", fontSize: "12px" }}>
                        <div>
                          {passwordStrength >= 25 ? (
                            <CheckOutlined style={{ color: "#52c41a" }} />
                          ) : (
                            <CloseOutlined style={{ color: "#ff4d4f" }} />
                          )}{" "}
                          Au moins 8 caractères
                        </div>
                        <div>
                          {passwordStrength >= 50 ? (
                            <CheckOutlined style={{ color: "#52c41a" }} />
                          ) : (
                            <CloseOutlined style={{ color: "#ff4d4f" }} />
                          )}{" "}
                          Contient des minuscules et des majuscules
                        </div>
                        <div>
                          {passwordStrength >= 75 ? (
                            <CheckOutlined style={{ color: "#52c41a" }} />
                          ) : (
                            <CloseOutlined style={{ color: "#ff4d4f" }} />
                          )}{" "}
                          Contient des chiffres
                        </div>
                        <div>
                          {passwordStrength === 100 ? (
                            <CheckOutlined style={{ color: "#52c41a" }} />
                          ) : (
                            <CloseOutlined style={{ color: "#ff4d4f" }} />
                          )}{" "}
                          Mot de passe fort
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cin" className="block font-medium">
                        *CIN
                      </label>
                      <Input
                        id="cin"
                        className={formErrors.cin ? "border-red-500" : ""}
                        size="middle"
                        placeholder="CIN"
                        value={ClientData.cin}
                        onChange={(e) =>
                          setClientData({ ...ClientData, cin: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label htmlFor="ville" className="block font-medium">
                        Ville
                      </label>
                      <Select
                        id="ville"
                        showSearch
                        placeholder="Ville"
                        className="w-full"
                        status={formErrors.ville ? "error" : ""}
                        optionFilterProp="children"
                        onChange={(value) =>
                          setClientData({ ...ClientData, ville: value })
                        }
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={[
                          { value: "1", label: "Fes" },
                          { value: "2", label: "Rabat" },
                          { value: "3", label: "Casablanca" },
                          { value: "4", label: "Marrakech" },
                          { value: "5", label: "Tangier" },
                          { value: "6", label: "Agadir" },
                          { value: "7", label: "Meknes" },
                          { value: "8", label: "Oujda" },
                          { value: "9", label: "Kenitra" },
                          { value: "10", label: "Tetouan" },
                          { value: "11", label: "Safi" },
                          { value: "12", label: "El Jadida" },
                          { value: "13", label: "Khouribga" },
                          { value: "14", label: "Beni Mellal" },
                          { value: "15", label: "Nador" },
                          { value: "16", label: "Ksar el-Kebir" },
                          { value: "17", label: "Larache" },
                          { value: "18", label: "Khemisset" },
                          { value: "19", label: "Guelmim" },
                          { value: "20", label: "Taza" },
                          { value: "21", label: "Mohammedia" },
                          { value: "22", label: "Errachidia" },
                          { value: "23", label: "Ouarzazate" },
                          { value: "24", label: "Al Hoceima" },
                          { value: "25", label: "Settat" },
                          { value: "26", label: "Sidi Kacem" },
                          { value: "27", label: "Berkane" },
                          { value: "28", label: "Tiznit" },
                          { value: "29", label: "Taourirt" },
                          { value: "30", label: "Youssoufia" },
                          { value: "31", label: "Sidi Slimane" },
                          { value: "32", label: "Azrou" },
                          { value: "33", label: "Tan-Tan" },
                          { value: "34", label: "Boujdour" },
                          { value: "35", label: "Laayoune" },
                          { value: "36", label: "Dakhla" },
                          { value: "37", label: "Taroudant" },
                          { value: "38", label: "Chichaoua" },
                          { value: "39", label: "Guercif" },
                          { value: "40", label: "Tarfaya" },
                        ]}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="date_naissance"
                        className="block font-medium"
                      >
                        *Date de naissance
                      </label>
                      <Tooltip title="Date de naissance">
                        <Input
                          id="date_naissance"
                          size="middle"
                          className={
                            formErrors.date_naissance
                              ? "border-1 border-red-500"
                              : ""
                          }
                          type="date"
                          placeholder="Date de naissance"
                          value={ClientData.date_naissance}
                          onChange={handleDateChange}
                          max={moment()
                            .subtract(10, "years")
                            .format("YYYY-MM-DD")}
                        />
                      </Tooltip>
                    </div>
                    <div>
                      <label
                        htmlFor="date_inscription"
                        className="block font-medium"
                      >
                        *Date d'inscription
                      </label>
                      <Tooltip title="Date d'inscription">
                        <Input
                          id="date_inscription"
                          className={
                            formErrors.date_inscription ? "border-red-500" : ""
                          }
                          size="middle"
                          type="date"
                          placeholder="Date d'inscription"
                          value={ClientData.date_inscription}
                          // disabled={true}
                          onChange={(e) =>
                            setClientData({
                              ...ClientData,
                              date_inscription: e.target.value,
                            })
                          }
                        />
                      </Tooltip>
                    </div>
                    <div>
                      <label htmlFor="statut" className="block font-medium">
                        *Status
                      </label>
                      <Select
                        id="statut"
                        className="w-full"
                        showSearch
                        placeholder="Status"
                        optionFilterProp="children"
                        onChange={(value) =>
                          setClientData({ ...ClientData, statut: value })
                        }
                        filterOption={(input, option) =>
                          (option?.label ?? "").startsWith(input)
                        }
                        filterSort={(optionA, optionB) =>
                          (optionA?.label ?? "")
                            .toLowerCase()
                            .localeCompare((optionB?.label ?? "").toLowerCase())
                        }
                        options={[
                          {
                            value: "1",
                            label: "Active",
                          },
                          {
                            value: "2",
                            label: "Inactive",
                          },
                        ]}
                      />
                    </div>
                    <div className="flex items-center mt-3">
                      <Tag
                        style={{ fontSize: 14 }}
                        htmlFor="blackliste"
                        className="font-medium ml-1 w-28 text-lg"
                      >
                        *Blackliste
                      </Tag>
                      <Input
                        id="blackliste"
                        size="middle"
                        type="checkbox"
                        checked={ClientData.blackliste}
                        onChange={(e) =>
                          setClientData({
                            ...ClientData,
                            blackliste: e.target.checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center mt-3">
                      <Tag
                        style={{ fontSize: 14 }}
                        htmlFor="newsletter"
                        className="font-medium ml-1 w-28"
                      >
                        *Newsletter
                      </Tag>
                      <Input
                        id="newsletter"
                        size="middle"
                        type="checkbox"
                        checked={ClientData.newsletter}
                        onChange={(e) =>
                          setClientData({
                            ...ClientData,
                            newsletter: e.target.checked,
                          })
                        }
                      />
                    </div>
                    {/* UploadImage component already included */}
                  </div>
                </div>
                <Space className="mt-10">
                  <Button danger onClick={onCloseR}>
                    Annuler
                  </Button>
                  <Button onClick={handleRoomSubmit} type="default">
                    Enregistrer
                  </Button>
                </Space>
              </div>
            </div>
          </Drawer>
        </div>
      </div>
      <Table
        loading={loading}
        pagination={{
          pageSize: 7,
          showQuickJumper: true,
        }}
        size="small"
        className="w-full mt-5"
        columns={columns}
        dataSource={filteredData}
        rowSelection={rowSelection}
      />
      <Modal
        title="Edit Client"
        visible={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={handleModalCancel}
        okButtonProps={{ disabled: !isFormChanged }}
        okText="Soumettre"
        cancelText="Annuler"
      >
        <div className="h-96 overflow-y-auto">
          <Form onValuesChange={handleFormChange} form={form} layout="vertical">
            <Form.Item name="civilite" label="Civilité">
              <Select>
                <Select.Option value="Monsieur">Monsieur</Select.Option>
                <Select.Option value="Mademoiselle">Mademoiselle</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="nom_client"
              label="Nom"
              rules={[{ required: true, message: "Please input the name!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="prenom_client"
              label="Prénom"
              rules={[{ required: true, message: "Please input Prénom!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="adresse" label="Adresse">
              <Input />
            </Form.Item>
            <Form.Item
              name="tel"
              label="Téléphone"
              rules={[
                {
                  required: true,
                  message: "Veuillez saisir un numéro de téléphone!",
                },
                {
                  validator: (_, value) =>
                    validateMoroccanPhoneNumber(value)
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Numéro de téléphone marocain invalide")
                        ),
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="mail"
              label="Email"
              rules={[
                {
                  required: true,
                  message: "Veuillez saisir une adresse email!",
                },
                {
                  validator: (_, value) =>
                    validateEmail(value)
                      ? Promise.resolve()
                      : Promise.reject(new Error("Adresse email invalide")),
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="password" label="Password">
              <Input />
            </Form.Item>
            <Form.Item name="cin" label="CIN">
              <Input />
            </Form.Item>
            <Form.Item name="ville" label="Ville">
              <Select>
                <Select.Option value="1">Fes</Select.Option>
                <Select.Option value="2">Rabat</Select.Option>
                <Select.Option value="3">Casablanca</Select.Option>
                <Select.Option value="4">Marrakech</Select.Option>
                <Select.Option value="5">Tangier</Select.Option>
                <Select.Option value="6">Agadir</Select.Option>
                <Select.Option value="7">Meknes</Select.Option>
                <Select.Option value="8">Oujda</Select.Option>
                <Select.Option value="9">Kenitra</Select.Option>
                <Select.Option value="10">Tetouan</Select.Option>
                <Select.Option value="11">Safi</Select.Option>
                <Select.Option value="12">El Jadida</Select.Option>
                <Select.Option value="13">Khouribga</Select.Option>
                <Select.Option value="14">Beni Mellal</Select.Option>
                <Select.Option value="15">Nador</Select.Option>
                <Select.Option value="16">Ksar el-Kebir</Select.Option>
                <Select.Option value="17">Larache</Select.Option>
                <Select.Option value="18">Khemisset</Select.Option>
                <Select.Option value="19">Guelmim</Select.Option>
                <Select.Option value="20">Taza</Select.Option>
                <Select.Option value="21">Mohammedia</Select.Option>
                <Select.Option value="22">Errachidia</Select.Option>
                <Select.Option value="23">Ouarzazate</Select.Option>
                <Select.Option value="24">Al Hoceima</Select.Option>
                <Select.Option value="25">Settat</Select.Option>
                <Select.Option value="26">Sidi Kacem</Select.Option>
                <Select.Option value="27">Berkane</Select.Option>
                <Select.Option value="28">Tiznit</Select.Option>
                <Select.Option value="29">Taourirt</Select.Option>
                <Select.Option value="30">Youssoufia</Select.Option>
                <Select.Option value="31">Sidi Slimane</Select.Option>
                <Select.Option value="32">Azrou</Select.Option>
                <Select.Option value="33">Tan-Tan</Select.Option>
                <Select.Option value="34">Boujdour</Select.Option>
                <Select.Option value="35">Laayoune</Select.Option>
                <Select.Option value="36">Dakhla</Select.Option>
                <Select.Option value="37">Taroudant</Select.Option>
                <Select.Option value="38">Chichaoua</Select.Option>
                <Select.Option value="39">Guercif</Select.Option>
                <Select.Option value="40">Tarfaya</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="date_naissance"
              label="Date de naissance"
              rules={[
                { required: true, message: "Please input Date de naissance!" },
              ]}
            >
              <Input type="date" />
            </Form.Item>
            <Form.Item name="date_inscription" label="Date d'inscription">
              <Input type="date" disabled />
            </Form.Item>
            <Form.Item name="statut" label="Status">
              <Select>
                <Select.Option value={true}>Active</Select.Option>
                <Select.Option value={false}>Inactive</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="blackliste"
              valuePropName="checked"
              label="Blackliste"
              className=""
            >
              <Input type="checkbox" />
            </Form.Item>
            <Form.Item
              name="newsletter"
              valuePropName="checked"
              label="Newsletter"
            >
              <Input type="checkbox" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default TableClient;
