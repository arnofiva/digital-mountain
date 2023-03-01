import { SlopeStreamEvent } from "../../interfaces";

const morningUpdates: SlopeStreamEvent[] = [
  // {
  //   attributes: {
  //     track_id: 255,
  //     STATUS: "Offen",
  //     showAlert: true
  //   }
  // },
  {
    attributes: {
      track_id: 300,
      STATUS: "Offen",
      showAlert: true,
    }
  },
  {
    attributes: {
      track_id: 266,
      STATUS: "Offen",
      showAlert: true
    }
  },
  {
    attributes: {
      track_id: 306,
      STATUS: "Offen",
      showAlert: true,
    }
  },
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
      track_id: 351,
      STATUS: "Geschlossen",
      showAlert: true
    }
  }
];

export const slopeEventsMorning = morningUpdates.map((message, idx) => ({
  message,
  msAfterStart: (idx) * 6000 + 1500
}));

export const slopeEventsEvening = eveningUpdates.map((message, idx) => ({
  message,
  msAfterStart: (idx) * 3000 + 1500
}));

export const slopeResetMessagesMorning = eveningUpdates.map((message) => ({
  attributes: {
    track_id: message.attributes.track_id,
    STATUS: "Offen",
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
