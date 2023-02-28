import { SlopeStreamEvent } from "../../interfaces";

const updates: SlopeStreamEvent[] = [
  {
    attributes: {
      track_id: 255,
      STATUS: "Offen",
      showAlert: true
    }
  },
  {
    attributes: {
      track_id: 266,
      STATUS: "Offen",
      showAlert: true
    }
  }
];

export const slopeEventsMorning = updates.map((message, idx) => ({
  message,
  msAfterStart: (idx + 1) * 6000
}));

export const slopeEventsEvening = updates.map((message, idx) => ({
  message,
  msAfterStart: (idx + 1) * 3000
}));

export const slopeResetMessages = updates.map((message) => ({
  attributes: {
    track_id: message.attributes.track_id,
    STATUS: "In Vorbereitung",
    showAlert: false
  }
}));
