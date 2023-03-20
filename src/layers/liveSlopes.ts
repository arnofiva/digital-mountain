import { UniqueValueRenderer } from "@arcgis/core/renderers";
import { FillSymbol3DLayer, PolygonSymbol3D } from "@arcgis/core/symbols";

export const slopeStreamLayerProperties = () =>
  ({
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
        {
          value: "Geschlossen",
          symbol: new PolygonSymbol3D({
            symbolLayers: [
              new FillSymbol3DLayer({
                material: {
                  color: [100, 100, 100]
                }
              })
            ]
          })
        }
      ]
    })
  } as const);
