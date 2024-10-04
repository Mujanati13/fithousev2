import React, { useState, useEffect } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

dayjs.locale("fr");
const localizer = dayjsLocalizer(dayjs);

import {
  PlusOutlined,
  FileAddOutlined,
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
  Table,
  Switch,
  Segmented,
  Tag,
} from "antd";

import { addNewTrace, getCurrentDate } from "../../../utils/helper";

const TableReservations = () => {
  // Code from the first interface
  const fetchReservations = async () => {
    try {
      const response = await fetch(
        "https://fithouse.pythonanywhere.com/api/reservationService/"
      );
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching reservations:", error);
      return [];
    }
  };

  const transformReservations = (reservations) => {
    return reservations.map((reservation) => ({
      id: reservation.id_rsv_srvc,
      client: reservation.id_client,
      mode_reservation: reservation.mode_reservation,
      montant: reservation.Tarif,
      id_service: reservation.id_service,
      title: reservation.service + " ",
      start: new Date(
        reservation.date_presence.split("T")[0] + "T" + reservation.heure_debut
      ),
      end: new Date(
        reservation.date_presence.split("T")[0] + "T" + reservation.heure_fin
      ),
      datestart: reservation.heure_debut,
      dateend: reservation.heure_fin,
      allDay: false,
      resource: reservation.status ? "Active" : "Inactive",
      status: reservation.status,
      presence: reservation.presence,
      motif_annulation: reservation.motif_annulation,
      reduction: reservation.mode_reservation == "client" ? true : false,
    }));
  };

  const [events, setEvents] = useState([]);
  const [open1, setOpen1] = useState(false);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAnonymousReservation, setIsAnonymousReservation] = useState(false);
  const [anonymousClientName, setAnonymousClientName] = useState("");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isCancellationModalVisible, setIsCancellationModalVisible] =
    useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedServiceDuree, setselectedServiceDuree] = useState(null);
  const [ReservationData, setReservationData] = useState({
    id_client: null,
    id_service: null,
    date_resrv: getCurrentDate(),
    date_presence: null,
    heure_debut: "08:00",
    heure_fin: null,
    anonymous_client_name: "",
    status: true,
    presence: false,
    motif_annulation: null,
  });
  const [contractClients, setContractClients] = useState([]);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isPaymentData, setIsisPaymentData] = useState(null);
  const [listtransactionData, setlisttransactionData] = useState(null);
  const [SelectPay, setSelectPay] = useState(false);
  useEffect(() => {
    // Fetch contract clients
    const fetchContractClients = async () => {
      try {
        const response = await fetch(
          "https://fithouse.pythonanywhere.com/api/transaction_service/"
        );
        const data = await response.json();
        setlisttransactionData(data.data);
      } catch (error) {
        console.error("Error fetching contract clients:", error);
      }
    };

    fetchContractClients();
  }, [selectedReservation]);

  const [transactionData, setTransactionData] = useState({
    id_service: null,
    id_reserv: null,
    id_contrat: null,
    montant: 0,
    reduction: 0,
    type: "Entrée",
    date: getCurrentDate(),
    Type: true,
    mode_reglement: "Espèces",
    description: "",
    id_admin: localStorage.getItem("data")[0].id_employe,
    client: "",
    image: "",
    admin: localStorage.getItem("data")[0].login,
    mode_reservation: "admin",
    id_client: selectedReservation?.id_client,
  });

  useEffect(() => {
    // Fetch contract clients
    const fetchContractClients = async () => {
      try {
        const response = await fetch(
          "https://fithouse.pythonanywhere.com/api/client_contrat/"
        );
        const data = await response.json();
        setContractClients(data.data);
      } catch (error) {
        console.error("Error fetching contract clients:", error);
      }
    };

    fetchContractClients();
  }, []);

  const handlePayment = () => {
    if (!selectedReservation) {
      message.error("Aucune réservation sélectionnée");
      return;
    }
    const serviceTarif = findServiceTarif(selectedReservation.id_service);

    setTransactionData({
      id_service: selectedReservation.id_service,
      id_reserv: selectedReservation.id,
      id_contrat: null,
      montant: serviceTarif || 0,
      reduction: 0,
      type: "Entrée",
    });

    setIsPaymentModalVisible(true);
    setIsModalVisible(false);
  };
  const findServiceTarif = (serviceId) => {
    const service = services.find((s) => s.id_contrat === serviceId);
    return service ? service.Tarif : 0;
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

  const fetchServices = async () => {
    try {
      const response = await fetch(
        "https://fithouse.pythonanywhere.com/api/service/"
      );
      const data = await response.json();
      setServices(data.data);
      console.log(JSON.parse(data.data) + " lllllllllll");
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchServices();
    fetchAndTransformReservations();
  }, []);

  const fetchAndTransformReservations = async () => {
    const reservations = await fetchReservations();
    console.log("====================================");
    console.log(reservations);
    console.log("====================================");
    const transformedEvents = transformReservations(reservations);
    setEvents(transformedEvents);
  };

  const isReservationFormValid = () => {
    return (
      ((isAnonymousReservation && ReservationData.anonymous_client_name) ||
        (!isAnonymousReservation && ReservationData.id_client !== null)) &&
      ReservationData.id_service !== null &&
      ReservationData.date_resrv !== null &&
      ReservationData.date_presence !== null
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

      const response = await fetch(
        "https://fithouse.pythonanywhere.com/api/reservationService/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...ReservationData,
            mode_reservation: "admin",
            is_anonymous: isAnonymousReservation,
          }),
        }
      );

      if (response.ok) {
        const res = await response.json();
        if (res === "Added Successfully!!") {
          message.success("Réservation ajoutée avec succès");
          onCloseR();
          const id_staff = JSON.parse(localStorage.getItem("data"));
          await addNewTrace(
            id_staff[0].id_employe,
            "Ajout",
            getCurrentDate(),
            `${JSON.stringify(ReservationData)}`,
            "reservation_service"
          );
          fetchAndTransformReservations();
          setIsisPaymentData({
            ...ReservationData,
            mode_reservation: "admin",
            tarif: selectedService.Tarif,
          });
          setIsPaymentModalVisible(true);
        } else {
          message.warning(res.msg);
        }
      } else {
        message.error("Error adding reservation");
      }
    } catch (error) {
      console.log(error);
      message.error("An error occurred:", error);
    }
  };

  const updateReservation = async (updatedData) => {
    try {
      updatedData.id_rsv_srvc = updatedData.id;
      const response = await fetch(
        `https://fithouse.pythonanywhere.com/api/reservationService/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (response.ok) {
        message.success("Réservation mise à jour avec succès");
        fetchAndTransformReservations();
      } else {
        message.error("Erreur lors de la mise à jour de la réservation");
      }
    } catch (error) {
      console.log(error);
      message.error("Une erreur est survenue:", error);
    }
  };

  const showDrawerR = () => {
    setOpen1(true);
  };

  const onCloseR = () => {
    setOpen1(false);
    setReservationData({
      id_client: null,
      id_service: null,
      date_resrv: getCurrentDate(),
      date_presence: null,
      status: true,
      presence: false,
      motif_annulation: null,
    });
  };

  const handleReservationSubmit = () => {
    addReservation();
  };

  const handleEventSelect = (event) => {
    console.log(event);

    setSelectedReservation(event);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedReservation(null);
  };

  const handlePresenceChange = (checked) => {
    const updatedReservation = { ...selectedReservation, presence: checked };
    setSelectedReservation(updatedReservation);
    updateReservation(updatedReservation);
  };

  const handleStatusChange = (checked) => {
    if (!checked) {
      setIsCancellationModalVisible(true);
    } else {
      const updatedReservation = {
        ...selectedReservation,
        status: checked,
        motif_annulation: null,
      };
      setSelectedReservation(updatedReservation);
      updateReservation(updatedReservation);
    }
  };

  const handleCancellationConfirm = () => {
    const updatedReservation = {
      ...selectedReservation,
      status: false,
      motif_annulation: cancellationReason,
    };
    setSelectedReservation(updatedReservation);
    updateReservation(updatedReservation);
    setIsCancellationModalVisible(false);
    setCancellationReason("");
  };

  const columns = [
    {
      title: "",
      dataIndex: "attribute",
      key: "attribute",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "",
      dataIndex: "value",
      key: "value",
      render: (text, record) => {
        if (record.key === "status") {
          return text;
        } else if (record.key === "presence") {
          return (
            <Switch
              checked={text}
              onChange={handlePresenceChange}
              checkedChildren="Présent"
              unCheckedChildren="Absent"
            />
          );
        } else {
          return text;
        }
      },
    },
  ];

  const getTableData = (reservation) => {
    if (!selectedReservation) return [];

    const rv = listtransactionData.find(
      (rv) => rv.id_reserv === selectedReservation.id
    );
    const isPaid = rv && rv.date.length > 0;

    // Only update SelectPay if it's different from the current state
    if (isPaid !== SelectPay) {
      setSelectPay(isPaid);
    }
    const data = [
      {
        key: "service",
        attribute: "Service",
        value: reservation.title,
      },
      {
        key: "dateReservation",
        attribute: "Date de réservation",
        value: <Tag>{dayjs(reservation.start).format("YYYY-MM-DD")}</Tag>,
      },
      {
        key: "datePresence",
        attribute: "Date de présence",
        value:
          dayjs(reservation.end).format("YYYY-MM-DD") +
          " de " +
          dayjs(reservation.heur_debut).format("hh:mm") +
          " à " +
          dayjs(reservation.heure_fin).format("hh:mm"),
      },
      {
        key: "status",
        attribute: "Paiement",
        value: isPaid ? (
          <Tag color="green">Payé</Tag>
        ) : (
          <Tag color="red">En cours</Tag>
        ),
      },
      {
        key: "presence",
        attribute: "Présence",
        value: reservation.presence,
      },
      {
        key: "mode",
        attribute: "Mode de reservation",
        value: reservation.mode_reservation,
      },
    ];

    if (!reservation.status) {
      data.push({
        key: "motifAnnulation",
        attribute: "Motif d'annulation",
        value: reservation.motif_annulation || "N/A",
      });
    }

    return data;
  };

  const handleSubmitPayment = async () => {
    if (selectedReservation) {
      if (selectedReservation.reduction == true) {
        const redu = selectedReservation.montant * 0.05;
        selectedReservation.montant = selectedReservation.montant - redu;
        message.success("Réduction 5% Appliquée !");
      } else {
        message.warning("Réduction 5% Non Appliquée !");
      }

      transactionData.montant = selectedReservation.montant;

      try {
        const response = await fetch(
          "https://fithouse.pythonanywhere.com/api/transaction_service/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...transactionData,
              id_admin: await JSON.parse(localStorage.getItem("data"))[0]
                .id_employe,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.msg == "Failed to Add") {
            message.warning("Erreur d'ajout un transaction");
          } else {
            message.success("Paiement effectué avec succès");
            setSelectedReservation(null);
            setIsPaymentModalVisible(false);
            handleModalCancel(); // Close the reservation details modal
            fetchAndTransformReservations(); // Refresh the reservations list
          }
        } else {
          message.error("Erreur lors du paiement");
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        message.error("Une erreur est survenue lors du paiement");
      }
    } else if (isPaymentData) {
      try {
        const response = await fetch(
          "https://fithouse.pythonanywhere.com/api/transaction_service/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...transactionData,
              ...isPaymentData,
              id_admin: await JSON.parse(localStorage.getItem("data"))[0]
                .id_employe,
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.msg == "Failed to Add") {
            message.warning("Erreur d'ajout un transaction");
          } else {
            message.success("Paiement effectué avec succès");
            isPaymentData(null);
            setIsPaymentModalVisible(false);
            handleModalCancel(); // Close the reservation details modal
            fetchAndTransformReservations(); // Refresh the reservations list
          }
        } else {
          message.error("Erreur lors du paiement");
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        message.error("Une erreur est survenue lors du paiement");
      }
    }
  };

  const handleStartTimeChange = (startTime) => {
    console.log(startTime);

    setReservationData((prevData) => {
      const updatedData = { ...prevData, heure_debut: startTime };

      if (selectedService && selectedService.duree) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + selectedService.duree;
        const endHours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
        const endMinutes = String(totalMinutes % 60).padStart(2, "0");
        updatedData.heure_fin = `${endHours}:${endMinutes}`;
        ReservationData.heure_fin = `${endHours}:${endMinutes}`;
      } else {
        updatedData.heure_fin = ""; // Clear end time if no service is selected
      }
      return updatedData;
    });
  };
  const calculateMontantApresReduction = () => {
    const montant = selectedReservation
      ? selectedReservation.montant
      : isPaymentData?.tarif || 0;
    const reduction = transactionData.reduction || 0;
    return montant - montant * (reduction / 100);
  };

  return (
    <div className="w-full p-2">
      <Modal
        title="Compléter les informations de paiement"
        visible={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-4">
          {/* <div className="mt-4">
            <label htmlFor="contrat" className="block font-medium">
              *Client
            </label>
            <Select
              id="contrat"
              showSearch
              placeholder="Contrat"
              className="w-full"
              optionFilterProp="children"
              onChange={(value) => {
                setTransactionData({
                  ...transactionData,
                  id_contrat: selectedReservation.id_client,
                });
              }}
              filterOption={(input, option) =>
                (option?.label ?? "").startsWith(input)
              }
              options={contractClients.map((cli) => ({
                label: `${cli.client} ${cli.Prenom_client}`,
                value: cli.id_contrat,
              }))}
            />
          </div> */}
          <div className="mt-4">
            <label htmlFor="montant" className="block font-medium">
              Montant
            </label>
            <Input
              id="montant"
              disabled={true}
              value={
                (selectedReservation &&
                  selectedReservation?.montant + ".00 MAD") ||
                isPaymentData?.tarif + " MAD"
              }
              onChange={(e) => {
                setTransactionData({
                  ...transactionData,
                  montant: parseFloat(e.target.value),
                });
              }}
              placeholder="Montant"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="reduction" className="block font-medium">
              Réduction (%)
            </label>
            <Input
              id="reduction"
              defaultValue={
                selectedReservation &&
                selectedReservation.mode_reservation == "client"
                  ? 5
                  : 0
              }
              // value={transactionData.reduction}
              onChange={(e) => {
                const newReduction = parseFloat(e.target.value);
                if (
                  isNaN(newReduction) ||
                  newReduction < 0 ||
                  newReduction > 100
                ) {
                  message.error(
                    "La réduction doit être un pourcentage entre 0 et 100."
                  );
                  return;
                }
                setTransactionData({
                  ...transactionData,
                  reduction: newReduction,
                });
              }}
              placeholder="Réduction (%)"
              type="number"
              min="0"
              max="100"
            />
          </div>
          <div className="mt-4">
            <label
              htmlFor="montantApresReduction"
              className="block font-medium"
            >
              Montant après réduction
            </label>
            <Input
              id="montantApresReduction"
              value={`${calculateMontantApresReduction().toFixed(2)} MAD`}
              disabled={true}
              readOnly
            />
          </div>
          {/* <div className="mt-4 w-full">
            <label htmlFor="typeService" className="block font-medium">
              *Type de Service
            </label>
            <Select
              disabled={true}
              id="selectEntree"
              placeholder="Type de service"
              value={transactionData.type}
              defaultValue={"Entrée"}
              className="w-full"
              onChange={(value, option) => {
                setTransactionData({
                  ...transactionData,
                  type: value,
                });
              }}
              style={{ width: 200, marginBottom: 10 }}
            >
              <Option value="Entrée">Entrée</Option>
            </Select>
          </div> */}
          <div>
            <label htmlFor="modeReglement" className="block font-medium mt-4">
              *Mode de Règlement
            </label>
            <Select
              id="modeReglement"
              value={transactionData.mode_reglement}
              // defaultValue={"Espèces"}
              showSearch
              placeholder="Mode de règlement"
              className="w-full"
              optionFilterProp="children"
              onChange={(value) =>
                setTransactionData({
                  ...transactionData,
                  mode_reglement: value,
                })
              }
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={[
                { label: "Chèques", value: "chèques" },
                { label: "Espèces", value: "espèces" },
                { label: "Prélèvements", value: "prélèvements" },
                { label: "TPE", value: "TPE" },
                { label: "Autres", value: "autres" },
              ]}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-10">
            <Button onClick={() => setIsPaymentModalVisible(false)}>
              Annuler
            </Button>
            <Button type="primary" onClick={handleSubmitPayment}>
              Confirmer le paiement
            </Button>
          </div>
        </div>
      </Modal>
      <div className="flex items-center justify-between mt-3">
        {/* heresgment */}
        <div>
          <Button
            type="default"
            onClick={showDrawerR}
            icon={<FileAddOutlined />}
          >
            Ajouter Réservation
          </Button>
        </div>
      </div>
      <div className="mt-5">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 400 }}
          onSelectEvent={handleEventSelect}
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
      <Drawer
        title="Saisir une nouvelle réservation"
        size="default"
        onClose={onCloseR}
        open={open1}
        bodyStyle={{
          paddingBottom: 80,
        }}
      >
        <div className="p-3 md:pt-0 md:pl-0 md:pr-10">
          <Segmented
            options={[
              { label: "Client Fithouse", value: false },
              { label: "Client Passager", value: true },
            ]}
            value={isAnonymousReservation}
            onChange={setIsAnonymousReservation}
            className="mb-4"
          />
          <div className="grid grid-cols-2 gap-4 mt-5">
            <div className="flex flex-col">
              <label htmlFor="">Client</label>
              {isAnonymousReservation ? (
                <Input
                  placeholder="Nom du client anonyme"
                  value={ReservationData.anonymous_client_name}
                  onChange={(e) =>
                    setReservationData({
                      ...ReservationData,
                      anonymous_client_name: e.target.value,
                    })
                  }
                />
              ) : (
                <Select
                  className="w-full"
                  showSearch
                  value={ReservationData.id_client}
                  onChange={(value) => {
                    setReservationData({
                      ...ReservationData,
                      id_client: value,
                    });
                  }}
                  placeholder="Client"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "").includes(input)
                  }
                  filterSort={(optionA, optionB) =>
                    (optionA?.label ?? "")
                      .toLowerCase()
                      .localeCompare((optionB?.label ?? "").toLowerCase())
                  }
                  options={clients.map((client) => ({
                    value: client.id_client,
                    label: `${client.nom_client} ${client.prenom_client}`,
                  }))}
                />
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="">Service</label>
              <Select
                className="w-full"
                showSearch
                value={ReservationData.id_service}
                onChange={(value) => {
                  setReservationData({
                    ...ReservationData,
                    id_service: value,
                  });
                  setSelectedService(
                    services.find((s) => s.ID_service === value)
                  );
                }}
                placeholder="Service"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "").includes(input)
                }
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? "")
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? "").toLowerCase())
                }
                options={services.map((service) => ({
                  value: service.ID_service,
                  label: service.service,
                }))}
              />
            </div>
          </div>
          {selectedService && (
            <div className="mt-5">
              <p>
                <strong>Description:</strong> {selectedService.description}
              </p>
              <p>
                <strong>Tarif:</strong> {selectedService.Tarif}
              </p>
            </div>
          )}
          <div className="mt-5">
            <label htmlFor="">Date de présence</label>
            <Input
              type="date"
              value={ReservationData.date_presence}
              onChange={(e) =>
                setReservationData({
                  ...ReservationData,
                  date_presence: e.target.value,
                })
              }
            />
          </div>
          <div className="mt-5">
            <label htmlFor="">Heur de début</label>
            <Input
              type="Time"
              value={ReservationData.heure_debut}
              onChange={(e) => {
                handleStartTimeChange(e.target.value);
                setReservationData({
                  ...ReservationData,
                  heure_debut: e.target.value,
                });
              }}
            />
          </div>
          <div className="mt-5">
            <label htmlFor="">Heur de fin</label>
            <Input
              type="time"
              disabled={true}
              value={ReservationData.heure_fin}
            />
          </div>
          <Space className="mt-10">
            <Button danger onClick={onCloseR}>
              Annuler
            </Button>
            <Button onClick={handleReservationSubmit} type="default">
              Réservation
            </Button>
          </Space>
        </div>
      </Drawer>

      <Modal
        title="Détails de la réservation"
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Fermer
          </Button>,
          <Button
            disabled={SelectPay}
            key="pay"
            type="primary"
            onClick={handlePayment}
          >
            Payer
          </Button>,
        ]}
        width={600}
      >
        {selectedReservation && (
          <Table
            columns={columns}
            dataSource={getTableData(selectedReservation)}
            pagination={false}
            bordered
          />
        )}
      </Modal>

      <Modal
        title="Motif d'annulation"
        visible={isCancellationModalVisible}
        onOk={handleCancellationConfirm}
        onCancel={() => setIsCancellationModalVisible(false)}
      >
        <Input.TextArea
          rows={4}
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          placeholder="Veuillez saisir le motif d'annulation"
        />
      </Modal>
    </div>
  );
};

const TableReservationServicesPage = () => {
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

  const transformReservations = (reservations) => {
    console.log("====================================");
    console.log(
      Date(reservations[0].date_presence + "T" + reservations[0].heure_fin)
    );
    console.log("====================================");
    return reservations.map((reservation) => ({
      id: reservation.id_reservation,
      id_seance: reservation.id_seance,
      mode_reservation: reservation.mode_reservation,
      title: `${reservation.cour} - ${reservation.cour}`,
      start: new Date(
        reservation.date_presence.split("T")[0] + "T" + reservation.heur_debut
      ),
      end: new Date(
        reservation.date_presence.split("T")[0] + "T" + reservation.heure_fin
      ),
      datestart: reservation.heur_debut,
      dateend: reservation.heure_fin,
      coach: reservation.coach,
      allDay: false,
      resource: reservation.salle,
    }));
  };

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
  const [absenceReason, setAbsenceReason] = useState("");
  const [currentClientId, setCurrentClientId] = useState(null);
  const [ReservationData, setReservationData] = useState({
    id_client: null,
    id_seance: null,
    date_operation: getCurrentDate(),
    date_presence: null,
    status: null,
    presence: null,
    motif_annulation: null,
  });
  const [changedFields, setChangedFields] = useState([]);
  const [isFormChanged, setIsFormChanged] = useState(false);

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
  const updateClientPresence = async (
    clientId,
    isPresent,
    absenceReason = null
  ) => {
    try {
      const response = await fetch(
        "https://fithouse.pythonanywhere.com/api/update_presence/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
          body: JSON.stringify({
            id_client: clientId,
            id_seance: SeancInfos.id_seance,
            presence: isPresent,
            motif_absence: absenceReason,
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
  const handlePresenceChange = async (checked, clientId) => {
    if (checked) {
      // If marking as present, update directly
      try {
        await updateClientPresence(clientId, true);
        setClientPresence((prev) => ({ ...prev, [clientId]: true }));
        message.success(`Présence mise à jour pour le client ${clientId}`);
      } catch (error) {
        message.error("Erreur lors de la mise à jour de la présence");
      }
    } else {
      // If marking as absent, show the modal for absence reason
      setCurrentClientId(clientId);
      setAbsenceReason("");
      setIsAbsenceModalVisible(true);
    }
  };
  const handleAbsenceConfirm = async () => {
    try {
      await updateClientPresence(currentClientId, false, absenceReason);
      setClientPresence((prev) => ({ ...prev, [currentClientId]: false }));
      message.success(`Absence enregistrée pour le client ${currentClientId}`);
      setIsAbsenceModalVisible(false);
    } catch (error) {
      message.error("Erreur lors de l'enregistrement de l'absence");
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
          const id_staff = JSON.parse(localStorage.getItem("data"));
          const res = await addNewTrace(
            id_staff[0].id_employe,
            "Ajout",
            getCurrentDate(),
            `${JSON.stringify(ReservationData)}`,
            "reservation"
          );
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
      console.log("====================================");
      console.log(transformedEvents);
      console.log("====================================");
      setEvents(transformedEvents);
    };

    fetchAndTransformReservations();
  }, [add]);

  const fetchClientParSeance = async (e) => {
    console.log("====================================");
    console.log(e);
    console.log("====================================");
    const authToken = localStorage.getItem("jwtToken");
    try {
      const response = await fetch(
        `https://fithouse.pythonanywhere.com/api/Etudiant_by_resevation?id_seance=${e.id_seance}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const data = await response.json();
      console.log(data); // You can handle the fetched client data here
      setSelectedEventIdSeance(data.data);
    } catch (error) {
      console.error("Error fetching client data:", error);
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
    const dataSource = selectedEventIdSeance.map((obj) => ({
      key: obj.id_client, // or any unique identifier
      fullName: `${obj.nom_client} ${obj.prenom_client}`,
      mail: obj.mail,
    }));
    setevent(dataSource);
  }, [selectedEventIdSeance]);

  return (
    <div className="w-full p-2">
      <Modal
        title="Motif d'absence"
        visible={isAbsenceModalVisible}
        onOk={handleAbsenceConfirm}
        onCancel={() => setIsAbsenceModalVisible(false)}
      >
        <Input.TextArea
          rows={4}
          value={absenceReason}
          onChange={(e) => setAbsenceReason(e.target.value)}
          placeholder="Veuillez saisir le motif d'absence"
        />
      </Modal>
      <div className="flex items-center justify-between mt-3">
        <div>
          <>
            <div className="flex items-center space-x-3">
              {(JSON.parse(localStorage.getItem(`data`))[0].fonction ==
                "Administration" ||
                JSON.parse(localStorage.getItem(`data`))[0].fonction ==
                  "secretaire") && (
                <Button
                  type="default"
                  onClick={showDrawerR}
                  icon={<FileAddOutlined />}
                >
                  Ajouter Réservation
                </Button>
              )}
            </div>
            <Drawer
              title="Saisir une nouvelle réservation"
              size="default"
              onClose={onCloseR}
              closeIcon={false}
              open={open1}
              bodyStyle={{
                paddingBottom: 80,
              }}
            >
              <div className="p-3 md:pt-0 md:pl-0 md:pr-10">
                <div className="grid grid-cols-2 gap-4 mt-5">
                  <div className="flex flex-col">
                    <label htmlFor="">Client</label>
                    <Select
                      className="w-full"
                      showSearch
                      value={ReservationData.id_client}
                      onChange={(value) => {
                        setReservationData({
                          ...ReservationData,
                          id_client: value,
                        });
                        fetchSeance(value, ReservationData.cour);
                      }}
                      placeholder="Client"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? "").includes(input)
                      }
                      filterSort={(optionA, optionB) =>
                        (optionA?.label ?? "")
                          .toLowerCase()
                          .localeCompare((optionB?.label ?? "").toLowerCase())
                      }
                      options={clients.map((client) => ({
                        value: client.id_client,
                        label: `${client.nom_client} ${client.prenom_client}`,
                      }))}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="">Cours</label>
                    <Select
                      className="w-full"
                      showSearch
                      value={ReservationData.cour}
                      onChange={(value) => {
                        setReservationData({
                          ...ReservationData,
                          cour: value,
                        });
                        fetchSeance(ReservationData.id_client, value);
                      }}
                      placeholder="Cours"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? "").includes(input)
                      }
                      filterSort={(optionA, optionB) =>
                        (optionA?.label ?? "")
                          .toLowerCase()
                          .localeCompare((optionB?.label ?? "").toLowerCase())
                      }
                      options={Cour.map((cour) => ({
                        value: cour.id_cour,
                        label: `${cour.nom_cour}`,
                      }))}
                    />
                  </div>
                </div>
                <div className="flex flex-col mt-5">
                  <label htmlFor="">Seance</label>
                  <Select
                    className="w-full"
                    showSearch
                    disabled={Seance.length <= 0}
                    value={ReservationData.id_seance}
                    onChange={(value) => {
                      const selectedSeance = Seance.find(
                        (seance) => seance.id_seance === value
                      );
                      setSelectedSeance(selectedSeance);
                      setReservationData({
                        ...ReservationData,
                        id_seance: value,
                      });
                    }}
                    placeholder="Seance"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? "").includes(input)
                    }
                    filterSort={(optionA, optionB) =>
                      (optionA?.label ?? "")
                        .toLowerCase()
                        .localeCompare((optionB?.label ?? "").toLowerCase())
                    }
                    options={Seance.map((seance) => ({
                      value: seance.id_seance,
                      label: `${seance.cour} ${seance.day_name} ${seance.heure_debut} ${seance.heure_fin}`,
                    }))}
                  />
                </div>
                <div className="mt-5">
                  <label htmlFor="">Creneau</label>
                  <Input
                    disabled={true}
                    className="w-full"
                    value={selectedSeance.date_reservation || ""}
                  />
                </div>
                <div>
                  Du {selectedSeance.heure_debut || ""} à{" "}
                  {selectedSeance.heure_fin || ""}
                </div>
                <Space className="mt-10">
                  <Button danger onClick={onCloseR}>
                    Annuler
                  </Button>
                  <Button onClick={handleReservationSubmit} type="default">
                    Réservation
                  </Button>
                </Space>
              </div>
            </Drawer>
          </>
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

          <div className="h-96 overflow-y-auto mt-10">
            <div>Liste des clients qu’ont réservé la séance</div>
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
                // {
                //   title: "Présence",
                //   key: "presence",
                //   render: (_, record) => (
                //     <Switch
                //       defaultValue={true}
                //       checked={clientPresence[record.key] || false}
                //       onChange={(checked) =>
                //         handlePresenceChange(checked, record.key)
                //       }
                //     />
                //   ),
                // },
              ]}
              dataSource={event}
              pagination={false}
              bordered
              // style={{ height: "400px", overflowY: "auto" }}
              size="small"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export const TableReservationServices = () => {
  const [activeTab, setActiveTab] = useState("reservations");

  return (
    <div className="w-full p-2">
      <Segmented
        className="ml-2"
        value={activeTab}
        onChange={(value) => setActiveTab(value)}
        options={[
          {
            label: "Services",
            value: "reservations",
          },
          {
            label: "Séance",
            value: "reservation-services",
          },
        ]}
      />

      {activeTab === "reservations" && <TableReservations />}
      {activeTab === "reservation-services" && <TableReservationServicesPage />}
    </div>
  );
};
