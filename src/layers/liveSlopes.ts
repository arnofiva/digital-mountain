import StreamLayer from "@arcgis/core/layers/StreamLayer";
import { UniqueValueRenderer } from "@arcgis/core/renderers";

import { defaultSlopeSymbol, openSlopeSymbol, preparingSlopeSymbol } from "../symbols";

const url =
  "https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/streams/arcgis/rest/services/slopesStatusStream/StreamServer";

const createSlopeStream = () =>
  new StreamLayer({
    url,
    title: "Slopes Status",
    purgeOptions: {
      displayCount: 10000
    },
    elevationInfo: {
      mode: "on-the-ground"
    },
    definitionExpression: "STATUS in ('Offen', 'In Vorbereitung', 'Geschlossen')",
    renderer: new UniqueValueRenderer({
      field: "STATUS",
      defaultSymbol: defaultSlopeSymbol,
      uniqueValueInfos: [
        {
          value: "Offen",
          symbol: openSlopeSymbol
        },
        {
          value: "In Vorbereitung",
          symbol: preparingSlopeSymbol
        }
      ]
    })
  });

export default createSlopeStream;
