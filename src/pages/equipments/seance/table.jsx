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
  addNewTrace,
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
  const [changedFields, setChangedFields] = useState([]);
  const [isFormChanged, setIsFormChanged] = useState(false);

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
  const id_staff = JSON.parse(localStorage.getItem("data"));
  const [disableSalleCoach, setDisableSalleCoach] = useState(true);
  const [occupiedSessions, setOccupiedSessions] = useState([]);
  const [availableSalles, setAvailableSalles] = useState([]);
  const [availableCoaches, setAvailableCoaches] = useState([]);
  const [timeError, setTimeError] = useState("");
  const [clients, setClients] = useState([]);
  const [currentClient, setcurrentClient] = useState("");
  const [isReservationDrawerVisible, setIsReservationDrawerVisible] =
    useState(false);
  const [selectedSeance, setSelectedSeance] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAppointmentModalVisible, setIsAppointmentModalVisible] =
    useState(false);
  const handleAppointmentClick = (appointmentData) => {
    setSelectedAppointment(appointmentData);
    setIsAppointmentModalVisible(true);
  };
  const handleAppointmentModalClose = () => {
    setIsAppointmentModalVisible(false);
    setSelectedAppointment(null);
  };
  const handleUpdate = () => {
    // Implement update logic here
    console.log("Update appointment:", selectedAppointment);
    handleEditClickCalander(selectedAppointment.id);
    handleAppointmentModalClose();
  };
  const handleReserve = () => {
    // Implement reserve logic here
    console.log("Reserve appointment:", selectedAppointment);
    handleReservationClick(selectedAppointment.id);
    handleAppointmentModalClose();
  };

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
        setClients(jsonData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleReservationClick = (seanceId) => {
    const seance = data2.find((item) => item.id === seanceId);
    setSelectedSeance(seance);
    setIsReservationDrawerVisible(true);
  };
  const handleReservationSubmit = async () => {
    if (!selectedClient) {
      message.error("Veuillez sélectionner un client");
      return;
    }

    const authToken = localStorage.getItem("jwtToken");

    try {
      const response = await fetch(
        "https://fithouse.pythonanywhere.com/api/reservation/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            id_seance: selectedSeance.id,
            id_client: selectedClient,
            date_reservation: getCurrentDate(),
            date_presence: selectedSeance.startDate, // Include the date_presence field
            statut: "confirmé",
          }),
        }
      );

      if (response.ok) {
        message.success("Réservation effectuée avec succès");
        setIsReservationDrawerVisible(false);
        setSelectedClient(null);
        // Refresh the calendar data
        fetchData();
      } else {
        message.error("Erreur lors de la réservation");
      }
    } catch (error) {
      console.error("Error making reservation:", error);
      // message.error("Une erreur est survenue lors de la réservation");
    }
  };

  // State for room related data
  const [ClientData, setClientData] = useState({
    id_cour: null,
    id_coach: null,
    id_employe: id_staff[0].id_employe,
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

  const isValidTimeRange = () => {
    if (ClientData.heure_debut && ClientData.heure_fin) {
      const startTime = new Date(`2000-01-01T${ClientData.heure_debut}`);
      const endTime = new Date(`2000-01-01T${ClientData.heure_fin}`);
      return endTime > startTime;
    }
  };

  const checkAndFetchAvailability = async () => {
    if (
      ClientData.jour != null &&
      ClientData.heure_debut != null &&
      ClientData.heure_fin != null
    ) {
      try {
        const response = await fetch(
          `https://fithouse.pythonanywhere.com/api/sallesProfnondispo/?jour=${ClientData.jour}&heur_debut=${ClientData.heure_debut}&heur_fin=${ClientData.heure_fin}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const data = await response.json();
        setOccupiedSessions(data.data);

        // Filter available salles and coaches
        const availableSalles = Salle.filter(
          (salle) =>
            !data.data.some((session) => session.id_salle === salle.value)
        );

        const availableCoaches = Coach.filter(
          (coach) =>
            !data.data.some((session) => session.id_coach === coach.value)
        );

        // Update the state with available salles and coaches
        setAvailableSalles(availableSalles);
        setAvailableCoaches(availableCoaches);
        setDisableSalleCoach(false);
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
    } else {
      setDisableSalleCoach(true);
    }
  };

  const checkAndFetchAvailability2 = async (jour, heure_debut, heure_fin) => {
    if (true) {
      try {
        const response = await fetch(
          `https://fithouse.pythonanywhere.com/api/sallesProfnondispo/?jour=${jour}&heur_debut=${heure_debut}&heur_fin=${heure_fin}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const data = await response.json();
        setOccupiedSessions(data.data);

        // Filter available salles and coaches
        const availableSalles = Salle.filter(
          (salle) =>
            !data.data.some((session) => session.id_salle === salle.value)
        );

        const availableCoaches = Coach.filter(
          (coach) =>
            !data.data.some((session) => session.id_coach === coach.value)
        );

        // Update the state with available salles and coaches
        setAvailableSalles(availableSalles);
        setAvailableCoaches(availableCoaches);
        setDisableSalleCoach(false);
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
    } else {
      setDisableSalleCoach(true);
    }
  };
  // Function to add a new chamber
  const addClient = async () => {
    const authToken = localStorage.getItem("jwtToken"); // Replace with your actual auth token
    try {
      // Check if the form is valid before submitting
      if (!isRoomFormValid()) {
        message.warning("Remplissez tous les champs obligatoires");
        return;
      }

      if (!isValidTimeRange()) {
        message.warning("L'heure de fin doit être après l'heure de début");
        return;
      }
      const id_staff = JSON.parse(localStorage.getItem("data"));
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
          const id_staff = JSON.parse(localStorage.getItem("data"));
          const res = await addNewTrace(
            id_staff[0].id_employe,
            "Ajout",
            getCurrentDate(),
            `${JSON.stringify(ClientData)}`,
            "seance"
          );
          onCloseR();
        } else {
          message.warning(res.msg);
          console.log(res);
        }
      } else {
        console.log(response);
        message.error("Error adding Seance");
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
    setDisableSalleCoach(true);
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
        const desiredKeys = [
          "Cours",
          "coach",
          "salle",
          "Jour",
          "genre",
          "heure_debut",
          "heure_fin",
          "capacity",
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
          color: item.color || "#fcba03", 
        }));
        setData2(formattedData);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };
    fetchData();
  }, [update, add]);

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

  // Modify the handleEditClick function
  const handleEditClick = async () => {
    if (selectedRowKeys.length === 1) {
      const clientToEdit = data.find(
        (client) => client.key === selectedRowKeys[0]
      );
      setEditingClient(clientToEdit);
      form.setFieldsValue(clientToEdit);
      console.log(clientToEdit.jour);

      // Fetch available salles and coaches before opening the modal
      await checkAndFetchAvailability2(
        clientToEdit.jour,
        clientToEdit.heure_debut,
        clientToEdit.heure_fin
      );

      setIsModalVisible(true);
    }
  };

  // Modify the handleEditClickCalander function
  const handleEditClickCalander = async (id) => {
    const clientToEdit = data.find((client) => client.key == id);
    if (clientToEdit != undefined) {
      setEditingClient(clientToEdit);
      form.setFieldsValue(clientToEdit);

      // Fetch available salles and coaches before opening the modal
      await checkAndFetchAvailability(
        clientToEdit.jour,
        clientToEdit.heure_debut,
        clientToEdit.heure_fin,
        clientToEdit.id_seance
      );

      setIsModalVisible(true);
    }
  };

  const handleModalSubmit = async () => {
    // if (!isValidTimeRange()) {
    //   message.warning("L'heure de fin doit être après l'heure de début");
    //   return;
    // }
    console.log();
    try {
      // Check if the selected salle and coach are available
      const isSalleAvailable = availableSalles.some(
        (salle) => salle.value === editingClient.id_salle
      );
      const isCoachAvailable = availableCoaches.some(
        (coach) => coach.value === editingClient.id_coach
      );

      if (!isSalleAvailable || !isCoachAvailable) {
        message.error(
          "La salle ou le coach sélectionné n'est pas disponible pour cet horaire."
        );
        return;
      }
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
        const id_staff = JSON.parse(localStorage.getItem("data"));
        const res = await addNewTrace(
          id_staff[0].id_employe,
          "Modification",
          getCurrentDate(),
          `${JSON.stringify(changedFields)}`,
          "seance"
        );
        setIsFormChanged(false);
        setChangedFields([]);

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
    setEditingClient(null);
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
          const id_staff = JSON.parse(localStorage.getItem("data"));
          const res = await addNewTrace(
            id_staff[0].id_employe,
            "Supprimer",
            getCurrentDate(),
            `${JSON.stringify(ClientData)}`,
            "seance"
          );
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
    console.log(e);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://fithouse.pythonanywhere.com/api/staff_by_type/?type=coach",
          {
            headers: {
              Authorization: `Bearer ${authToken}`, // Include the auth token in the headers
            },
          }
        );
        const jsonData = await response.json();
        const option = jsonData.data.map((coach) => {
          return {
            label: coach.nom + " " + coach.prenom,
            value: coach.id_employe,
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

  useEffect(() => {
    console.log(editingClient);

    if (editingClient != undefined) {
      checkAndFetchAvailability2(
        editingClient.jour,
        editingClient.heure_debut,
        editingClient.heure_fin,
        editingClient.id_seance
      );
    }
  }, [
    editingClient?.jour,
    editingClient?.heure_debut,
    editingClient?.heure_fin,
  ]);

  const validateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return true;

    const start = dayjs(startTime, "HH:mm");
    const end = dayjs(endTime, "HH:mm");
    const durationInMinutes = end.diff(start, "minute");

    if (durationInMinutes < 15) {
      setTimeError("La durée de la séance doit être d'au moins 15 minutes.");
      return false;
    }
    if (durationInMinutes > 180) {
      setTimeError("La durée de la séance ne peut pas dépasser 3 heures.");
      return false;
    }
    setTimeError("");
    return true;
  };

  const handleTimeChange = (time, type) => {
    const updatedClientData = { ...ClientData, [type]: time };
    setClientData(updatedClientData);
    validateDuration(
      updatedClientData.heure_debut,
      updatedClientData.heure_fin
    );
    checkAndFetchAvailability();
  };

  const handleEditingTimeChange = (time, type) => {
    const updatedEditingClient = { ...editingClient, [type]: time };
    setEditingClient(updatedEditingClient);
    validateDuration(
      updatedEditingClient.heure_debut,
      updatedEditingClient.heure_fin
    );

    if (time !== editingClient[type]) {
      setIsFormChanged(true);
      setChangedFields((prev) => [...new Set([...prev, type])]);
    }
  };

  const handleReservation = async (seanceId) => {
    const authToken = localStorage.getItem("jwtToken");
    const userData = JSON.parse(localStorage.getItem("data"));
    const userId = userData[0].id_employe;

    try {
      const response = await fetch(
        "https://fithouse.pythonanywhere.com/api/reservation/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            id_seance: seanceId,
            id_client: userId,
            date_reservation: getCurrentDate(),
            statut: "confirmé",
          }),
        }
      );

      if (response.ok) {
        message.success("Réservation effectuée avec succès");
        // Refresh the calendar data
        fetchData();
      } else {
        message.error("Erreur lors de la réservation");
      }
    } catch (error) {
      console.error("Error making reservation:", error);
      // message.error("Une erreur est survenue lors de la réservation");
    }
  };

  const AppointmentContent = ({ children, style, data, ...restProps }) => (
    <Appointments.Appointment
      {...restProps}
      style={{
        ...style,
        backgroundColor: data.color,
        borderRadius: "8px",
      }}
      onClick={() => handleAppointmentClick(data)}
    >
      <div style={{ padding: "8px" }}>{children}</div>
    </Appointments.Appointment>
  );

  return (
    <div className="w-full p-2">
      <Drawer
        title="Réserver une séance"
        placement="right"
        closable={false}
        onClose={() => setIsReservationDrawerVisible(false)}
        visible={isReservationDrawerVisible}
        width={400}
      >
        <Form layout="vertical">
          <Form.Item
            name="client"
            label="Sélectionner un client"
            rules={[
              { required: true, message: "Veuillez sélectionner un client" },
            ]}
          >
            <Select
              showSearch
              placeholder="Sélectionner un client"
              optionFilterProp="children"
              onChange={(value) => setSelectedClient(value)}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {clients.map((client) => (
                <Select.Option key={client.id_client} value={client.id_client}>
                  {`${client.nom_client} ${client.prenom_client}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleReservationSubmit}>
              Confirmer la réservation
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
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
            <div>
              <ClockCircleOutlined />
              <span className="ml-2 font-medium">Calendrier</span>
            </div>
          ) : (
            " "
          )}
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
            {/* {selectedRowKeys.length >= 1 ? (
              <PrinterOutlined disabled={true} />
            ) : (
              ""
            )} */}
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
              Ajout seance
            </Button>
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
            title="Saisir une nouvelle séance"
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
                        *Jour de la semaine
                      </label>
                      <Select
                        id="Jour de la semaine "
                        showSearch
                        value={ClientData.day_name}
                        placeholder="Jour de la semaine "
                        className="w-full"
                        optionFilterProp="children"
                        onChange={(value, option) => {
                          setClientData({
                            ...ClientData,
                            jour: parseInt(value),
                            day_name: option.label,
                          });
                          checkAndFetchAvailability();
                        }}
                        filterOption={(input, option) =>
                          (option?.label ?? "").startsWith(input)
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
                      <label>Heure de début</label>
                      <Input
                        type="time"
                        className="w-full border border-gray-200 p-1 rounded-md"
                        value={ClientData.heure_debut}
                        onChange={(e) =>
                          handleTimeChange(e.target.value, "heure_debut")
                        }
                      />
                    </div>
                    <div>
                      <label>Heure de fin</label>
                      <Input
                        type="time"
                        className="w-full border border-gray-200 p-1 rounded-md"
                        value={ClientData.heure_fin}
                        onChange={(e) =>
                          handleTimeChange(e.target.value, "heure_fin")
                        }
                      />
                    </div>
                    {timeError && (
                      <div className="text-red-500">{timeError}</div>
                    )}

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
                        disabled={disableSalleCoach}
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
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={disableSalleCoach ? [] : availableSalles}
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
                        disabled={disableSalleCoach}
                        onChange={(value, option) =>
                          setClientData({
                            ...ClientData,
                            id_coach: value,
                            coach: option.label,
                          })
                        }
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={disableSalleCoach ? [] : availableCoaches}
                      />
                    </div>
                    <div>
                      <label>Capacité</label>
                      <Input disabled value={ClientData.capacity} />
                    </div>
                    {/* UploadImage component already included */}
                  </div>
                </div>
                <Space className="mt-10">
                  <Button onClick={handleRoomSubmit} type="default">
                    Enregistrer
                  </Button>
                  <Button danger onClick={onCloseR}>
                    Annuler
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
            <Scheduler data={data2} height={600}>
              <ViewState currentDate={currentDate} />
              <EditingState />
              <WeekView startDayHour={9} endDayHour={19} />
              <AllDayPanel />
              <Appointments appointmentComponent={AppointmentContent} />
              <AppointmentTooltip showOpenButton showDeleteButton />
            </Scheduler>
          </Paper>
        </div>
      )}

      <Modal
        title={"Actions"}
        visible={isAppointmentModalVisible}
        onCancel={handleAppointmentModalClose}
        footer={null}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button icon={<EditOutlined />} onClick={handleUpdate} block>
            Mettre à jour la séance
          </Button>
          <Button disabled={true} icon={<DeleteOutlined />} onClick={handleDelete} danger block>
            Supprimer la séance
          </Button>
          <Button onClick={handleReserve} type="primary" block>
            Faire une réservation
          </Button>
        </Space>
      </Modal>

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
        okButtonProps={{ disabled: !isFormChanged }}
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
                if (value !== editingClient.id_cour) {
                  setIsFormChanged(true);
                  setChangedFields((prev) => [
                    ...new Set([...prev, "id_cour", "cour", "genre"]),
                  ]);
                }
                const cour = CourDetils.find((sal) => sal.id_cour === value);
                setEditingClient({
                  ...editingClient,
                  id_cour: value,
                  cour: cour ? cour.nom_cour : "",
                  genre: cour ? cour.genre : "",
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
                if (value !== editingClient.id_salle) {
                  setIsFormChanged(true);
                  setChangedFields((prev) => [
                    ...new Set([...prev, "id_salle", "salle", "capacity"]),
                  ]);
                }
                const sale = SalleDetils.find((sal) => sal.id_salle === value);
                setEditingClient({
                  ...editingClient,
                  id_salle: value,
                  salle: option.label,
                  capacity: sale ? sale.capacity : null,
                });
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={availableSalles}
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
              onChange={(value, option) => {
                if (value !== editingClient.id_coach) {
                  setIsFormChanged(true);
                  setChangedFields((prev) => [
                    ...new Set([...prev, "id_coach", "coach"]),
                  ]);
                }
                setEditingClient({
                  ...editingClient,
                  id_coach: value,
                  coach: option.label,
                });
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={availableCoaches}
            />
          </div>
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
                if (value !== editingClient.jour) {
                  setIsFormChanged(true);
                  editingClient.salle = "";
                  editingClient.coach = "";

                  setChangedFields((prev) => [
                    ...new Set([...prev, "jour", "day_name"]),
                  ]);
                }
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
            <label>heur de début</label>
            <div>
              <input
                type="time"
                value={editingClient && editingClient.heure_debut}
                className="w-full"
                onChange={(event) => {
                  if (event.target.value !== editingClient.heure_debut) {
                    setIsFormChanged(true);
                    editingClient.salle = "";
                    editingClient.coach = "";
                    setChangedFields((prev) => [
                      ...new Set([...prev, "heure_debut"]),
                    ]);
                  }
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
                  if (event.target.value !== editingClient.heure_fin) {
                    setIsFormChanged(true);
                    setChangedFields((prev) => [
                      ...new Set([...prev, "heure_fin"]),
                    ]);
                  }
                  editingClient.salle = "";
                  editingClient.coach = "";
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
