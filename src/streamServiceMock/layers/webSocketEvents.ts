
type StreamLayerEvent = {

  msAfterStart: number;

  message: {
    attributes: {
      track_id: number;
    },
    geometry?: {
      spatialReference: any;
    }
  }

};

export default StreamLayerEvent;