import { SlopeStreamEvent } from "../../interfaces";

const morningUpdates: SlopeStreamEvent[] = [
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

const eveningUpdates: SlopeStreamEvent[] = [
  {
    attributes: {
      track_id: 255,
      STATUS: "Geschlossen",
      showAlert: true
    }
  },
  {
    attributes: {
      track_id: 266,
      STATUS: "Geschlossen",
      showAlert: true
    }
  }
];

export const slopeEventsMorning = morningUpdates.map((message, idx) => ({
  message,
  msAfterStart: (idx + 1) * 6000
}));

export const slopeEventsEvening = eveningUpdates.map((message, idx) => ({
  message,
  msAfterStart: (idx + 1) * 3000
}));

export const slopeResetMessagesMorning = eveningUpdates.map((message) => ({
  attributes: {
    track_id: message.attributes.track_id,
    STATUS: "In Vorbereitung",
    showAlert: false
  }
}));

export const slopeResetMessagesEvening = morningUpdates.map((message) => ({
  attributes: {
    track_id: message.attributes.track_id,
    STATUS: "Offen",
    showAlert: false
  }
}));
