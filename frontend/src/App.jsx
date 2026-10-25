import { useEffect, useState } from "react";
import "./App.css";
import BarberPanel from "./barberPanel";

const API_URL = "http://localhost:5000/api";

const barbers = [
    {
        id: 1,
        name: "Sebastian"
    },
    {
        id: 2,
        name: "Małgorzata"
    },
    {
        id: 3,
        name: "Hubert"
    }
];

function App() {
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);

    const [selectedBarber, setSelectedBarber] = useState(null);

    const [date, setDate] = useState("");
    const [appointments, setAppointments] = useState([]);
    const [selectedHour, setSelectedHour] = useState("");

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch(`${API_URL}/services`)
            .then((response) => response.json())
            .then((data) => setServices(data))
            .catch(() => {
                setMessage("Nie udało się pobrać usług");
            });
    }, []);

    useEffect(() => {
        if (!date || !selectedBarber) {
            setAppointments([]);
            setSelectedHour("");
            return;
        }

        fetch(
            `${API_URL}/appointments/date/${date}?barber_id=${selectedBarber.id}`
        )
            .then((response) => response.json())
            .then((data) => {
                setAppointments(data);
                setSelectedHour("");
            })
            .catch(() => {
                setMessage("Nie udało się pobrać terminów");
            });
    }, [date, selectedBarber]);

    const hours = [];

    for (let hour = 10; hour < 18; hour++) {
        for (const minutes of [0, 30]) {
            const time = `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

            hours.push({
                time,
                available: !appointments.some((appointment) => {
                    const appointmentTime = new Date(
                        appointment.appointment_date
                    )
                        .toISOString()
                        .slice(11, 16);

                    return appointmentTime === time;
                })
            });
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!selectedService) {
            setMessage("Wybierz usługę");
            return;
        }

        if (!selectedBarber) {
            setMessage("Wybierz barbera");
            return;
        }

        if (!date) {
            setMessage("Wybierz datę");
            return;
        }

        if (!selectedHour) {
            setMessage("Wybierz godzinę");
            return;
        }

        setLoading(true);
        setMessage("");

        const appointmentDate = `${date} ${selectedHour}:00`;

        try {
            const response = await fetch(`${API_URL}/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    customer_email: customerEmail,
                    service_id: selectedService.id,
                    appointment_date: appointmentDate,
                    barber_id: selectedBarber.id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Nie udało się zarezerwować wizyty");
                setLoading(false);
                return;
            }

            setMessage("Wizyta została zarezerwowana!");

            setCustomerName("");
            setCustomerPhone("");
            setCustomerEmail("");
            setSelectedHour("");

            const refreshed = await fetch(
                `${API_URL}/appointments/date/${date}?barber_id=${selectedBarber.id}`
            );

            const refreshedAppointments = await refreshed.json();

            setAppointments(refreshedAppointments);
        } catch (error) {
            setMessage("Błąd połączenia z serwerem");
        }

        setLoading(false);
    }

    if (window.location.pathname === "/barber") {
        return <BarberPanel />;
    }

    return (
        <div className="app">
            <header className="hero">
                <div className="hero-overlay">
                    <p className="eyebrow">PREMIUM BARBERSHOP</p>

                    <h1>
                        Rezerwacja
                        <br />
                        wizyty
                    </h1>

                    <p className="hero-description">
                        Wybierz usługę, barbera oraz dogodny termin.
                    </p>
                </div>
            </header>

            <main className="booking-container">
                <section className="booking-card">
                    <div className="section">
                        <p className="section-number">01</p>

                        <h2>Wybierz usługę</h2>

                        <div className="service-grid">
                            {services.map((service) => (
                                <button
                                    key={service.id}
                                    className={`service-card ${
                                        selectedService?.id === service.id
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setSelectedService(service)
                                    }
                                >
                                    <span className="service-name">
                                        {service.name}
                                    </span>

                                    <span className="service-details">
                                        {service.duration} min
                                    </span>

                                    <span className="service-price">
                                        {service.price} zł
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="divider" />

                    <div className="section">
                        <p className="section-number">02</p>

                        <h2>Wybierz barbera</h2>

                        <div className="barber-grid">
                            {barbers.map((barber) => (
                                <button
                                    key={barber.id}
                                    className={`barber-card ${
                                        selectedBarber?.id === barber.id
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setSelectedBarber(barber)
                                    }
                                >
                                    <div className="barber-avatar">
                                        {barber.name.charAt(0)}
                                    </div>

                                    <span>{barber.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="divider" />

                    <div className="section">
                        <p className="section-number">03</p>

                        <h2>Wybierz termin</h2>

                        <input
                            className="date-input"
                            type="date"
                            value={date}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(event) =>
                                setDate(event.target.value)
                            }
                        />

                        {date && selectedBarber && (
                            <div className="hours-grid">
                                {hours.map((hour) => (
                                    <button
                                        key={hour.time}
                                        disabled={!hour.available}
                                        className={`hour-button ${
                                            !hour.available
                                                ? "unavailable"
                                                : selectedHour === hour.time
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setSelectedHour(hour.time)
                                        }
                                    >
                                        {hour.available
                                            ? hour.time
                                            : `✕ ${hour.time}`}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="divider" />

                    <div className="section">
                        <p className="section-number">04</p>

                        <h2>Twoje dane</h2>

                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Imię i nazwisko"
                                value={customerName}
                                onChange={(event) =>
                                    setCustomerName(event.target.value)
                                }
                                required
                            />

                            <input
                                type="tel"
                                placeholder="Numer telefonu"
                                value={customerPhone}
                                onChange={(event) =>
                                    setCustomerPhone(event.target.value)
                                }
                                required
                            />

                            <input
                                type="email"
                                placeholder="E-mail"
                                value={customerEmail}
                                onChange={(event) =>
                                    setCustomerEmail(event.target.value)
                                }
                            />

                            <button
                                className="submit-button"
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "REZERWOWANIE..."
                                    : "ZAREZERWUJ WIZYTĘ"}
                            </button>
                        </form>

                        {message && (
                            <div className="message">
                                {message}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default App;