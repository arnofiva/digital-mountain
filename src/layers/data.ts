import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";

const accidents = new FeatureLayer({
  portalItem: {
    id: "f13721858ab1466381da1045ed1b121a"
  },
  elevationInfo: {
    mode: "on-the-ground"
  }
});

const dataLayers = new GroupLayer({
  title: "Winter Resort Data",
  layers: [accidents]
})

export default dataLayers;