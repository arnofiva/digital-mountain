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

const slopeEvents = updates.map((message, idx) => ({
  message,
  msAfterStart: (idx + 1) * 6000
}));

export default slopeEvents;
