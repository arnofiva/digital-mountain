import StreamLayer from "@arcgis/core/layers/StreamLayer";
import { UniqueValueRenderer } from "@arcgis/core/renderers";
import { FillSymbol3DLayer, PolygonSymbol3D } from "@arcgis/core/symbols";


const url =
  "https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/streams/arcgis/rest/services/slopesStatusStream/StreamServer";


const createSlopeStream = () => new StreamLayer({
  url,
  title: "Slopes Status",
  opacity: 0.4,
  purgeOptions: {
    displayCount: 10000
  },
  elevationInfo: {
    mode: "on-the-ground"
  },
  definitionExpression: "STATUS in ('Offen', 'In Vorbereitung', 'Geschlossen')",
  renderer: new UniqueValueRenderer({
    field: "STATUS",
    defaultSymbol: new PolygonSymbol3D({
      symbolLayers: [
        new FillSymbol3DLayer({
          material: {
            color: "#e3e3e3"
          }
        })
      ]
    }),
    uniqueValueInfos: [
      {
        value: "Offen",
        symbol: new PolygonSymbol3D({
          symbolLayers: [
            new FillSymbol3DLayer({
              material: {
                color: "#4fa0e3"
              }
            })
          ]
        })
      },
      {
        value: "In Vorbereitung",
        symbol: new PolygonSymbol3D({
          symbolLayers: [
            new FillSymbol3DLayer({
              material: {
                color: "#e3ad4f"
              }
            })
          ]
        })
      },
    ]
  })
});

export default createSlopeStream;
