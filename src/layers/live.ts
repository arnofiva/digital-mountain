import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import StreamLayer from "@arcgis/core/layers/StreamLayer";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import { SimpleRenderer } from "@arcgis/core/renderers";
import SizeVariable from "@arcgis/core/renderers/visualVariables/SizeVariable";
import { LabelSymbol3D, ObjectSymbol3DLayer, PointSymbol3D, TextSymbol3DLayer } from "@arcgis/core/symbols";
import LineCallout3D from "@arcgis/core/symbols/callouts/LineCallout3D";

export const snowCatStream = new StreamLayer({
  url: "https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/streams/arcgis/rest/services/snowCat_StreamLayer4/StreamServer",
  title: "Snow Cat Stream",
  visible: false,
  elevationInfo: {
    mode: "on-the-ground"
  },

  purgeOptions: {
    displayCount: 10000
  },
  labelingInfo: [
    new LabelClass({
      labelExpressionInfo: { expression: "return 'SnowCat'" },
      symbol: new LabelSymbol3D({
        verticalOffset: {
          screenLength: 20,
          maxWorldLength: 20,
          minWorldLength: 5
        },
        callout: new LineCallout3D({
          size: 0.5,
          color: [0, 0, 0]
        }),
        symbolLayers: [
          new TextSymbol3DLayer({
            material: { color: "white" },
            size: 16, // Defined in points
            background: {
              color: [0, 0, 0, 0.4]
            }
          })
        ]
      })
    })
  ],
  renderer: new SimpleRenderer({
    symbol: new PointSymbol3D({
      symbolLayers: [
        new ObjectSymbol3DLayer({
          resource: {
            href: "https://static.arcgis.com/arcgis/styleItems/RealisticTransportation/gltf/resource/Backhoe.glb"
          },
          // width: 3.046784222126007,
          height: 50,
          heading: 220,
          tilt: -10
          // depth: 4.3906859159469604
        })
      ]
    })
  })
});

export const snowCatLive = new FeatureLayer({
  url: "https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/maps/arcgis/rest/services/snowCat_StreamLayer4/FeatureServer",
  title: "Snow Cat",
  visible: false,
  elevationInfo: {
    mode: "on-the-ground"
  },
  refreshInterval: 0.001,
  labelingInfo: [
    new LabelClass({
      labelExpressionInfo: { expression: "return 'SnowCat'" },
      symbol: new LabelSymbol3D({
        verticalOffset: {
          screenLength: 20,
          maxWorldLength: 20,
          minWorldLength: 5
        },
        callout: new LineCallout3D({
          size: 0.5,
          color: [0, 0, 0]
        }),
        symbolLayers: [
          new TextSymbol3DLayer({
            material: { color: "white" },
            size: 16, // Defined in points
            background: {
              color: [0, 0, 0, 0.4]
            }
          })
        ]
      })
    })
  ],
  renderer: new SimpleRenderer({
    symbol: new PointSymbol3D({
      symbolLayers: [
        new ObjectSymbol3DLayer({
          width: 5, // diameter of the object from east to west in meters
          height: 10, // height of the object in meters
          depth: 5, // diameter of the object from north to south in meters
          resource: { primitive: "cylinder" },
          material: { color: "red" }
        })
      ]
    })
  })
});

export const visitorCountStream = new StreamLayer({
  url: "https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/streams/arcgis/rest/services/visitorCount_StreamLayer2/StreamServer",
  title: "Visitor Count Stream",
  visible: false,
  elevationInfo: {
    mode: "on-the-ground"
  },
  purgeOptions: {
    displayCount: 10000
  },

  labelingInfo: [
    new LabelClass({
      labelExpressionInfo: { expression: "$feature.visitor_count" },
      symbol: new LabelSymbol3D({
        verticalOffset: {
          screenLength: 20,
          maxWorldLength: 20,
          minWorldLength: 5
        },
        callout: new LineCallout3D({
          size: 0.5,
          color: [0, 0, 0]
        }),
        symbolLayers: [
          new TextSymbol3DLayer({
            material: { color: "white" },
            size: 16, // Defined in points
            background: {
              color: [0, 0, 0, 0.4]
            }
          })
        ]
      })
    })
  ],

  renderer: new SimpleRenderer({
    symbol: new PointSymbol3D({
      symbolLayers: [
        new ObjectSymbol3DLayer({
          // renders points as volumetric objects
          resource: { primitive: "cylinder" }, // renders points as cylinder
          material: { color: [217, 0, 18, 0.5] },

          width: 20
        })
      ]
    }),
    visualVariables: [
      new SizeVariable({
        field: "visitor_count", // field containing data for wind speed
        valueUnit: "meters",
        axis: "height"
      }),
      new SizeVariable({
        axis: "width-and-depth",
        useSymbolValue: true // uses the width value defined in the symbol layer
      })
    ]
  })
});