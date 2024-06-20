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
} from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  DeleteOutlined,
  PrinterOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  getCurrentDate,
  validateEmail,
  validateMoroccanPhoneNumber,
} from "../../../utils/helper";
import UploadImage from "../../../utils/uploadImages";

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

  // State for room related data
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
  });

  // Validation function to check if all required fields are filled for the room form
  const isRoomFormValid = () => {
    return (
      ClientData.civilite !== "" &&
      ClientData.nom_client !== "" &&
      ClientData.prenom_client !== "" &&
      ClientData.adresse !== "" &&
      validateMoroccanPhoneNumber(ClientData.tel) &&
      validateEmail(ClientData.mail) &&
      ClientData.cin !== "" &&
      ClientData.ville !== "" &&
      ClientData.date_naissance !== ""
    );
  };

  // Function to add a new chamber
  const addClient = async () => {
    try {
      // Check if the form is valid before submitting
      if (!isRoomFormValid()) {
        message.warning("Veuillez remplir tous les champs obligatoires");
        return;
      }

      const response = await fetch(
        "https://fithouse.pythonanywhere.com/api/clients/",
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
          });
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

        // Generate columns based on the desired keys
        const desiredKeys = [
          "nom_client",
          "nom_ville",
          "tel",
          "mail",
          "adresse",
          "date_inscription",
          "",
        ];
        const generatedColumns = desiredKeys.map((key) => ({
          title: capitalizeFirstLetter(key.replace(/\_/g, " ")), // Capitalize the first letter
          dataIndex: key,
          key,
          render: (text, record) => {
            if (key === "sitewebetablissement") {
              return (
                <a href={text} target="_blank" rel="noopener noreferrer">
                  {text}
                </a>
              );
            } else if (key === "date_inscription") {
              return <Tag>{text}</Tag>;
            } else if (key === "") {
              return (
                <Tooltip title="View Details">
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

      // Add id_client to the values object
      values.id_client = editingClient.key;
      values.password = null;
      console.log(editingClient);

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

  return (
    <div className="w-full p-2">
      <Modal
        title="Client Details"
        visible={isDetailsModalVisible}
        onCancel={handleDetailsModalCancel}
        footer={null}
      >
        {selectedClient && (
          <div>
            <p>Civilité: {selectedClient.civilite}</p>
            <p>Nom: {selectedClient.nom_client}</p>
            <p>Prénom: {selectedClient.prenom_client}</p>
            <p>Adresse: {selectedClient.adresse}</p>
            <p>Téléphone: {selectedClient.tel}</p>
            <p>Email: {selectedClient.mail}</p>
            <p>CIN: {selectedClient.cin}</p>
            <p>Ville: {selectedClient.ville}</p>
            <p>Date de naissance: {selectedClient.date_naissance}</p>
            <p>Date d'inscription: {selectedClient.date_inscription}</p>
            <p>Status: {selectedClient.statut ? "Active" : "Inactive"}</p>
            <p>Blackliste: {selectedClient.blackliste ? "Oui" : "Non"}</p>
            <p>Newsletter: {selectedClient.newsletter ? "Oui" : "Non"}</p>
          </div>
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
            {selectedRowKeys.length === 1 ? (
              <EditOutlined
                className="cursor-pointer"
                onClick={handleEditClick}
              />
            ) : (
              ""
            )}
            {selectedRowKeys.length >= 1 ? (
              <Popconfirm
                title="Supprimer le client"
                description="Êtes-vous sûr de supprimer ce client ?"
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
            {selectedRowKeys.length >= 1 ? (
              <PrinterOutlined disabled={true} />
            ) : (
              ""
            )}
          </div>
        </div>
        {/* add new client  */}
        <div>
          <div className="flex items-center space-x-3">
            <Button
              type="default"
              onClick={showDrawerR}
              icon={<UserAddOutlined />}
            >
              Ajoute Client
            </Button>
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
                    <UploadImage />
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
                        value={ClientData.tel}
                        onChange={(e) =>
                          setClientData({ ...ClientData, tel: e.target.value })
                        }
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
                        onChange={(e) =>
                          setClientData({ ...ClientData, mail: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block font-medium">
                        *Mot de passe
                      </label>
                      <Input
                        id="password"
                        size="middle"
                        placeholder="Mot de passe"
                        value={ClientData.password}
                        onChange={(e) =>
                          setClientData({
                            ...ClientData,
                            password: e.target.value,
                          })
                        }
                      />
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
                        optionFilterProp="children"
                        onChange={(value) =>
                          setClientData({ ...ClientData, ville: value })
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
                            label: "Fes",
                          },
                          {
                            value: "2",
                            label: "Rabat",
                          },
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
      >
        <div className="h-96 overflow-y-auto">
          <Form form={form} layout="vertical">
            <Form.Item name="civilite" label="Civilité">
              <Select>
                <Select.Option value="Monsieur">Monsieur</Select.Option>
                <Select.Option value="Mademoiselle">Mademoiselle</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="civilite" label="Civilité">
              <Input />
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
            <Form.Item name="tel" label="Téléphone">
              <Input />
            </Form.Item>
            <Form.Item
              name="mail"
              label="Email"
              rules={[{ required: true, message: "Please input email!" }]}
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
