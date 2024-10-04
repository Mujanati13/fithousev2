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
  ColorPicker,
} from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  DownOutlined,
} from "@ant-design/icons";
// import moment from "moment";
// import { handlePrintContractStaff } from "../../../utils/printable/contraStaff";
import { addNewTrace, getCurrentDate } from "../../../utils/helper";

const TableCours = () => {
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
  const [staffOptions, setStaffOptions] = useState([]);
  const [add, setAdd] = useState(false);
  const [contarctClient, setcontarctClient] = useState([]);
  const [contarctStaff, setcontarctStaff] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [changedFields, setChangedFields] = useState([]);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [openColorPicker, setOpenColorPicker] = useState(false);

  // State for room related data
  const [ClientData, setClientData] = useState({
    nom_cour: "",
    description: "",
    reglement: "",
    genre: "",
    image: "cours/avatar.jpg",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://fithouse.pythonanywhere.com/api/staff/",
          {
            headers: {
              Authorization: `Bearer ${authToken}`, // Include the auth token in the headers
            },
          }
        );
        const jsonData = await response.json();
        setcontarctClient(jsonData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://fithouse.pythonanywhere.com/api/contratstaff/",
          {
            headers: {
              Authorization: `Bearer ${authToken}`, // Include the auth token in the headers
            },
          }
        );
        const jsonData = await response.json();
        setcontarctStaff(jsonData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Validation function to check if all required fields are filled for the room form
  const isRoomFormValid = () => {
    const { nom_cour, description, reglement, genre } = ClientData;
    if ((nom_cour, description, reglement, genre)) return true;
  };

  // Function to add a new chamber
  const addClient = async () => {
    // check in contra staf
    try {
      // Check if the form is valid before submitting
      if (!isRoomFormValid()) {
        message.error("Please fill in all required fields for the chamber.");
        return;
      }

      const response = await fetch(
        "https://fithouse.pythonanywhere.com/api/cours/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`, // Include the auth token in the headers
          },
          body: JSON.stringify(ClientData),
        }
      );
      if (response.ok) {
        const res = await response.json();
        if (res == "Added Successfully!!") {
          message.success("Cour ajoutée avec succès");
          setAdd(Math.random() * 1000);
          setClientData({
            nom_cour: "",
            description: "",
            reglement: "",
            genre: "",
            image: "",
          });
          const id_staff = JSON.parse(localStorage.getItem("data"));
          const res = await addNewTrace(
            id_staff[0].id_employe,
            "Ajout",
            getCurrentDate(),
            `${JSON.stringify(ClientData)}`,
            "cours"
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
      nom_cour: "",
      description: "",
      reglement: "",
      genre: "",
      image: "cours/avatar.jpg",
    });
  };

  // Function to handle form submission in the room drawer
  const handleRoomSubmit = () => {
    addClient();
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setIsViewModalVisible(true);
  };

  const authToken = localStorage.getItem("jwtToken"); // Replace with your actual auth token

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://fithouse.pythonanywhere.com/api/cours/",
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
          key: item.id_cour || index,
          nom_cours: item.nom_cour,
        }));

        setData(processedData);
        setFilteredData(processedData);

        // Generate columns based on the desired keys
        const desiredKeys = [
          "nom_cours",
          "description",
          "reglement",
          "genre",
          "",
        ];
        const generatedColumns = desiredKeys.map((key) => ({
          title: capitalizeFirstLetter(key.replace(/\_/g, " ")), // Capitalize the first letter
          dataIndex: key,
          key,
          render: (text, record) => {
            if (key === "description") {
              return <div>{text}</div>;
            } else if (key === "date_inscription") {
              return <Tag>{text}</Tag>;
            } else if (key === "") {
              return (
                <EyeOutlined
                  onClick={() => handleViewDetails(record)}
                  style={{ cursor: "pointer" }}
                />
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
      item.nom_cour.toLowerCase().includes(value)
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
      form.setFieldsValue(clientToEdit);
      setChangedFields([]);
      setIsModalVisible(true);
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { PeriodeSalaire } = values;
      console.log(editingClient);
      const response = await fetch(
        `https://fithouse.pythonanywhere.com/api/cours/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ ...values, id_cour: editingClient.id_cour }),
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
        message.success("Cour mis à jour avec succès");
        const id_staff = JSON.parse(localStorage.getItem("data"));
        const res = await addNewTrace(
          id_staff[0].id_employe,
          "Modification",
          getCurrentDate(),
          `${JSON.stringify(changedFields)}`,
          "cours"
        );
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
      message.error("An error occurred while updating the cours");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingClient(null);
    setChangedFields([]);
  };

  const handleDelete = async () => {
    if (selectedRowKeys.length >= 1) {
      try {
        const promises = selectedRowKeys.map(async (key) => {
          const clientToDelete = data.find((client) => client.key === key);
          console.log(clientToDelete);
          const response = await fetch(
            `https://fithouse.pythonanywhere.com/api/cours/${clientToDelete.id_cour}`,
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
            "cours"
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

  return (
    <div className="w-full p-2">
      <Modal
        title={`Détails de ${selectedCourse?.nom_cour}`}
        visible={isViewModalVisible}
        onCancel={() => {
          setIsViewModalVisible(false);
          setSelectedCourse(null);
        }}
        footer={null}
      >
        <Table
          columns={[
            {
              title: "Nom du Cours",
              dataIndex: "nom_cour",
              key: "nom_cour",
            },
            {
              title: "Description",
              dataIndex: "description",
              key: "description",
            },
            {
              title: "Règlement",
              dataIndex: "reglement",
              key: "reglement",
            },
            {
              title: "Genre",
              dataIndex: "genre",
              key: "genre",
            },
            // Add other details columns as needed
          ]}
          dataSource={selectedCourse ? [selectedCourse] : []}
          pagination={false}
          rowKey="id_cour"
        />
      </Modal>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-7">
          <div className="w-52">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search Cours"
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
            {(JSON.parse(localStorage.getItem(`data`))[0].fonction ==
              "Administration" ||
              JSON.parse(localStorage.getItem(`data`))[0].fonction ==
                "secretaire") &&
            selectedRowKeys.length >= 1 ? (
              <Popconfirm
                title="Supprimer le cours"
                description="Êtes-vous sûr de supprimer ce cours"
                onConfirm={confirm}
                onCancel={cancel}
                okText="Yes"
                cancelText="No"
              >
                <DeleteOutlined className="cursor-pointer" />{" "}
              </Popconfirm>
            ) : (
              ""
            )}
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
                Ajoute Cours
              </Button>
            )}
          </div>
          <Drawer
            title="Saisir un nouveau Cours"
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
                  <div className="grid grid-cols-2 gap-4 mt-5">
                    <div>
                      <div>*Nom cours</div>
                      <Input
                        value={ClientData.nom_cour}
                        onChange={(value) =>
                          setClientData({
                            ...ClientData,
                            nom_cour: value.target.value,
                          })
                        }
                        placeholder="Nom cours"
                      ></Input>
                    </div>
                    <div>
                      <div>*Description</div>
                      <Input
                        value={ClientData.description}
                        onChange={(value) =>
                          setClientData({
                            ...ClientData,
                            description: value.target.value,
                          })
                        }
                        placeholder="Description"
                      ></Input>
                    </div>
                    <div>
                      <div>*Reglement</div>
                      <Input
                        value={ClientData.reglement}
                        onChange={(value) =>
                          setClientData({
                            ...ClientData,
                            reglement: value.target.value,
                          })
                        }
                        placeholder="Reglement"
                      ></Input>
                    </div>
                    <div>
                      <label htmlFor="Année" className="block font-medium">
                        *Genre
                      </label>
                      <Select
                        id="Genre"
                        showSearch
                        placeholder="Genre"
                        value={ClientData.genre}
                        className="w-full"
                        optionFilterProp="children"
                        onChange={(value, option) => {
                          setClientData({
                            ...ClientData,
                            genre: value,
                          });
                        }}
                        filterOption={(input, option) =>
                          (option?.label ?? "").startsWith(input)
                        }
                        filterSort={(optionA, optionB) =>
                          (optionA?.label ?? "")
                            .toLowerCase()
                            .localeCompare((optionB?.label ?? "").toLowerCase())
                        }
                        options={[
                          { value: "Homme", label: "Homme" },
                          { value: "Femme", label: "Femme" },
                          { value: "Mixte", label: "Mixte" },
                          { value: "Junior", label: "Junior" },
                        ]}
                      />
                    </div>
                  </div>
                  <div className="mt-5">
                    <div>Sélectionner le color de cour</div>
                    <ColorPicker
                      className="mt-3"
                      defaultValue="#1677ff"
                      trigger="hover"
                    />
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
        title="Edit Cours"
        visible={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={handleModalCancel}
        okButtonProps={{ disabled: !isFormChanged }}
        okText="Soumettre"
        cancelText="Annuler"
      >
        <div className="h-96 overflow-y-auto">
          <Form onValuesChange={handleFormChange} form={form} layout="vertical">
            <Form.Item name="nom_cour" label="Nom cours">
              <Input rules={[{ required: true, message: "Nom cours" }]} />
            </Form.Item>
            <Form.Item name="description" label="description">
              <Input rules={[{ required: true, message: "description" }]} />
            </Form.Item>
            <Form.Item name="reglement" label="reglement">
              <Input rules={[{ required: true, message: "reglement" }]} />
            </Form.Item>
            <Form.Item
              name="genre"
              label="Genre"
              rules={[
                { required: true, message: "Gene selection is required" },
              ]}
            >
              <Select placeholder="Select a gene">
                <Option value="Homme">Homme</Option>
                <Option value="Femme">Femme</Option>
                <Option value="Mixte">Mixte</Option>
                <Option value="Junior">Junior</Option>
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default TableCours;
