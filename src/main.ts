import SceneView from "@arcgis/core/views/SceneView";

import Color from "@arcgis/core/Color";
import Map from "@arcgis/core/Map";
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import Daylight from "@arcgis/core/widgets/Daylight";
import Expand from "@arcgis/core/widgets/Expand";
import LayerList from "@arcgis/core/widgets/LayerList";

import "@esri/calcite-components/dist/calcite/calcite.css";
import "@esri/calcite-components/dist/components/calcite-loader";

import IdentityManager from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import FeatureLayerView from "@arcgis/core/views/layers/FeatureLayerView";
import SceneLayerView from "@arcgis/core/views/layers/SceneLayerView";
import Home from "@arcgis/core/widgets/Home";
import Legend from "@arcgis/core/widgets/Legend";
import Weather from "@arcgis/core/widgets/Weather";
import { AppState } from "./appState";
import summerImageryBasemap from "./basemaps/summerImagery";
import swisstopoBasemap from "./basemaps/swisstopo";
import vectorBasemap from "./basemaps/vector";
import winterBasemap from "./basemaps/winter";
import winterImageryBasemap from "./basemaps/winterImagery";
import AccidentsChart from "./layers/data";
import hillshade from "./layers/hillshade";
import { snowCatLive, snowCatStream, visitorCountStream } from "./layers/live";
import { rocks, trees } from "./layers/nature";
import osmFeatures from "./layers/osm";
import { buildings, skiLiftPoles, skiLifts, skiLiftsWithSag, skiSlopes, skiSlopesArea } from "./layers/resort";
import swisstopoSlope from "./layers/swisstopoSlope";
import { connect as connectLiftEditor } from "./liftEditor";
import { connect as connectSlopeEditor } from "./slopeEditor";
import { skiResortArea } from "./variables";

// setAssetPath("https://js.arcgis.com/calcite-components/1.0.0-beta.77/assets");

// const params = new URLSearchParams(document.location.search.slice(1));
// const someParam = params.has("someParam");

const oAuthInfo = new OAuthInfo({
  appId: "KojZjH6glligLidj",
  popup: true,
  popupCallbackUrl: `${document.location.origin}${document.location.pathname}oauth-callback-api.html`,
  portalUrl: "https://zurich.maps.arcgis.com/"
});

IdentityManager.registerOAuthInfos([oAuthInfo]);

(window as any).setOAuthResponseHash = (responseHash: string) => {
  IdentityManager.setOAuthResponseHash(responseHash);
};

// esriConfig.apiKey =
// "AAPK4021da52134346b7bb16aaaef2e378e7jSoa-zYBTpm8627wfHulkfMJMm9QwSGgQdAvuFSATu9YLReA58rrEhtnRpf8zXKm";

const view = new SceneView({
  qualityProfile: "high",
  container: "viewDiv",

  camera: {
    position: {
      longitude: 9.34595657,
      latitude: 46.74661722,
      z: 6311.31201
    },
    heading: 320.15,
    tilt: 68.68
  },

  map: new Map({
    layers: [
      //
      new GroupLayer({
        title: "Basemap",
        layers: [rocks, swisstopoSlope, trees, buildings]
      }),
      hillshade,
      new GroupLayer({
        title: "Winter Resort Context",
        layers: [
          skiSlopesArea,
          skiSlopes,
          new GroupLayer({
            title: "Ski Lifts",
            layers: [skiLiftsWithSag, skiLifts],
            visibilityMode: "exclusive"
          }),
          skiLiftPoles,
          osmFeatures
        ]
      })
    ],
    basemap: vectorBasemap,
    ground: "world-elevation"
  }),

  // alphaCompositingEnabled: true,

  environment: {
    lighting: {
      directShadowsEnabled: true
    },
    atmosphereEnabled: true,
    atmosphere: {
      quality: "high"
    }
    // starsEnabled: false,
    // background: {
    //   type: "color",
    //   color
    // }
  }
});

const accidentsChart = new AccidentsChart(view);

view.map.ground.surfaceColor = new Color([240, 245, 255]);

view.ui.add(
  new Home({
    view
  }),
  "top-left"
);

const basemapList = new BasemapGallery({
  view,
  source: [vectorBasemap, summerImageryBasemap, winterImageryBasemap, swisstopoBasemap, winterBasemap]
});

view.ui.add(
  new Expand({
    view,
    content: basemapList,
    group: "layers"
  }),
  "top-left"
);

view.popup.autoOpenEnabled = true;
view.popup.defaultPopupTemplateEnabled = true;

const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");

logoutButton.style.display = "none";

view.ui.add(loginButton, "top-right");
view.ui.add(logoutButton, "top-right");

const operationalLayers = new GroupLayer({
  title: "Operational Layers",
  layers: [
    new GroupLayer({
      title: "Visitor Counts",
      visibilityMode: "exclusive",
      // visible: false,
      layers: [visitorCountStream]
    }),
    new GroupLayer({
      title: "Snow Cats",
      visibilityMode: "exclusive",
      // visible: false,
      layers: [snowCatLive, snowCatStream]
    })
  ]
});

const addAuthLayers = (userId: string) => {
  view.map.add(operationalLayers);
  accidentsChart.addLayers();
  loginButton.style.display = "none";
  logoutButton.innerText = "Logout " + userId;
  logoutButton.style.display = null;
};

const removeAuthLayers = () => {
  view.map.remove(operationalLayers);
  accidentsChart.removeLayers();
  loginButton.style.display = null;
  logoutButton.style.display = "none";
  logoutButton.innerText = "Logout";
};

IdentityManager.checkSignInStatus(snowCatStream.url).then((credentials) => {
  addAuthLayers(credentials.userId);
  return credentials;
});

loginButton.onclick = () => {
  IdentityManager.getCredential(snowCatStream.url).then((credentials) => {
    addAuthLayers(credentials.userId);
    return credentials;
  });
};

logoutButton.onclick = () => {
  IdentityManager.destroyCredentials();
  removeAuthLayers();
};

view.ui.add(
  new Expand({
    content: new Weather({ view }),
    view,
    group: "environment"
  }),
  "top-right"
);

view.ui.add(
  new Expand({
    content: new Daylight({ view }),
    view,
    group: "environment"
  }),
  "top-right"
);



view.ui.add(
  new Expand({
    content: new LayerList({ view }),
    view,
    expanded: false,
    group: "layers"
  }),
  "top-left"
);
view.ui.add(
  new Expand({
    content: new Legend({ view }),
    view,
    expanded: false,
    group: "layers"
  }),
  "top-left"
);
view.ui.add(
  new Expand({
    view,
    content: document.getElementById("edit-buttons"),
    expandIconClass: "esri-icon-edit"
    // expanded: true,
    // group: "top-left"
  }),

  "bottom-left"
);
const appState = new AppState({ skiSlopes });

connectSlopeEditor(view, appState);
connectLiftEditor(view, appState);

// whenOnce(() => !view.updating).then(() => {
const loader = document.getElementById("loader");
loader?.parentElement?.removeChild(loader);
// });

window["view"] = view;

view.when().then(async () => {
  [skiLifts, trees, skiLiftPoles, skiSlopes, skiSlopesArea].forEach(async l => {
    const lv = await view.whenLayerView(l) as FeatureLayerView | SceneLayerView;
    lv.filter = new FeatureFilter({
      geometry: skiResortArea
    });
  });

  view.popup.dockEnabled = true;
  view.popup.dockOptions = {
    position: "top-left"
  };

});
