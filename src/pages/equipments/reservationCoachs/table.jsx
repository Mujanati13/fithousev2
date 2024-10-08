import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/fr"; // Import French locale for Day.js
import { useState, useEffect } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"; // if using DnD
// Set Day.js to use the French locale globally
dayjs.locale("fr");
const localizer = dayjsLocalizer(dayjs);
import {
  PlusOutlined,
  FileAddOutlined,
  UserAddOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import {
  Button,
  Drawer,
  Space,
  Input,
  Select,
  message,
  Modal,
  DatePicker,
  Table,
  Switch,
} from "antd";
import "dayjs/locale/fr"; // Import French locale for Day.js
import {
  formatDateToYearMonthDay,
  getCurrentDate,
} from "../../../utils/helper";
const { RangePicker } = DatePicker;

const fetchReservations = async () => {
  try {
    const response = await fetch(
      "https://fithouse.pythonanywhere.com/api/reservation/"
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return [];
  }
};

export const TableReservationCoachs = () => {
  const [events, setEvents] = useState([]);
  const [open1, setOpen1] = useState(false);
  const [clients, setClients] = useState([]);
  const [Cour, setCour] = useState([]);
  const [Seance, setSeance] = useState([]);
  const [SeancInfos, SetSeancInfos] = useState([]);
  const [selectedSeance, setSelectedSeance] = useState([]);
  const [event, setevent] = useState([]);
  const [add, setAdd] = useState();
  const [selectedEventIdSeance, setSelectedEventIdSeance] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [clientPresence, setClientPresence] = useState({});
  const [isAbsenceModalVisible, setIsAbsenceModalVisible] = useState(false);
  const [selectedAbsentClient, setSelectedAbsentClient] = useState(null);
  const [absenceReason, setAbsenceReason] = useState("");
  const [presenceData, setPresenceData] = useState([]);
  const [absenceReasons, setAbsenceReasons] = useState({});
  const [ReservationData, setReservationData] = useState({
    id_client: null,
    id_seance: null,
    date_operation: getCurrentDate(),
    date_presence: null,
    status: null,
    presence: null,
    motif_annulation: null,
  });
  const handlePresenceChange = async (checked, clientId) => {
    if (!checked) {
      setSelectedAbsentClient(clientId);
      setIsAbsenceModalVisible(true);
    } else {
      setClientPresence((prev) => ({ ...prev, [clientId]: checked }));
      await updateClientPresence(clientId, checked);
      // Clear absence reason when marked as present
      setevent((prev) =>
        prev.map((item) =>
          item.key === clientId ? { ...item, absenceReason: "" } : item
        )
      );
    }
  };
  const handleAbsenceReasonSubmit = async () => {
    setClientPresence((prev) => ({ ...prev, [selectedAbsentClient]: false }));
    await updateClientPresence(selectedAbsentClient, false, absenceReason);
    setevent((prev) =>
      prev.map((item) =>
        item.key === selectedAbsentClient ? { ...item, absenceReason } : item
      )
    );
    setIsAbsenceModalVisible(false);
    setAbsenceReason("");
    setSelectedAbsentClient(null);
  };
  const updateClientPresence = async (
    clientId,
    isPresent,
    absenceReason = ""
  ) => {
    console.log(SeancInfos);
    try {
      const response = await fetch(
        "https://fithouse.pythonanywhere.com/api/set_presence",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
          body: JSON.stringify({
            id_etd: clientId,
            id_seance: SeancInfos.id_seance,
            cours: SeancInfos.title,
            heure_debut: SeancInfos.datestart,
            heure_fin: SeancInfos.dateend,
            date_presence: formatDateToYearMonthDay(SeancInfos.start),
            status: 1,
            presence: isPresent,
            motif_annulation: absenceReason,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update presence");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating presence:", error);
      throw error;
    }
  };
  const fetchClients = async () => {
    try {
      const response = await fetch(
        "https://fithouse.pythonanywhere.com/api/clients/"
      );
      const data = await response.json();
      setClients(data.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };
  const fetchCours = async () => {
    const authToken = localStorage.getItem("jwtToken"); // Replace with your actual auth token

    try {
      const response = await fetch(
        "https://fithouse.pythonanywhere.com/api/cours/",
        {
          headers: {
            Authorization: `Bearer ${authToken}`, // Include the auth token in the headers
          },
        }
      );
      const data = await response.json();
      setCour(data.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchSeance = async (id_client, cour_id) => {
    const authToken = localStorage.getItem("jwtToken");
    if (id_client && cour_id) {
      try {
        const response = await fetch(
          `https://fithouse.pythonanywhere.com/api/seance/?cour_id=${cour_id}&client_id=${id_client}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const data = await response.json();
        console.log(data);
        data.data.length == 0 ? message.warning("il n'y a pas de séance") : "";
        setSeance(data.data);
      } catch (error) {
        console.error("Error fetching seance:", error);
      }
    }
  };

  const transformReservations = (reservations) => {
    return reservations.map((reservation) => {
      // Extract date and time components
      const dateParts = reservation.date_presence.split('T')[0];
      const startDateTime = new Date(`${dateParts}T${reservation.heur_debut}`);
      const endDateTime = new Date(`${dateParts}T${reservation.heure_fin}`);
  
      return {
        id: reservation.id_reservation,
        id_seance: reservation.id_seance,
        title: `${reservation.cour} - ${reservation.client}`,
        start: startDateTime,
        end: endDateTime,
        datestart: reservation.heur_debut,
        dateend: reservation.heure_fin,
        coach: reservation.coach,
        allDay: false,
        resource: reservation.salle,
        day: reservation.day_name
      };
    });
  };

  useEffect(() => {
    fetchClients();
    fetchCours();
    setSelectedSeance([]);
  }, []);

  const isReservationFormValid = () => {
    return (
      ReservationData.date_presence !== "" &&
      ReservationData.heur_debut !== "" &&
      ReservationData.heure_fin !== ""
    );
  };

  const addReservation = async () => {
    try {
      if (!isReservationFormValid()) {
        message.error(
          "Please fill in all required fields for the reservation."
        );
        return;
      }
      ReservationData.id_seance = selectedSeance.id_seance;
      ReservationData.date_presence = selectedSeance.date_reservation;
      const response = await fetch(
        "https://fithouse.pythonanywhere.com/api/reservation/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ReservationData),
        }
      );
      if (response.ok) {
        const res = await response.json();
        if (res.msg === "Added Successfully!!") {
          message.success("Réservation ajoutée avec succès");
          setAdd(Math.random() * 1000);
          onCloseR();
        } else {
          message.warning(res.msg);
          console.log(res);
        }
      } else {
        console.log(response);
        message.error("Error adding reservation");
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
    setSelectedSeance([]);
    setReservationData({
      id_client: null,
      id_seance: null,
      date_operation: getCurrentDate(),
      date_presence: null,
      status: null,
      presence: null,
      motif_annulation: null,
    });
  };

  const handleReservationSubmit = () => {
    addReservation();
    setSelectedSeance([]);
  };

  useEffect(() => {
    const fetchAndTransformReservations = async () => {
      const reservations = await fetchReservations();
      const transformedEvents = transformReservations(reservations);
      setEvents(transformedEvents);
    };

    fetchAndTransformReservations();
  }, [add]);

  const fetchClientParSeance = async (e) => {
    const authToken = localStorage.getItem("jwtToken");
    try {
      const [clientResponse, presenceResponse] = await Promise.all([
        fetch(
          `https://fithouse.pythonanywhere.com/api/Etudiant_by_resevation?id_seance=${e.id_seance}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        ),
        fetchPresenceData(e.id_seance, formatDateToYearMonthDay(e.start)),
      ]);

      const clientData = await clientResponse.json();
      const presenceData = await presenceResponse;

      console.log(clientData);
      setSelectedEventIdSeance(clientData.data);
      setPresenceData(presenceData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };
  const handleModalCancel2 = () => {
    setIsModalVisible2(false);
  };
  const handleModal2 = () => {
    setIsModalVisible2(true);
  };

  useEffect(() => {
    const dataSource = selectedEventIdSeance.map((obj) => {
      const presenceInfo =
        presenceData.find((p) => p.id_etd === obj.id_client) || {};
      return {
        key: obj.id_client,
        fullName: `${obj.nom_client} ${obj.prenom_client}`,
        mail: obj.mail,
        presence: presenceInfo.presence || false,
        absenceReason: presenceInfo.motif_annulation || "",
      };
    });
    setevent(dataSource);
  }, [selectedEventIdSeance, presenceData]);

  const fetchPresenceData = async (id_seance, date_presence) => {
    try {
      const response = await fetch(
        `https://fithouse.pythonanywhere.com/api/presences_etds/?id_seance=${id_seance}&date_presence=${date_presence}`
      );
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching presence data:", error);
      return [];
    }
  };

  return (
    <div className="w-full p-2">
      <Modal
        title="Motif d'absence"
        visible={isAbsenceModalVisible}
        onOk={handleAbsenceReasonSubmit}
        onCancel={() => {
          setIsAbsenceModalVisible(false);
          setAbsenceReason("");
          setSelectedAbsentClient(null);
        }}
      >
        <Input.TextArea
          rows={4}
          value={absenceReason}
          onChange={(e) => setAbsenceReason(e.target.value)}
          placeholder="Veuillez saisir le motif d'absence"
        />
      </Modal>
      <div className="flex items-center justify-between mt-3">
        <div className=" w-52">
          <Input prefix={<SearchOutlined />} placeholder="Search Reservation" />
        </div>
      </div>
      <div className="mt-5">
        <Calendar
          localizer={localizer}
          onDoubleClickEvent={(e) => {
            setIsModalVisible(true);
            fetchClientParSeance(e);
            SetSeancInfos(e);
          }}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 400 }}
          views={["month", "week"]}
          messages={{
            date: "Date",
            time: "Heure",
            event: "Événement",
            allDay: "Toute la journée",
            week: "Semaine",
            work_week: "Semaine de travail",
            day: "Jour",
            month: "Mois",
            previous: "Précédent",
            next: "Suivant",
            yesterday: "Hier",
            tomorrow: "Demain",
            today: "Aujourd'hui",
            agenda: "Agenda",
            noEventsInRange: "Aucun événement dans cette période.",
            showMore: (total) => `+ ${total} de plus`,
          }}
        />
      </div>
      <Modal
        title={"List des clients"}
        visible={isModalVisible2}
        onOk={handleModalCancel2}
        onCancel={handleModalCancel2}
      >
        <div className="h-96 overflow-y-auto mt-10">
          <Table
            columns={[
              {
                title: "Nom",
                dataIndex: "fullName",
                key: "fullName",
              },
              {
                title: "Mail",
                dataIndex: "mail",
                key: "mail",
              },
            ]}
            dataSource={event}
            pagination={false}
            bordered
            // style={{ height: "400px", overflowY: "auto" }}
            size="small"
          />
        </div>
      </Modal>

      <Modal
        title={"Informations sur la séance"}
        visible={isModalVisible}
        onOk={handleModalCancel}
        onCancel={handleModalCancel}
        footer={[]}
      >
        <div className="h-96 overflow-y-auto mt-10">
          <div>
            <span className="font-medium">Cour</span>:{" "}
            {SeancInfos.title && SeancInfos.title}
          </div>
          <div>
            <span className="font-medium">Coach</span>: {SeancInfos.coach}
          </div>
          <div>
            <span className="font-medium">Heur debut</span>:{" "}
            {SeancInfos.datestart}
          </div>
          <div>
            <span className="font-medium">Heur de fine</span>:{" "}
            {SeancInfos.dateend}
          </div>
          <div>
            <span className="font-medium">Salle</span>:{" "}
            {SeancInfos.resource && SeancInfos.resource}
          </div>
          <div>
            <span className="font-medium">Jour</span>:{" "}
            {SeancInfos.day && SeancInfos.day}
          </div>

          <div className="h-96 overflow-y-auto mt-10">
            <div>List des clients</div>

            <Table
              columns={[
                {
                  title: "Nom",
                  dataIndex: "fullName",
                  key: "fullName",
                },
                {
                  title: "Mail",
                  dataIndex: "mail",
                  key: "mail",
                },
                {
                  title: "Présence",
                  key: "presence",
                  render: (_, record) => (
                    <div>
                      <Switch
                        checked={clientPresence[record.key] || record.presence}
                        onChange={(checked) =>
                          handlePresenceChange(checked, record.key)
                        }
                      />
                    </div>
                  ),
                },
                {
                  title: "Motif d'absence",
                  dataIndex: "absenceReason",
                  key: "absenceReason",
                  render: (text, record) =>
                    !clientPresence[record.key] && !record.presence
                      ? text
                      : "-",
                },
              ]}
              dataSource={event}
              pagination={false}
              bordered
              size="small"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
