import StreamLayer from "@arcgis/core/layers/StreamLayer";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import { SimpleRenderer } from "@arcgis/core/renderers";
import { LabelSymbol3D, ObjectSymbol3DLayer, PointSymbol3D, TextSymbol3DLayer } from "@arcgis/core/symbols";
import LineCallout3D from "@arcgis/core/symbols/callouts/LineCallout3D";

const url = "https://us-iot.arcgis.com/bc1qjuyagnrebxvh/bc1qjuyagnrebxvh/streams/arcgis/rest/services/snowCat_StreamLayer4/StreamServer";

const createAssetsStream = () => new StreamLayer({
  url,
  title: "Stream Layer",
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

export default createAssetsStream;