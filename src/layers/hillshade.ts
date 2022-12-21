import Color from "@arcgis/core/Color";
import TileLayer from "@arcgis/core/layers/TileLayer";

const urlTemplate =
  "https://server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade_Dark/MapServer/tile/{level}/{row}/{col}";

// const urlTemplate =
//   "https://server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{level}/{row}/{col}";

const color = new Color("#3A4754");

const hillshade = new TileLayer({
  portalItem: { id: "1b243539f4514b6ba35e7d995890db1d" }, // Light
  // url: "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer",
  blendMode: "multiply",
  visible: true,
  opacity: 0.5,
  title: "World Hillshade (Blended)"
});

hillshade.load().then(() => {
  // console.log({ hillshade });

  // const lods = hillshade.tileInfo.lods.slice(0, 15);
  // hillshade.tileInfo.lods = lods;
});

export default hillshade;