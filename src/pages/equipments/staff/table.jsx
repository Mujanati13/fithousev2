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
  Progress,
} from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  EyeInvisibleOutlined,
  CloseOutlined,
  CheckOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import {
  addNewTrace,
  getCurrentDate,
  isEighteenYearsApart,
  validateEmail,
  validateMoroccanPhoneNumber,
} from "../../../utils/helper";
import UploadImage from "../../../utils/uploadImages";

const TableStaff = () => {
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
  const [detailsData, setDetailsData] = useState(null);
  const [imagePath, setimagePath] = useState("/staff/avatar.png");
  const [changedFields, setChangedFields] = useState([]);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [editFileList, setEditFileList] = useState([]);
  const [formErrors, setFormErrors] = useState({
    tel: "",
    mail: "",
  });
  const [ClientData, setClientData] = useState({
    civilite: "",
    nom: "",
    prenom: "",
    adresse: "",
    tel: "",
    mail: "",
    validite_CIN: "",
    cin: "",
    ville: null,
    date_naissance: "",
    date_inscription: getCurrentDate(),
    statut: true,
    blackliste: false,
    newsletter: true,
    nom_ville: "",
    date_recrutement: "",
    password: null,
    fonction: "",
    image: imagePath,
  });
  const [sortedInfo, setSortedInfo] = useState({});
  const handleChange2 = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
};
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
    formData.append("path", "staff/");

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

  // Validation function to check if all required fields are filled for the room form
  const isFormValid = () => {
    const requiredFields = ["nom", "prenom", "date_naissance"];
    return requiredFields.every((field) => ClientData[field]);
  };
  const handleViewDetails = (record) => {
    setDetailsData(record);
    setIsDetailsModalVisible(true);
  };

  const addClient = async () => {
    // Check if the form is valid
    if (!isFormValid()) {
      message.warning("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (
      !validateEmail(ClientData.mail) ||
      !validateMoroccanPhoneNumber(ClientData.tel)
    ) {
      message.warning(
        "Veuillez vérifier votre email ou numéro de téléphone car il a un mauvais format."
      );
      return;
    }

    // Check if the date difference is exactly 18 years
    try {
      if (
        !isEighteenYearsApart(
          ClientData.date_naissance,
          ClientData.date_recrutement
        )
      ) {
        message.warning(
          "La différence entre date de naissance et date de recrutement n'est pas exactement de 18 ans."
        );
        return;
      }
    } catch (error) {
      message.warning(error.message);
      return;
    }

    // Convert 'ville' to integer
    ClientData.ville = parseInt(ClientData.ville);
    ClientData.validite_CIN = getCurrentDate();
    await handleUploadImage();
    // Send the data to the server
    try {
      const response = await fetch(
        "https://fithouse.pythonanywhere.com/api/staff/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ClientData),
        }
      );

      if (response.ok) {
        const res = await response.json();
        if (res.msg === "Added Successfully!!e") {
          message.success("Personnel ajouté avec succès");
          setAdd(Math.random() * 1000);
          setClientData({
            civilite: "",
            nom: "",
            prenom: "",
            adresse: "",
            tel: "",
            mail: "",
            validite_CIN: "",
            cin: "",
            ville: null,
            date_naissance: "",
            date_inscription: getCurrentDate(),
            statut: true,
            blackliste: false,
            newsletter: true,
            nom_ville: "",
            date_recrutement: "",
            password: null,
            fonction: "",
            image: imagePath,
          });
          const id_staff = JSON.parse(localStorage.getItem("data"));
          const res = await addNewTrace(
            id_staff[0].id_employe,
            "Ajout",
            getCurrentDate(),
            `${JSON.stringify(ClientData)}`,
            "staff"
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
      console.error(error);
      message.error("Error adding chamber");
    }
  };

  const showDrawerR = () => {
    setOpen1(true);
  };

  const onCloseR = () => {
    setOpen1(false);
    setClientData({
      civilite: "",
      nom: "",
      prenom: "",
      adresse: "",
      tel: "",
      mail: "",
      validite_CIN: "",
      cin: "",
      ville: null,
      date_naissance: "",
      date_inscription: getCurrentDate(),
      statut: true,
      blackliste: false,
      newsletter: true,
      nom_ville: "",
      date_recrutement: "",
      password: null,
      fonction: "",
      image: imagePath,
    });
  };

  // Function to handle form submission in the room drawer
  const handleRoomSubmit = () => {
    addClient();
  };

  const authToken = localStorage.getItem("jwtToken"); // Replace with your actual auth token

  const filterData = (data, searchText, statusFilter) => {
    const filtered = data.filter((item) => {
      const nameMatch = `${item.prenom} ${item.nom}`
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "active" && item.statut) ||
        (statusFilter === "inactive" && !item.statut);
      return nameMatch && statusMatch;
    });
    setFilteredData(filtered);
  };
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                "  https://fithouse.pythonanywhere.com/api/staff/",
                {
                    headers: {
                        "Authorization": `Bearer ${authToken}`,
                    },
                }
            );
            const jsonData = await response.json();

            const processedData = jsonData.data.map((item, index) => ({
                ...item,
                key: item.id_coach || index,
                nom_complet: `${item.prenom} ${item.nom}`,
            }));

            setData(processedData);
            setFilteredData(processedData);
            filterData(processedData, searchText, statusFilter);

            const desiredKeys = [
                "nom_complet",
                "fonction",
                "tel",
                "mail",
                "date_recrutement",
                "actions",
            ];

            const generatedColumns = desiredKeys.map((key) => {
                const columnConfig = {
                    title: getColumnTitle(key),
                    dataIndex: key,
                    key,
                    sorter: getSorter(key),
                    sortOrder: sortedInfo.columnKey === key && sortedInfo.order,
                    render: getRender(key),
                };

                // Add filters for specific columns
                if (["nom_complet", "fonction"].includes(key)) {
                    columnConfig.filters = getFilters(processedData, key);
                    columnConfig.onFilter = (value, record) => record[key].indexOf(value) === 0;
                }

                return columnConfig;
            });

            setColumns(generatedColumns);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    fetchData();
}, [authToken, update, add, sortedInfo, searchText, statusFilter]);

