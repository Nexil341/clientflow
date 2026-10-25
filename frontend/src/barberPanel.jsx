import { useEffect, useState } from "react";
import "./barberPanel.css";

const API_URL = "http://localhost:5000/api";

function barberPanel() {
    const [token, setToken] = useState(
        localStorage.getItem("barberToken")
    );

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [appointments, setAppointments] = useState([]);
    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);

    async function login(event) {
        event.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Błędny login lub hasło"
                );
                setLoading(false);
                return;
            }

            localStorage.setItem(
                "barberToken",
                data.token
            );

            setToken(data.token);
        } catch (error) {
            setMessage("Błąd połączenia z serwerem");
        }

        setLoading(false);
    }

    async function loadAppointments() {
        const currentToken =
            localStorage.getItem("barberToken");

        if (!currentToken) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/appointments`,
                {
                    headers: {
                        Authorization: `Bearer ${currentToken}`
                    }
                }
            );

            if (response.status === 401) {
                logout();
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Nie udało się pobrać wizyt"
                );
                return;
            }

            setAppointments(data);
        } catch (error) {
            setMessage("Błąd połączenia z serwerem");
        }
    }

    useEffect(() => {
        if (token) {
            loadAppointments();
        }
    }, [token]);

    async function changeStatus(id, status) {
        const currentToken =
            localStorage.getItem("barberToken");

        try {
            const response = await fetch(
                `${API_URL}/appointments/${id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${currentToken}`
                    },
                    body: JSON.stringify({
                        status
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Nie udało się zmienić statusu"
                );
                return;
            }

            loadAppointments();
        } catch (error) {
            setMessage("Błąd połączenia z serwerem");
        }
    }

    async function deleteAppointment(id) {
        const confirmed = window.confirm(
            "Czy na pewno chcesz usunąć tę wizytę?"
        );

        if (!confirmed) {
            return;
        }

        const currentToken =
            localStorage.getItem("barberToken");

        try {
            const response = await fetch(
                `${API_URL}/appointments/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${currentToken}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Nie udało się usunąć wizyty"
                );
                return;
            }

            loadAppointments();
        } catch (error) {
            setMessage("Błąd połączenia z serwerem");
        }
    }

    function logout() {
        localStorage.removeItem("barberToken");
        setToken(null);
        setAppointments([]);
    }

    if (!token) {
        return (
            <div className="barber-login">
                <div className="login-card">
                    <p className="login-eyebrow">
                        BARBERSHOP
                    </p>

                    <h1>Panel barbera</h1>

                    <p className="login-description">
                        Zaloguj się, aby zarządzać wizytami.
                    </p>

                    <form onSubmit={login}>
                        <input
                            type="text"
                            placeholder="Login"
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            required
                        />

                        <input
                            type="password"
                            placeholder="Hasło"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                        />

                        <button
                            className="login-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "LOGOWANIE..."
                                : "ZALOGUJ SIĘ"}
                        </button>
                    </form>

                    {message && (
                        <div className="panel-message">
                            {message}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="barber-panel">
            <header className="panel-header">
                <div>
                    <p className="panel-eyebrow">
                        BARBERSHOP
                    </p>

                    <h1>Panel wizyt</h1>
                </div>

                <div className="header-actions">
                    <button
                        className="refresh-button"
                        onClick={loadAppointments}
                    >
                        ODŚWIEŻ
                    </button>

                    <button
                        className="logout-button"
                        onClick={logout}
                    >
                        WYLOGUJ
                    </button>
                </div>
            </header>

            <main className="appointments-container">
                <div className="appointments-header">
                    <div>
                        <span>WIZYTY</span>
                        <h2>Twoje rezerwacje</h2>
                    </div>

                    <div className="appointment-count">
                        {appointments.length}
                    </div>
                </div>

                {message && (
                    <div className="panel-message">
                        {message}
                    </div>
                )}

                {appointments.length === 0 ? (
                    <div className="empty-state">
                        <h3>Brak wizyt</h3>
                        <p>
                            Nie masz jeszcze żadnych rezerwacji.
                        </p>
                    </div>
                ) : (
                    <div className="appointments-list">
                        {appointments.map((appointment) => {
                            const appointmentDate =
                                new Date(
                                    appointment.appointment_date
                                );

                            return (
                                <div
                                    className="appointment-card"
                                    key={appointment.id}
                                >
                                    <div className="appointment-time">
                                        <strong>
                                            {appointmentDate.toLocaleDateString(
                                                "pl-PL"
                                            )}
                                        </strong>

                                        <span>
                                            {appointmentDate.toLocaleTimeString(
                                                "pl-PL",
                                                {
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                }
                                            )}
                                        </span>
                                    </div>

                                    <div className="appointment-info">
                                        <h3>
                                            {
                                                appointment.customer_name
                                            }
                                        </h3>

                                        <p>
                                            {
                                                appointment.service_name
                                            }
                                        </p>

                                        <div className="customer-details">
                                            <span>
                                                {
                                                    appointment.customer_phone
                                                }
                                            </span>

                                            {appointment.customer_email && (
                                                <span>
                                                    {
                                                        appointment.customer_email
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="appointment-actions">
                                        <span
                                            className={`status ${appointment.status}`}
                                        >
                                            {appointment.status}
                                        </span>

                                        {appointment.status ===
                                            "pending" && (
                                            <button
                                                onClick={() =>
                                                    changeStatus(
                                                        appointment.id,
                                                        "confirmed"
                                                    )
                                                }
                                            >
                                                POTWIERDŹ
                                            </button>
                                        )}

                                        {appointment.status !==
                                            "cancelled" && (
                                            <button
                                                className="cancel"
                                                onClick={() =>
                                                    changeStatus(
                                                        appointment.id,
                                                        "cancelled"
                                                    )
                                                }
                                            >
                                                ANULUJ
                                            </button>
                                        )}

                                        <button
                                            className="delete"
                                            onClick={() =>
                                                deleteAppointment(
                                                    appointment.id
                                                )
                                            }
                                        >
                                            USUŃ
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

export default barberPanel;