import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

const accidents = new FeatureLayer({
  portalItem: {
    id: "f13721858ab1466381da1045ed1b121a"
  },
  elevationInfo: {
    mode: "on-the-ground"
  }
});

export default accidents;