import { PickupDay, Slot } from "../types";
import { ClockIcon } from "./icons";

interface SchedulePickupProps {
  day: PickupDay;
  setDay: (day: PickupDay) => void;
  slots: Slot[];
  selectedSlot: Slot | null;
  setSelectedSlot: (slot: Slot) => void;
  expiredNotice: boolean;
  todayClosed: boolean;
  isTodayClosed: boolean;
}

export default function SchedulePickup({
  day,
  setDay,
  slots,
  selectedSlot,
  setSelectedSlot,
  expiredNotice,
  todayClosed,
  isTodayClosed,
}: SchedulePickupProps) {
  return (
    <div className="section-card">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-5)",
        }}
      >
        <div>
          <p className="eyebrow" style={{ marginBottom: "var(--space-1)" }}>
            Pickup details
          </p>
          <h2 className="section-card-title" style={{ marginBottom: 0 }}>
            Schedule pickup
          </h2>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--radius-control)",
            background: "var(--green-soft)",
            color: "var(--green)",
            display: "grid",
            placeItems: "center",
          }}
          aria-hidden="true"
        >
          <ClockIcon />
        </div>
      </div>

      {/* Day segmented control */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <p
          style={{
            fontSize: "var(--text-subhead)",
            fontWeight: 700,
            color: "var(--text-secondary)",
            marginBottom: "var(--space-3)",
          }}
        >
          Pickup day
        </p>
        <div className="segmented-control" role="group" aria-label="Pickup day">
          <div
            className={`segmented-thumb${day === "tomorrow" ? " right" : ""}`}
            aria-hidden="true"
          />
          <button
            type="button"
            className={`segmented-option${day === "today" ? " active" : ""}`}
            onClick={() => setDay("today")}
            aria-pressed={day === "today"}
            disabled={isTodayClosed && day !== "today"}
          >
            Today
            {isTodayClosed && (
              <span
                style={{
                  display: "block",
                  fontSize: "var(--text-caption)",
                  fontWeight: 600,
                  color: "var(--text-tertiary)",
                }}
              >
                Closed
              </span>
            )}
          </button>
          <button
            type="button"
            className={`segmented-option${day === "tomorrow" ? " active" : ""}`}
            onClick={() => setDay("tomorrow")}
            aria-pressed={day === "tomorrow"}
          >
            Tomorrow
          </button>
        </div>

        {todayClosed && day === "tomorrow" && (
          <p
            className="closed-notice"
            role="status"
            aria-live="polite"
            style={{ marginTop: "var(--space-3)" }}
          >
            Store is closed for today. Showing tomorrow's slots.
          </p>
        )}
      </div>

      {/* Time slots */}
      <div>
        <p
          style={{
            fontSize: "var(--text-subhead)",
            fontWeight: 700,
            color: "var(--text-secondary)",
            marginBottom: "var(--space-3)",
          }}
        >
          Pickup time
        </p>

        {expiredNotice && (
          <p
            className="expired-notice"
            role="status"
            aria-live="polite"
          >
            Your previous slot is no longer available. We have selected the next available time.
          </p>
        )}

        {slots.length === 0 ? (
          <p className="closed-notice">
            No slots available for today. Please select tomorrow.
          </p>
        ) : (
          <div
            className="slots-grid"
            role="listbox"
            aria-label="Available pickup times"
            aria-activedescendant={selectedSlot ? `slot-${selectedSlot.id}` : undefined}
          >
            {slots.map((slot) => (
              <button
                key={slot.id}
                id={`slot-${slot.id}`}
                type="button"
                role="option"
                aria-selected={selectedSlot?.id === slot.id}
                className={[
                  "slot-chip",
                  selectedSlot?.id === slot.id ? "selected" : "",
                  slot.isAsap ? "asap" : "",
                ].join(" ").trim()}
                onClick={() => setSelectedSlot(slot)}
              >
                {slot.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
