import StreamLayer from "@arcgis/core/layers/StreamLayer";
import { UniqueValueRenderer } from "@arcgis/core/renderers";
import { FillSymbol3DLayer, PolygonSymbol3D } from "@arcgis/core/symbols";

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
      defaultSymbol: new PolygonSymbol3D({
        symbolLayers: [
          new FillSymbol3DLayer({
            material: {
              color: "gray"
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
                  color: "blue"
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
                  color: "orange"
                }
              })
            ]
          })
        }
      ]
    })
  });

export default createSlopeStream;
