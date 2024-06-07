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
  Card,
  Segmented,
} from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  DeleteOutlined,
  PrinterOutlined,
  EditOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import {
  getCurrentDate,
  convertToDateTime,
  getTimeInHHMM,
  formatDateToYearMonthDay,
  getDayNameInFrench,
} from "../../../utils/helper";
import Paper from "@mui/material/Paper";
import { ViewState, EditingState } from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  Appointments,
  WeekView,
  EditRecurrenceMenu,
  AllDayPanel,
  ConfirmationDialog,
  AppointmentTooltip,
} from "@devexpress/dx-react-scheduler-material-ui";
import dayjs from "dayjs";

const TableSeance = () => {
  const [data2, setData2] = useState([]);
  const [currentDate] = useState(getCurrentDate());
  const [addedAppointment, setAddedAppointment] = useState({});
  const [appointmentChanges, setAppointmentChanges] = useState({});
  const [editingAppointment, setEditingAppointment] = useState(undefined);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const commitChanges = ({ added, changed, deleted }) => {
    setData2((prevData) => {
      let updatedData = prevData;
      if (added) {
        const startingAddedId =
          updatedData.length > 0
            ? updatedData[updatedData.length - 1].id + 1
            : 0;
        updatedData = [...updatedData, { id: startingAddedId, ...added }];
      }
      if (changed) {
        updatedData = updatedData.map((appointment) =>
          changed[appointment.id]
            ? { ...appointment, ...changed[appointment.id] }
            : appointment
        );
      }
      if (deleted !== undefined) {
        updatedData = updatedData.filter(
          (appointment) => appointment.id !== deleted
        );
      }
      return updatedData;
    });
  };

  const openCustomForm = (appointmentData) => {
    setEditingAppointment(appointmentData);
    console.log(JSON.stringify(appointmentData.id));
    handleEditClickCalander(JSON.stringify(appointmentData.id));
    setIsFormVisible(true);
    // setIsModalVisible(true);
  };

  //
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible1, setIsModalVisible1] = useState(false);
  const [editingClient, setEditingClient] = useState({
    id_cour: null,
    id_coach: null,
    id_salle: null,
    capacity: null,
    jour: null,
    heure_debut: null,
    heure_fin: null,
    cour: "",
    coach: "",
    salle: "",
    genre: "",
    day_name: "",
    date_reservation: getCurrentDate(),
    nb_reservations: 0,
  });
  const [update, setUpdate] = useState(null);
  const [form] = Form.useForm();
  const [open1, setOpen1] = useState(false);
  const [add, setAdd] = useState(false);
  const [Coach, setCoach] = useState([]);
  const [Cours, setCours] = useState([]);
  const [Salle, setSalle] = useState([]);
  const [SalleDetils, setSalleDetils] = useState([]);
  const [CourDetils, setCourDetils] = useState([]);
  const [display, setDisplay] = useState(true);
  const [displayValue, setDisplayValue] = useState("Tableau");

  // State for room related data
  const [ClientData, setClientData] = useState({
    id_cour: null,
    id_coach: null,
    id_salle: null,
    capacity: null,
    jour: null,
    heure_debut: null,
    heure_fin: null,
    cour: "",
    coach: "",
    salle: "",
    genre: "",
    day_name: "",
    date_reservation: getCurrentDate(),
    nb_reservations: 0,
  });

  const handelDisplay = () => {
    setDisplay(!display);
  };

  const handleEmptyCellClick = (startDate) => {
    const newAppointment = {
      startDate,
      endDate: new Date(startDate.getTime() + 60 * 60 * 1000), // default to 30 minutes later
    };
    ClientData.heure_debut = getTimeInHHMM(newAppointment.startDate);
    ClientData.heure_fin = getTimeInHHMM(newAppointment.endDate);
    ClientData.date_reservation = formatDateToYearMonthDay(
      newAppointment.startDate
    );
    ClientData.day_name = getDayNameInFrench(newAppointment.startDate).jour;
    ClientData.jour = getDayNameInFrench(newAppointment.startDate).index;
    console.log(getTimeInHHMM(newAppointment.startDate));
    setOpen1(true);
    openCustomForm(newAppointment);
  };
  // Validation function to check if all required fields are filled for the room form
  const isRoomFormValid = () => {
    return (
      ClientData.id_cour !== null &&
      ClientData.id_coach !== null &&
      ClientData.id_salle !== null &&
      ClientData.capacity !== null &&
      ClientData.jour !== null &&
      ClientData.heure_debut !== null &&
      ClientData.heure_fin !== null &&
      ClientData.cour !== "" &&
      ClientData.coach !== "" &&
      ClientData.salle !== "" &&
      ClientData.genre !== ""
    );
  };

  // Function to add a new chamber
  const addClient = async () => {
    const authToken = localStorage.getItem("jwtToken"); // Replace with your actual auth token
    try {
      // Check if the form is valid before submitting
      if (!isRoomFormValid()) {
        message.error("Please fill in all required fields for the chamber.");
        return;
      }
      const response = await fetch(
        "https://fithouse.pythonanywhere.com/api/seance/",
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
        if (res.msg == "Added successfully!!") {
          message.success("Séance ajoutée avec succès");
          setAdd(Math.random() * 1000);
          setClientData({
            id_cour: null,
            id_coach: null,
            id_salle: null,
            capacity: null,
            jour: null,
            heure_debut: null,
            heure_fin: null,
            cour: "",
            coach: "",
            salle: "",
            genre: "",
            day_name: "",
            date_reservation: getCurrentDate(),
            nb_reservations: 0,
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

  const authToken = localStorage.getItem("jwtToken"); // Replace with your actual auth token

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://fithouse.pythonanywhere.com/api/seance/",
          {
            headers: {
              Authorization: `Bearer ${authToken}`, // Include the auth token in the headers
            },
          }
        );
        const jsonData = await response.json();

        // Replace "day_name" with "jour" in the jsonData
        const modifiedData = jsonData.data.map((item) => ({
          ...item,
          Jour: item.day_name, // Create a new "jour" property with the value of "day_name"
          Cours: item.cour, // Create a new "jour" property with the value of "day_name"
        }));

        // Ensure each row has a unique key
        const processedData = modifiedData.map((item, index) => ({
          ...item,
          key: item.id_seance || index, // Assuming each item has a unique id, otherwise use index
        }));

        setData(processedData);
        setFilteredData(processedData);

        // Generate columns based on the desired keys
        const desiredKeys = ["Cours", "coach", "salle", "Jour", "genre"];
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

  useEffect(() => {
    const fetchData = async () => {
      const authToken = localStorage.getItem("jwtToken");

      try {
        const response = await fetch(
          "https://fithouse.pythonanywhere.com/api/seance/",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const data = await response.json();
        const formattedData = data.data.map((item) => ({
          id: item.id_seance,
          title: item.cour,
          startDate: convertToDateTime(item).startDate,
          endDate: convertToDateTime(item).endDate,
        }));

        setData2(formattedData);
        console.log(formattedData);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };
    fetchData();
  }, [add, update]);

  // Function to capitalize the first letter of a string
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = data.filter((item) =>
      item.cour.toLowerCase().includes(value)
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
      setIsModalVisible(true);
    }
  };

  const handleEditClickCalander = (id) => {
    if (true) {
      console.log(data);
      const clientToEdit = data.find((client) => client.key == id);
      console.log(clientToEdit);
      if (clientToEdit != undefined) {
        setIsModalVisible1(true);
      }
      setEditingClient(clientToEdit);
      form.setFieldsValue(clientToEdit);
      // setIsModalVisible(true);
    }
  };

  const handleModalSubmit = async () => {
    console.log();
    try {
      const response = await fetch(
        `https://fithouse.pythonanywhere.com/api/seance/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(editingClient),
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
        message.success("seance mis à jour avec succès");
        setIsModalVisible(false);
        setEditingClient({
          id_cour: null,
          id_coach: null,
          id_salle: null,
          capacity: null,
          jour: null,
          heure_debut: null,
          heure_fin: null,
          cour: "",
          coach: "",
          salle: "",
          genre: "",
          day_name: "",
          date_reservation: getCurrentDate(),
          nb_reservations: 0,
        });
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
            `https://fithouse.pythonanywhere.com/api/seance/${clientToDelete.id_seance}`,
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
        setIsModalVisible1(false);
        message.success(
          `${selectedRowKeys.length} seance(s) supprimé(s) avec succès`
        );
      } catch (error) {
        console.error("Error deleting clients:", error);
        message.error("An error occurred while deleting clients");
      }
    }
  };

  const handleDelete2 = async () => {
    if (editingClient != undefined) {
      try {
        const response = await fetch(
          `https://fithouse.pythonanywhere.com/api/seance/${editingClient.id_seance}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(editingClient),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete client with key ${key}`);
        }

        const updatedData = data.filter(
          (client) => !selectedRowKeys.includes(client.key)
        );
        setData(updatedData);
        setAdd(Math.random() * 100);
        setFilteredData(updatedData);
        setSelectedRowKeys([]);
        setIsModalVisible1(false);
        message.success(`seance supprimé avec succès`);
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://fithouse.pythonanywhere.com/api/coach/",
          {
            // headers: {
            //   "Authorization": `Bearer ${authToken}`, // Include the auth token in the headers
            // },
          }
        );
        const jsonData = await response.json();
        const option = jsonData.data.map((coach) => {
          return {
            label: coach.nom_coach + " " + coach.prenom_coach,
            value: coach.id_coach,
          };
        });
        setCoach(option);
        // Ensure each row has a unique key
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
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
        setCourDetils(jsonData.data);
        const option = jsonData.data.map((coach) => {
          return {
            label: coach.nom_cour,
            value: coach.id_cour,
          };
        });
        setCours(option);
        // Ensure each row has a unique key
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://fithouse.pythonanywhere.com/api/salles/",
          {
            headers: {
              Authorization: `Bearer ${authToken}`, // Include the auth token in the headers
            },
          }
        );
        const jsonData = await response.json();
        setSalleDetils(jsonData.data);
        const option = jsonData.data.map((coach) => {
          return {
            label: coach.nom_salle,
            value: coach.id_salle,
          };
        });
        setSalle(option);
        // Ensure each row has a unique key
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full p-2">
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-7">
          {display ? (
            <div className="w-52">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search seance"
                value={searchText}
                onChange={handleSearch}
              />
            </div>
          ) : (
            ""
          )}
           {!display ? (
             <div><ClockCircleOutlined /><span className="ml-2 font-medium">Calendrier</span></div>
            ) : (
              " "
            )}
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
                title="Supprimer la séance"
                description="Êtes-vous sûr de supprimer cette séance ?"
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
            
            {display ? (
              <Button
                type="default"
                onClick={showDrawerR}
                icon={<UserAddOutlined />}
              >
                Ajout seance
              </Button>
            ) : (
              " "
            )}
           
            <Segmented
              onChange={(v) => {
                setDisplay(!display);
                setDisplayValue(v);
              }}
              value={displayValue}
              options={[
                {
                  label: "Tableau",
                  value: "Tableau",
                  icon: <BarsOutlined />,
                },
                {
                  label: "Calendrier",
                  value: "Calendrier",
                  icon: <AppstoreOutlined />,
                },
              ]}
            />
            {/* <Button type="default" onClick={handelDisplay}>
              Planing
            </Button> */}
          </div>
          <Drawer
            title="Saisir un nouveau seance"
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
                      <label htmlFor="civilite" className="block font-medium">
                        *Cours
                      </label>
                      <Select
                        id="Cours"
                        showSearch
                        value={ClientData.cour}
                        placeholder="Cours"
                        className="w-full"
                        optionFilterProp="children"
                        onChange={(value) => {
                          const cour = CourDetils.filter(
                            (sal) => sal.id_cour === value
                          );
                          ClientData.cour = cour[0].nom_cour;
                          ClientData.genre = cour[0].genre;
                          setClientData({ ...ClientData, id_cour: value });
                        }}
                        filterOption={(input, option) =>
                          (option?.label ?? "").startsWith(input)
                        }
                        filterSort={(optionA, optionB) =>
                          (optionA?.label ?? "")
                            .toLowerCase()
                            .localeCompare((optionB?.label ?? "").toLowerCase())
                        }
                        options={Cours}
                      />
                    </div>
                    <div>
                      <label htmlFor="civilite" className="block font-medium">
                        *Salle
                      </label>
                      <Select
                        id="Salle"
                        value={ClientData.salle}
                        showSearch
                        placeholder="Salle"
                        className="w-full"
                        optionFilterProp="children"
                        onChange={(value, option) => {
                          const sale = SalleDetils.filter(
                            (sal) => sal.id_salle === value
                          );
                          ClientData.capacity = sale[0].capacity;
                          setClientData({
                            ...ClientData,
                            id_salle: value,
                            salle: option.label,
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
                        options={Salle}
                      />
                    </div>
                    <div>
                      <label htmlFor="civilite" className="block font-medium">
                        *Coach
                      </label>
                      <Select
                        id="Coach"
                        showSearch
                        placeholder="Coach"
                        className="w-full"
                        value={ClientData.coach}
                        optionFilterProp="children"
                        onChange={(value, option) =>
                          setClientData({
                            ...ClientData,
                            id_coach: value,
                            coach: option.label,
                          })
                        }
                        filterOption={(input, option) =>
                          (option?.label ?? "").startsWith(input)
                        }
                        filterSort={(optionA, optionB) =>
                          (optionA?.label ?? "")
                            .toLowerCase()
                            .localeCompare((optionB?.label ?? "").toLowerCase())
                        }
                        options={Coach}
                      />
                    </div>
                    <div>
                      <label htmlFor="civilite" className="block font-medium">
                        *Jour de la semaine
                      </label>
                      <Select
                        id="Jour de la semaine "
                        showSearch
                        value={ClientData.day_name}
                        placeholder="Jour de la semaine "
                        className="w-full"
                        optionFilterProp="children"
                        onChange={(value, option) =>
                          setClientData({
                            ...ClientData,
                            jour: value,
                            day_name: option.label,
                          })
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
                          { label: "Lundi", value: 1 },
                          { label: "Mardi", value: 2 },
                          { label: "Mercredi", value: 3 },
                          { label: "Jeudi", value: 4 },
                          { label: "Vendredi", value: 5 },
                          { label: "Samedi", value: 6 },
                          { label: "Dimanche", value: 7 },
                        ]}
                      />
                    </div>
                    <div>
                      <label>Heur debut</label>
                      <div>
                        <input
                          type="time"
                          className="w-full border bottom-1 border-gray-200 p-1 rounded-md"
                          value={ClientData.heure_debut}
                          onChange={(e) => {
                            const selectedTime = e.target.value;
                            setClientData({
                              ...ClientData,
                              heure_debut: selectedTime,
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label>Heur de fine</label>
                      <div>
                        <input
                          type="time"
                          className="w-full border bottom-1 border-gray-200 p-1 rounded-md"
                          value={ClientData.heure_fin}
                          onChange={(e) => {
                            const selectedTime = e.target.value;
                            setClientData({
                              ...ClientData,
                              heure_fin: selectedTime,
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label>Capacity</label>
                      <Input disabled value={ClientData.capacity} />
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
      {display ? (
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
      ) : (
        <div className="mt-5">
          <Paper>
            <Scheduler data={data2} height={405}>
              <ViewState currentDate={currentDate} />
              <EditingState
                onCommitChanges={commitChanges}
                addedAppointment={addedAppointment}
                onAddedAppointmentChange={setAddedAppointment}
                appointmentChanges={appointmentChanges}
                onAppointmentChangesChange={setAppointmentChanges}
                editingAppointment={editingAppointment}
                onEditingAppointmentChange={setEditingAppointment}
              />
              <WeekView
                startDayHour={9}
                endDayHour={17}
                timeTableCellComponent={(props) => (
                  <WeekView.TimeTableCell
                    {...props}
                    onClick={() => handleEmptyCellClick(props.startDate)}
                    style={{ cursor: "pointer" }}
                  />
                )}
              />
              <AllDayPanel />
              <EditRecurrenceMenu />
              <ConfirmationDialog />
              <Appointments
                appointmentComponent={(props) => (
                  <Appointments.Appointment
                    {...props}
                    onClick={() => openCustomForm(props.data)}
                  />
                )}
              />
              <AppointmentTooltip
                showOpenButton
                showDeleteButton
                onOpenButtonClick={(appointmentData) =>
                  openCustomForm(appointmentData)
                }
              />
            </Scheduler>
          </Paper>
        </div>
      )}

      <Modal
        visible={isModalVisible1}
        onCancel={() => setIsModalVisible1(false)}
        okButtonProps={false}
        footer={<></>}
      >
        <Card
          className="w-full"
          title="Information seance"
          actions={[
            <Popconfirm
              title="Supprimer la séance"
              description="Êtes-vous sûr de supprimer cette séance ?"
              onConfirm={handleDelete2}
              onCancel={cancel}
              okText="Yes"
              cancelText="No"
            >
              <DeleteOutlined className="cursor-pointer" />
            </Popconfirm>,
            <EditOutlined
              key="edit"
              onClick={() => {
                setIsModalVisible(true);
                setIsModalVisible1(false);
              }}
            />,
          ]}
        >
          <div>
            <span className="font-medium">Cour</span>:{" "}
            {editingClient && editingClient.cour}
          </div>
          <div>
            <span className="font-medium">Coach</span>:{" "}
            {editingClient && editingClient.coach}
          </div>
          <div>
            <span className="font-medium">Salle</span>:{" "}
            {editingClient && editingClient.salle}
          </div>
        </Card>
      </Modal>

      <Modal
        title="Edit Seance"
        visible={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={handleModalCancel}
      >
        <div className="h-96 overflow-y-auto">
          <div className="mt-5">
            <div>Cours</div>
            <Select
              id="cour"
              showSearch
              value={editingClient && editingClient.cour}
              placeholder="Cours"
              className="w-full mt-1"
              optionFilterProp="children"
              onChange={(value) => {
                const cour = CourDetils.filter((sal) => sal.id_cour === value);
                editingClient.cour = cour[0].nom_cour;
                editingClient.genre = cour[0].genre;
                setEditingClient({ ...editingClient, id_cour: value });
              }}
              filterOption={(input, option) =>
                (option?.label ?? "").startsWith(input)
              }
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? "")
                  .toLowerCase()
                  .localeCompare((optionB?.label ?? "").toLowerCase())
              }
              options={Cours}
            />
          </div>
          <div className="mt-5">
            <div>Salle</div>
            <Select
              id="Salle"
              value={editingClient && editingClient.salle}
              showSearch
              placeholder="Salle"
              className="w-full mt-1"
              optionFilterProp="children"
              onChange={(value, option) => {
                const sale = SalleDetils.filter(
                  (sal) => sal.id_salle === value
                );
                editingClient.capacity = sale[0].capacity;
                setEditingClient({
                  ...editingClient,
                  id_salle: value,
                  salle: option.label,
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
              options={Salle}
            />
          </div>
          <div className="mt-5">
            <div>Coach</div>
            <Select
              id="Coach"
              showSearch
              placeholder="Coach"
              value={editingClient && editingClient.coach}
              className="w-full mt-1"
              optionFilterProp="children"
              onChange={(value, option) =>
                setEditingClient({
                  ...editingClient,
                  id_coach: value,
                  coach: option.label,
                })
              }
              filterOption={(input, option) =>
                (option?.label ?? "").startsWith(input)
              }
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? "")
                  .toLowerCase()
                  .localeCompare((optionB?.label ?? "").toLowerCase())
              }
              options={Coach}
            />
          </div>{" "}
          <div className="mt-5">
            <div>Jour de la semaine</div>
            <Select
              id="Jour de la semaine "
              showSearch
              value={editingClient && editingClient.day_name}
              placeholder="Jour de la semaine "
              className="w-full mt-1"
              optionFilterProp="children"
              onChange={(value, option) => {
                setEditingClient({
                  ...editingClient,
                  jour: parseInt(value),
                  day_name: option.label,
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
                { label: "Lundi", value: 1 },
                { label: "Mardi", value: 2 },
                { label: "Mercredi", value: 3 },
                { label: "Jeudi", value: 4 },
                { label: "Vendredi", value: 5 },
                { label: "Samedi", value: 6 },
                { label: "Dimanche", value: 7 },
              ]}
            />
          </div>
          <div className="mt-5">
            <label>Heur debut</label>
            <div>
              <input
                type="time"
                value={editingClient && editingClient.heure_debut}
                className="w-full"
                onChange={(event) => {
                  setEditingClient({
                    ...editingClient,
                    heure_debut: event.target.value,
                  });
                }}
              />
            </div>
          </div>
          <div className="mt-5">
            <label>Heur de fine</label>
            <div>
              <input
                type="time"
                value={editingClient && editingClient.heure_fin}
                className="w-full"
                onChange={(event) => {
                  setEditingClient({
                    ...editingClient,
                    heure_fin: event.target.value,
                  });
                }}
              />
            </div>
          </div>
          <div className="mt-5">
            <label>Capacity</label>
            <Input disabled value={editingClient && editingClient.capacity} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TableSeance;