function getColumnTitle(key) {
    const titles = {
        nom_complet: "Nom complet",
        fonction: "Fonction",
        tel: "Téléphone",
        mail: "Mail",
        date_recrutement: "Date de recrutement",
        actions: "Actions",
    };
    return titles[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

function getSorter(key) {
    if (key === "nom_complet") {
        return (a, b) => a[key].localeCompare(b[key]);
    }
    if (key === "date_recrutement") {
        return (a, b) => new Date(a[key]) - new Date(b[key]);
    }
    return null;
}

function getRender(key) {
    if (key === "actions") {
        return (text, record) => (
            <EyeOutlined
                style={{ fontSize: "16px", color: "#08c" }}
                onClick={() => handleViewDetails(record)}
            />
        );
    }
    return undefined;
}

function getFilters(data, key) {
    const uniqueValues = [...new Set(data.map(item => item[key]))];
    return uniqueValues.map(value => ({ text: value, value }));
}
  // Function to capitalize the first letter of a string
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    filterData(data, value, statusFilter);
  };
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    filterData(data, searchText, value);
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
      form.setFieldsValue(clientToEdit);
      setEditFileList([
        {
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: `https://fithouse.pythonanywhere.com/media/${clientToEdit.image}`,
        },
      ]);
      setIsModalVisible(true);
    }
  };
  const handleEditUploadChange = ({ fileList: newFileList }) => {
    setEditFileList(newFileList);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Handle image upload if a new image was selected
      if (editFileList.length > 0 && editFileList[0].originFileObj) {
        const formData = new FormData();
        formData.append("uploadedFile", editFileList[0].originFileObj);
        formData.append("path", "staff/");

        const imageResponse = await fetch(
          "https://fithouse.pythonanywhere.com/api/saveImage/",
          {
            method: "POST",
            body: formData,
          }
        );

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          values.image = imageData.path;
        } else {
          message.error("Failed to upload image");
          return;
        }
      }
      values.id_employe = editingClient.id_employe
      values.date_recrutement = editingClient.date_recrutement
      values.validite_CIN = editingClient.validite_CIN
      values.ville = 1

      // ... (rest of the submit logic remains the same)

      const response = await fetch(
        `https://fithouse.pythonanywhere.com/api/staff/`,
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
        // ... (update logic remains the same)
        message.success("Staff mis à jour avec succès");
        setIsModalVisible(false);
        setEditingClient(null);
        setSelectedRowKeys([]);
        setEditFileList([]);
        form.resetFields();
      } else {
        message.error("Erreur lors de la mise à jour du staff");
      }
    } catch (error) {
      console.error("Error updating staff:", error);
      message.error("An error occurred while updating the staff");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingClient(null);
    setChangedFields([]);
    setIsFormChanged(false);
  };

  const handleDelete = async () => {
    if (selectedRowKeys.length >= 1) {
      try {
        const promises = selectedRowKeys.map(async (key) => {
          const clientToDelete = data.find((client) => client.key === key);
          console.log(clientToDelete);
          const response = await fetch(
            `https://fithouse.pythonanywhere.com/api/staff/${clientToDelete.id_employe}`,
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
            throw new Error(`Failed to delete staff with key ${key}`);
          }
          const id_staff = JSON.parse(localStorage.getItem("data"));
          const res = await addNewTrace(
            id_staff[0].id_employe,
            "Supprimer",
            getCurrentDate(),
            `${JSON.stringify(clientToDelete)}`,
            "staff"
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
          `${selectedRowKeys.length} staff(s) supprimé(s) avec succès`
        );
      } catch (error) {
        console.error("Error deleting clients:", error);
        message.error("An error occurred while deleting clients");
      }
    }
  };

  const confirm = (e) => {
    handleDelete();
    setClientData({
      civilite: "",
      nom: "",
      prenom: "",
      adresse: "",
      tel: "",
      mail: "",
      validite_CIN: "",
      cin: "",
      ville: null,
      date_naissance: "",
      date_inscription: getCurrentDate(),
      statut: true,
      blackliste: false,
      newsletter: true,
      nom_ville: "",
      date_recrutement: "",
      password: null,
      fonction: "",
    });
  };

  const cancel = (e) => {
    console.log(e);
    setClientData({
      civilite: "",
      nom: "",
      prenom: "",
      adresse: "",
      tel: "",
      mail: "",
      validite_CIN: "",
      cin: "",
      ville: null,
      date_naissance: "",
      date_inscription: getCurrentDate(),
      statut: true,
      blackliste: false,
      newsletter: true,
      nom_ville: "",
      date_recrutement: "",
      password: null,
      fonction: "",
    });
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
        title="Informations : Membre du Staff"
        visible={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
        width={600}
      >
        {detailsData && (
          <Table
            columns={[
              {
                title: "",
                dataIndex: "field",
                key: "field",
                render: (text, record, index) => <strong>{text}</strong>,
              },
              {
                title: "",
                dataIndex: "value",
                key: "value",
              },
            ]}
            dataSource={[
              {
                key: 1,
                field: "Nom et prénom",
                value: `${detailsData.prenom} ${detailsData.nom}`,
              },
              { key: 2, field: "Fonction", value: detailsData.fonction },
              { key: 3, field: "Téléphone", value: detailsData.tel },
              { key: 4, field: "Mail", value: detailsData.mail },
              { key: 5, field: "Adresse", value: detailsData.adresse },
              {
                key: 7,
                field: "Date de recrutement",
                value: detailsData.date_recrutement,
              },
            ]}
            pagination={false}
            showHeader={false}
            size="small"
          />
        )}
      </Modal>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-7">
          <div className="w-52">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search Staff"
              value={searchText}
              onChange={handleSearch}
            />
          </div>
          <div className="w-40">
            <Select
              style={{ width: "100%" }}
              placeholder="Filtrer par statut"
              onChange={handleStatusFilterChange}
              value={statusFilter}
            >
              <Select.Option value="all">Tous</Select.Option>
              <Select.Option value="active">Actif</Select.Option>
              <Select.Option value="inactive">Inactif</Select.Option>
            </Select>
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
            {/* {selectedRowKeys.length >= 1 ? (
              <Popconfirm
                title="Supprimer le personnel"
                description="Êtes-vous sûr de supprimer ce personnel ?"
                onConfirm={confirm}
                onCancel={cancel}
                okText="Yes"
                cancelText="No"
              >
                <DeleteOutlined className="cursor-pointer" />{" "}
              </Popconfirm>
            ) : (
              ""
            )} */}
          </div>
        </div>
        {/* add new client  */}
        <div>
          <div className="flex items-center space-x-3">
            {(JSON.parse(localStorage.getItem(`data`))[0].fonction ==
              "Administration" ||
              JSON.parse(localStorage.getItem(`data`))[0].fonction ==
                "secretaire") && (
              <Button
                type="default"
                onClick={showDrawerR}
                icon={<UserAddOutlined />}
              >
                Ajoute Satff
              </Button>
            )}
          </div>
          <Drawer
            title="Saisir un nouveau membre du personnel"
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
                      {/* <Button
                        className="cursor-pointer"
                        onClick={handleUploadImage}
                        style={{ marginTop: 8 }}
                      >
                        Upload
                      </Button> */}
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
                        value={ClientData.civilite}
                        optionFilterProp="children"
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
                      <label htmlFor="nom_coach" className="block font-medium">
                        *Nom
                      </label>
                      <Input
                        id="nom_coach"
                        size="middle"
                        placeholder="Nom"
                        value={ClientData.nom}
                        onChange={(e) =>
                          setClientData({
                            ...ClientData,
                            nom: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="prenom_coach"
                        className="block font-medium"
                      >
                        *Prénom
                      </label>
                      <Input
                        id="prenom_client"
                        size="middle"
                        placeholder="Prénom"
                        value={ClientData.prenom}
                        onChange={(e) =>
                          setClientData({
                            ...ClientData,
                            prenom: e.target.value,
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
                        placeholder="Téléphone"
                        status={formErrors.tel ? "error" : ""}
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
                        placeholder="Email"
                        value={ClientData.mail}
                        status={formErrors.mail ? "error" : ""}
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
                        value={ClientData.ville}
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
                          type="date"
                          placeholder="Date de naissance"
                          value={ClientData.date_naissance}
                          onChange={(e) =>
                            setClientData({
                              ...ClientData,
                              date_naissance: e.target.value,
                            })
                          }
                        />
                      </Tooltip>
                    </div>
                    <div>
                      <label
                        htmlFor="date_naissance"
                        className="block font-medium"
                      >
                        *Date de recrutement
                      </label>
                      <Tooltip title="Date de recrutement">
                        <Input
                          id="date_naissance"
                          size="middle"
                          type="date"
                          placeholder="Date de recrutement"
                          value={ClientData.date_recrutement}
                          onChange={(e) =>
                            setClientData({
                              ...ClientData,
                              date_recrutement: e.target.value,
                            })
                          }
                        />
                      </Tooltip>
                    </div>
                    {/* <div>
                      <label
                        htmlFor="date_inscription"
                        className="block font-medium"
                      >
                        *Date d'inscription
                      </label>
                      <Tooltip title="Date d'inscription">
                        <Input
                          id="date_inscription"
                          size="middle"
                          type="date"
                          placeholder="Date d'inscription"
                          value={ClientData.date_inscription}
                          disabled={true}
                          onChange={(e) =>
                            setClientData({
                              ...ClientData,
                              date_inscription: e.target.value,
                            })
                          }
                        />
                      </Tooltip>
                    </div> */}
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
                    <div>
                      <label htmlFor="fonction" className="block font-medium">
                        Fonction
                      </label>
                      <Select
                        id="fonction"
                        showSearch
                        placeholder="Fonctions"
                        className="w-full"
                        optionFilterProp="children"
                        onChange={(value) =>
                          setClientData({ ...ClientData, fonction: value })
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
                            value: "Coach",
                            label: "Coach",
                          },
                          // {
                          //   value: "Recption",
                          //   label: "Recption",
                          // },
                          // {
                          //   value: "Commercial",
                          //   label: "Commercial",
                          // },
                          {
                            value: "Administration",
                            label: "Administration",
                          },
                          {
                            value: "secretaire",
                            label: "secretaire",
                          },
                          // {
                          //   value: "autres",
                          //   label: "autres",
                          // },
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
        onChange={handleChange2}
      />
      <Modal
        title="Modifier Staff"
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
              name="nom"
              label="Nom"
              rules={[{ required: true, message: "Please input the name!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="prenom"
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
                  message: "Veuillez saisir le numéro de téléphone!",
                },
                {
                  validator: (_, value) =>
                    validateMoroccanPhoneNumber(value)
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Numéro de téléphone invalide")
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
                { required: true, message: "Veuillez saisir l'email!" },
                {
                  validator: (_, value) =>
                    validateEmail(value)
                      ? Promise.resolve()
                      : Promise.reject(new Error("Adresse e-mail invalide")),
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="password" label="Mot de passe" rules={[]}>
              <Input.Password
                placeholder="Entrez le nouveau mot de passe ou laissez vide"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
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
            <Form
              onValuesChange={handleFormChange}
              form={form}
              layout="vertical"
            />
            <Form.Item name="image" label="Photo">
              <Upload
                listType="picture-card"
                fileList={editFileList}
                onPreview={handlePreview}
                onChange={handleEditUploadChange}
                beforeUpload={() => false}
              >
                {editFileList.length >= 1 ? null : uploadButton}
              </Upload>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default TableStaff;
