
import React, { useState } from "react";

const buttonStyle = {
  padding: "8px 14px",
  border: "1px solid #b8bec5",
  borderRadius: 4,
  background: "#fff",
  color: "#263238",
  cursor: "pointer",
};

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const monthDays = (month) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

const App = () => {
  const [month, setMonth] = useState(() => new Date());
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  const openCreate = (date = new Date()) => {
    setTitle("");
    setLocation("");
    setModal({ kind: "create", date: dateKey(date) });
  };

  const openEvent = (event) => setModal({ kind: "actions", event });

  const beginEdit = () => {
    setTitle(modal.event.title);
    setLocation(modal.event.location);
    setModal({ ...modal, kind: "edit" });
  };

  const saveEvent = (event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedLocation = location.trim();
    if (!trimmedTitle) return;

    if (modal.kind === "create") {
      setEvents((current) => [
        ...current,
        { id: Date.now(), date: modal.date, title: trimmedTitle, location: trimmedLocation },
      ]);
    } else {
      setEvents((current) => current.map((item) => (
        item.id === modal.event.id
          ? { ...item, title: trimmedTitle, location: trimmedLocation }
          : item
      )));
    }
    setModal(null);
  };

  const deleteEvent = () => {
    setEvents((current) => current.filter((event) => event.id !== modal.event.id));
    setModal(null);
  };

  const visibleEvents = (date) => events.filter((event) => {
    if (event.date !== dateKey(date)) return false;
    const isPast = event.date < dateKey(new Date());
    return filter === "all" || (filter === "past" && isPast) || (filter === "upcoming" && !isPast);
  });

  const changeMonth = (amount) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  return (
    <div style={{ maxWidth: 1080, margin: "24px auto", padding: "0 16px", color: "#263238", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Event Tracker</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "past", "upcoming"].map((value) => (
            <button
              className="btn"
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              style={{ ...buttonStyle, background: filter === value ? "#e8f0f2" : "#fff" }}
            >
              {value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
          <button className="btn" type="button" onClick={() => openCreate()} style={buttonStyle}>
            Add Event
          </button>
        </div>
      </header>

      <section aria-label="Calendar">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} style={buttonStyle}>Previous</button>
          <h2 style={{ margin: 0, fontSize: 20 }}>{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2>
          <button type="button" aria-label="Next month" onClick={() => changeMonth(1)} style={buttonStyle}>Next</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", borderTop: "1px solid #cbd1d6", borderLeft: "1px solid #cbd1d6" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} style={{ padding: 8, borderRight: "1px solid #cbd1d6", borderBottom: "1px solid #cbd1d6", fontWeight: 700 }}>{day}</div>
          ))}
          {monthDays(month).map((date) => {
            const dayEvents = visibleEvents(date);
            const isCurrentMonth = date.getMonth() === month.getMonth();
            return (
              <div
                key={dateKey(date)}
                onClick={() => dayEvents.length ? openEvent(dayEvents[0]) : openCreate(date)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    dayEvents.length ? openEvent(dayEvents[0]) : openCreate(date);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Create or view event on ${date.toLocaleDateString()}`}
                style={{ minHeight: 96, padding: 6, borderRight: "1px solid #cbd1d6", borderBottom: "1px solid #cbd1d6", background: isCurrentMonth ? "#fff" : "#f5f6f7", color: isCurrentMonth ? "#263238" : "#92999f", cursor: "pointer" }}
              >
                <div style={{ marginBottom: 5 }}>{date.getDate()}</div>
                {dayEvents.map((event) => {
                  const isPast = event.date < dateKey(new Date());
                  return (
                    <button
                      className="rbc-event"
                      key={event.id}
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        openEvent(event);
                      }}
                      style={{ display: "block", width: "100%", marginBottom: 3, padding: "4px 6px", border: 0, borderRadius: 3, textAlign: "left", color: "#172026", backgroundColor: isPast ? "rgb(222, 105, 135)" : "rgb(140, 189, 76)", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {event.title}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>

      {modal && (
        <div
          className="mm-popup"
          role="presentation"
          onClick={(event) => { if (event.target === event.currentTarget) setModal(null); }}
          style={{ position: "fixed", inset: 0, zIndex: 10, display: "grid", placeItems: "center", padding: 16, background: "rgba(20, 28, 32, 0.45)" }}
        >
          <div className="mm-popup__box" role="dialog" aria-modal="true" aria-label={modal.kind === "actions" ? "Event options" : modal.kind === "edit" ? "Edit event" : "Create event"} style={{ width: "min(420px, 100%)", padding: 20, borderRadius: 5, background: "#fff", color: "#263238", boxShadow: "0 8px 30px rgba(0,0,0,.2)" }}>
            {modal.kind === "actions" ? (
              <>
                <h2 style={{ margin: "0 0 8px", fontSize: 21 }}>{modal.event.title}</h2>
                <p style={{ margin: "0 0 18px", color: "#59636a" }}>{modal.event.location || "No location"} · {modal.event.date}</p>
                <div className="mm-popup__box__footer__right-space" style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button className="mm-popup__btn mm-popup__btn--danger" type="button" onClick={deleteEvent} style={{ ...buttonStyle, background: "#f8e5e9" }}>Delete</button>
                  <button className="mm-popup__btn mm-popup__btn--info" type="button" onClick={beginEdit} style={{ ...buttonStyle, background: "#e4eff3" }}>Edit</button>
                </div>
              </>
            ) : (
              <form onSubmit={saveEvent}>
                <h2 style={{ margin: "0 0 16px", fontSize: 21 }}>{modal.kind === "edit" ? "Edit Event" : "Create Event"}</h2>
                <label style={{ display: "block", marginBottom: 12 }}>
                  <span style={{ display: "block", marginBottom: 5 }}>Title</span>
                  <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Event Title" required style={{ boxSizing: "border-box", width: "100%", padding: 9, border: "1px solid #b8bec5", borderRadius: 3 }} />
                </label>
                <label style={{ display: "block", marginBottom: 18 }}>
                  <span style={{ display: "block", marginBottom: 5 }}>Location</span>
                  <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Event Location" style={{ boxSizing: "border-box", width: "100%", padding: 9, border: "1px solid #b8bec5", borderRadius: 3 }} />
                </label>
                <div className="mm-popup__box__footer__right-space" style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button className="mm-popup__btn" type="button" onClick={() => setModal(null)} style={buttonStyle}>Cancel</button>
                  <button className="mm-popup__btn" type="submit" style={{ ...buttonStyle, background: "#e4eff3" }}>Save</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
