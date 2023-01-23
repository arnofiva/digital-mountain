import SceneLayer from "@arcgis/core/layers/SceneLayer";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import { SimpleRenderer } from "@arcgis/core/renderers";
import SizeVariable from "@arcgis/core/renderers/visualVariables/SizeVariable";
import { WebStyleSymbol } from "@arcgis/core/symbols";

export const treesVariableHeight = new SceneLayer({
  portalItem: {
    id: "8d8d3e94f3d7430bb112b32b4d3c0130"
  },
  renderer: new SimpleRenderer({
    symbol: new WebStyleSymbol({
      name: "Laurus",
      styleName: "EsriRealisticTreesStyle"
    }),
    visualVariables: [
      new SizeVariable({
        axis: "height",
        field: "Height"
      })
    ]
  }),
  title: "3D Trees Variable Height"
});

export const trees = new SceneLayer({
  portalItem: {
    id: "e6811797f4c74c77bf34ab1e15f24631"
  },
  visible: false,
  renderer: new SimpleRenderer({
    symbol: new WebStyleSymbol({
      name: "Larix",
      styleName: "EsriRealisticTreesStyle"
    })
  }),
  title: "3D Trees"
});

export const rocks = new VectorTileLayer({
  portalItem: {
    id: "f13423a1ff78401c96ac3aeed819bb6e"
  },
  style: {
    version: 10.81,
    sources: {
      esri: {
        type: "vector",
        url: "https://tiles.arcgis.com/tiles/cFEFS0EWrhfDeVw9/arcgis/rest/services/VTL__3857__Grison_Rocks/VectorTileServer/"
      }
    },
    layers: [
      {
        "id": "FL__3857__Grison__Rocks/1",
        "type": "fill",
        "source": "esri",
        "source-layer": "FL__3857__Grison__Rocks",
        "layout": {},
        "paint": { "fill-color": "#999999" }
      }
    ]
  },
  visible: false,
  title: "Rocks"
});
