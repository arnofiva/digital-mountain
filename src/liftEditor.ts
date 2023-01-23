import { watch } from "@arcgis/core/core/reactiveUtils";
import { Point, Polygon, Polyline, SpatialReference } from "@arcgis/core/geometry";
import { contains, densify, nearestCoordinate, planarLength } from "@arcgis/core/geometry/geometryEngine";
import { geodesicDistance } from "@arcgis/core/geometry/support/geodesicUtils";
import { webMercatorToGeographic } from "@arcgis/core/geometry/support/webMercatorUtils";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import ElevationSampler from "@arcgis/core/layers/support/ElevationSampler";
import {
  IconSymbol3DLayer,
  LineSymbol3D, LineSymbol3DLayer, ObjectSymbol3DLayer,
  PathSymbol3DLayer, PointSymbol3D
} from "@arcgis/core/symbols";
import LineStyleMarker3D from "@arcgis/core/symbols/LineStyleMarker3D";
import LineStylePattern3D from "@arcgis/core/symbols/patterns/LineStylePattern3D";
import Draw from "@arcgis/core/views/draw/Draw";
import SceneView from "@arcgis/core/views/SceneView";
import ElevationProfile from "@arcgis/core/widgets/ElevationProfile";
import ElevationProfileLineGround from "@arcgis/core/widgets/ElevationProfile/ElevationProfileLineGround";
import ElevationProfileLineInput from "@arcgis/core/widgets/ElevationProfile/ElevationProfileLineInput";
import Expand from "@arcgis/core/widgets/Expand";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { AppState, EditMode } from "./appState";

import { LiftType } from "./lifts/liftType";
import { createSag, sagToSpanRatio } from "./lifts/sag";
import { skiResortArea } from "./variables";
import * as vec2 from "./vec2";

const validRouteSymbol = new LineSymbol3D({
  symbolLayers: [
    new LineSymbol3DLayer({
      size: 2, // points
      material: { color: "green" },
      cap: "round",
      join: "round",
      pattern: new LineStylePattern3D({ style: "dash" }),
      marker: new LineStyleMarker3D({
        style: "circle",
        placement: "begin-end",
        color: "green"
      })
    })
  ]
});

const invalidRouteSymbol = new LineSymbol3D({
  symbolLayers: [
    new LineSymbol3DLayer({
      size: 2, // points
      material: { color: "red" },
      cap: "round",
      join: "round",
      pattern: new LineStylePattern3D({ style: "dash" }),
      marker: new LineStyleMarker3D({
        style: "circle",
        placement: "begin-end",
        color: "red"
      })
    })
  ]
});

const validMarkerSymbol = new PointSymbol3D({
  symbolLayers: [
    new IconSymbol3DLayer({
      size: 10, // points
      material: { color: "green" },
      resource: { primitive: "circle" }
    })
  ]
});

const invalidMarkerSymbol = new PointSymbol3D({
  symbolLayers: [
    new IconSymbol3DLayer({
      size: 10, // points
      material: { color: "red" },
      resource: { primitive: "circle" }
    })
  ]
});

// used for graphics that must be editable by Sketch, but will not be otherwise be displayed
const hiddenLineSymbol = new LineSymbol3D({ symbolLayers: [new LineSymbol3DLayer()] });

const routeCableSymbol = new LineSymbol3D({
  symbolLayers: [
    new PathSymbol3DLayer({
      profile: "quad", // creates a rectangular shape
      width: 4, // path width in meters
      height: 0.1, // path height in meters
      material: { color: [0, 0, 0, 1] },
      cap: "butt",
      profileRotation: "heading"
    })
  ]
});

const parcelGraphic = Graphic.fromJSON({
  aggregateGeometries: null,
  geometry: {
    hasZ: true,
    spatialReference: {
      latestWkid: 3857,
      wkid: 102100
    },
    rings: [
      [
        [1066803.8754035952, 5904337.974413049, 0],
        [1066914.8132661835, 5904296.975074255, 0],
        [1066952.1857847571, 5904207.165021481, 0],
        [1066938.254483737, 5904116.941761387, 0],
        [1066910.5195472448, 5904021.257584308, 0],
        [1066841.8365712694, 5903914.666690362, 0],
        [1066823.9988050284, 5903802.494579739, 0],
        [1066784.7419476176, 5903703.438331386, 0],
        [1066667.3019431601, 5903602.887730739, 0],
        [1066523.5497015894, 5903517.04124232, 0],
        [1066385.0636797776, 5903467.46561698, 0],
        [1066273.7410229554, 5903447.533528962, 0],
        [1066177.219819657, 5903437.0739442315, 0],
        [1066073.2706964412, 5903439.02175548, 0],
        [1065947.0264826564, 5903416.325213373, 0],
        [1065847.3211492447, 5903378.385087472, 0],
        [1065729.910806138, 5903298.522168893, 0],
        [1065622.3715428326, 5903192.660514935, 0],
        [1065528.7566176471, 5903063.243229664, 0],
        [1065497.7386251506, 5902961.120908267, 0],
        [1065483.162055282, 5902879.123345913, 0],
        [1065461.711596472, 5902839.791589561, 0],
        [1065435.5999100334, 5902811.766835864, 0],
        [1065386.1563132985, 5902784.320980731, 0],
        [1065320.963017309, 5902778.96658901, 0],
        [1065221.3692016064, 5902802.41310695, 0],
        [1065149.8182162014, 5902846.996065546, 0],
        [1065093.5038349961, 5902918.996078735, 0],
        [1065070.2361456961, 5903007.555922019, 0],
        [1065060.290640366, 5903076.200002834, 0],
        [1065079.1665239574, 5903141.926321395, 0],
        [1065117.8294191472, 5903190.744147733, 0],
        [1065162.8269508074, 5903231.814170228, 0],
        [1065219.075689077, 5903324.218476607, 0],
        [1065250.3028637217, 5903413.372259424, 0],
        [1065292.974312427, 5903523.94586606, 0],
        [1065361.9659193454, 5903647.109744019, 0],
        [1065457.9144804557, 5903769.951869273, 0],
        [1065607.5760899817, 5903855.642637354, 0],
        [1065799.3919939857, 5903962.800021219, 0],
        [1065991.3370166183, 5904070.227711181, 0],
        [1066242.33952652, 5904169.038762329, 0],
        [1066456.974288633, 5904258.732514352, 0],
        [1066648.6848976812, 5904321.827340563, 0],
        [1066803.8754035952, 5904337.974413049, 0]
      ]
    ]
  },
  symbol: {
    type: "esriSFS",
    color: [150, 150, 150, 51],
    outline: {
      type: "esriSLS",
      color: [50, 50, 50, 255],
      width: 2,
      style: "esriSLSSolid"
    },
    style: "esriSFSSolid"
  },
  attributes: {},
  popupTemplate: null
});

parcelGraphic.geometry = skiResortArea;

const minLength = 100;
const maxLength = 1000;
const towerSeparation = 200;
const minSeparation = 50;
const initialTowerHeight = 10;
const minHeight = 5;
const maxHeight = 20;
const createLiftType = LiftType.Chair;

interface LiftGraphicGroup {
  simpleGraphic: Graphic;
  detailGraphic: Graphic;
  displayGraphic: Graphic;
  towerLayer: GraphicsLayer;
}

export function connect(view: SceneView, appState: AppState): SketchViewModel[] {
  const elevationProfile = new ElevationProfile({
    view,
    profiles: [
      new ElevationProfileLineInput({
        color: "#f57e42",
        title: "Line elevation",
        viewVisualizationEnabled: false
      }),
      new ElevationProfileLineGround({
        color: "#61d4a4",
        title: "Ground elevation",
        viewVisualizationEnabled: false
      })
    ]
  });
  view.ui.add(new Expand({
    view,
    content: elevationProfile,
    expanded: false
  }), "top-right");

  const parcelLayer = new GraphicsLayer({
    graphics: [parcelGraphic],
    elevationInfo: { mode: "on-the-ground" },
    listMode: "hide"
  });
  view.map.layers.unshift(parcelLayer);

  const routeSimpleLayer = new GraphicsLayer({
    elevationInfo: { mode: "on-the-ground" },
    listMode: "hide",
    title: "Lift routes - simple"
  });
  view.map.add(routeSimpleLayer);

  const routeDetailLayer = new GraphicsLayer({
    elevationInfo: { mode: "relative-to-ground" },
    listMode: "hide",
    title: "Lift routes - detail"
  });
  view.map.add(routeDetailLayer);

  const markerLayer = new GraphicsLayer({
    elevationInfo: { mode: "on-the-ground" },
    listMode: "hide",
    title: "Lift routes - markers"
  });
  view.map.add(markerLayer);

  const routeDisplayLayer = new GraphicsLayer({
    elevationInfo: { mode: "absolute-height" },
    listMode: "hide",
    title: "Lift routes - display"
  });
  view.map.add(routeDisplayLayer);

  const liftGraphicGroups: LiftGraphicGroup[] = [];

  let elevationSampler: ElevationSampler;
  view.map.ground.createElevationSampler(parcelGraphic.geometry.extent).then((sampler) => (elevationSampler = sampler));

  const addBtn = document.getElementById("add-lift-button") as HTMLButtonElement;
  const cancelBtn = document.getElementById("cancel-lift-button") as HTMLButtonElement;
  const editToggleBtn = document.getElementById("edit-lift-toggle-button") as HTMLButtonElement;

  const routeSimpleSVM = new SketchViewModel({
    layer: routeSimpleLayer,
    view,
    defaultUpdateOptions: {
      tool: "reshape",
      reshapeOptions: { shapeOperation: "none", edgeOperation: "none" },
      toggleToolOnClick: false
    },
    tooltipOptions: {
      enabled: true
    },
    updateOnGraphicClick: false
  });

  const routeDetailSVM = new SketchViewModel({
    layer: routeDetailLayer,
    view,
    defaultUpdateOptions: {
      tool: "reshape",
      reshapeOptions: { shapeOperation: "none" },
      toggleToolOnClick: false
    },
    tooltipOptions: {
      enabled: true
    },
    updateOnGraphicClick: false
  });

  watch(
    () => appState.editMode,
    (editMode) => {
      if (editMode !== EditMode.Lift) {
        routeSimpleSVM.complete();
        routeDetailSVM.complete();
      }
    }
  );

  function vertexToPoint(vertex: number[], spatialReference: SpatialReference): Point {
    return new Point({ x: vertex[0], y: vertex[1], z: vertex[2], spatialReference });
  }

  function isRouteValid(routeGeometry: Polyline, parcelGeometry: Polygon): boolean {
    const path = routeGeometry.paths[0];
    if (path.length > 1) {
      const start = path[0];
      const end = path[path.length - 1];
      const startToEnd = vec2.subtract(end, start);
      let previous = start;
      for (const vertex of path) {
        if (vertex[2] < minHeight || vertex[2] > maxHeight) {
          return false;
        }
        if (vertex === start) {
          continue;
        }
        const relativeToPrevious = vec2.subtract(vertex, previous);
        previous = vertex;
        const distance = vec2.length(relativeToPrevious);
        if (distance < minSeparation) {
          return false;
        }
        const isVertexInOrder = vec2.dot(startToEnd, relativeToPrevious) > 0;
        if (!isVertexInOrder) {
          return false;
        }
      }
    }
    const isContained = contains(
      parcelGeometry,
      path.length > 1 ? routeGeometry : vertexToPoint(path[0], routeGeometry.spatialReference)
    );
    const length = planarLength(routeGeometry);
    return isContained && (length === 0 || (length >= minLength && length <= maxLength));
  }

  function matchRouteDetailGeometryToSimple(detailGeometry: Polyline, simpleGeometry: Polyline): Polyline {
    const detailPath = detailGeometry.paths[0];
    const simplePath = simpleGeometry.paths[0];
    const detailStart = detailPath[0];
    const detailEnd = detailPath[detailPath.length - 1];
    const simpleStart = simplePath[0];
    const simpleEnd = simplePath[simplePath.length - 1];
    const simpleStartToEnd = vec2.subtract(simpleEnd, simpleStart);
    const detailStartToEnd = vec2.subtract(detailEnd, detailStart);
    const detailStartToEndLength = vec2.length(detailStartToEnd);
    const newPath = [];
    for (const vertex of detailPath) {
      const relativeToStart = vec2.subtract(vertex, detailPath[0]);
      const fraction = vec2.length(relativeToStart) / detailStartToEndLength;
      const newVertexRelativeToStart = vec2.scale(simpleStartToEnd, fraction);
      const newVertex = vec2.add(newVertexRelativeToStart, simplePath[0]);
      newPath.push([newVertex[0], newVertex[1], vertex[2]]);
    }
    return new Polyline({
      hasZ: true,
      paths: [newPath],
      spatialReference: detailGeometry.spatialReference
    });
  }

  function geometryToAbsoluteHeight(geometry: Polyline): Polyline {
    const result = elevationSampler.queryElevation(geometry) as typeof geometry;
    result.paths.forEach((path, pIdx) => {
      path.forEach((v, vIdx) => {
        v[2] += geometry.paths[pIdx][vIdx][2];
      });
    });
    return result;
  }

  function detailGeometryToDisplayGeometry(detailGeometry: Polyline): Polyline {
    const absoluteHeightGeometry = geometryToAbsoluteHeight(detailGeometry);
    return createSag(absoluteHeightGeometry, sagToSpanRatio(createLiftType));
  }

  let newSimpleGeometry: Polyline = null;
  routeSimpleSVM.on("update", (e) => {
    if (e.tool !== "reshape" || e.state === "start") {
      return;
    }
    const routeSimpleGraphic = e.graphics[0];
    const routeSimpleGeometry = routeSimpleGraphic.geometry as Polyline;
    const { detailGraphic, displayGraphic, towerLayer } = liftGraphicGroups.find(
      (group) => group.simpleGraphic === routeSimpleGraphic
    );
    if (e.toolEventInfo?.type === "reshape-start") {
      newSimpleGeometry = null;
    }
    const routeDetailGeometry = matchRouteDetailGeometryToSimple(
      detailGraphic.geometry as Polyline,
      routeSimpleGeometry
    );
    const isValid = isRouteValid(routeDetailGeometry, parcelGraphic.geometry as Polygon);
    const isReshapeStop = e.toolEventInfo?.type === "reshape-stop";
    routeSimpleGraphic.symbol = isValid || isReshapeStop ? hiddenLineSymbol : invalidRouteSymbol;
    if (isValid) {
      newSimpleGeometry = routeSimpleGeometry.clone() as Polyline;
      detailGraphic.geometry = routeDetailGeometry;
      displayGraphic.geometry = detailGeometryToDisplayGeometry(routeDetailGeometry);
    }
    if (newSimpleGeometry) {
      placeTowers(towerLayer, detailGraphic.geometry as Polyline, {
        updateTilt: isReshapeStop
      });
      if (isReshapeStop) {
        routeSimpleGraphic.geometry = newSimpleGeometry;
      }
    }
  });

  function updateEditMode(newEditMode: "simple" | "detail") {
    editToggleBtn.textContent = newEditMode === "simple" ? "Edit towers" : "Edit route";
  }

  watch(
    () => ({
      simpleUpdateCount: routeSimpleSVM.updateGraphics.length,
      detailUpdateCount: routeDetailSVM.updateGraphics.length
    }),
    ({ simpleUpdateCount, detailUpdateCount }) => {
      let detailGraphic = null;
      if (simpleUpdateCount > 0) {
        const simpleGraphic = routeSimpleSVM.updateGraphics.getItemAt(0);
        detailGraphic = liftGraphicGroups.find((group) => group.simpleGraphic === simpleGraphic)?.detailGraphic;
      } else if (detailUpdateCount > 0) {
        detailGraphic = routeDetailSVM.updateGraphics.getItemAt(0);
      }
      elevationProfile.input = detailGraphic;
      // elevationProfile.visible = detailGraphic != null; // requires https://devtopia.esri.com/WebGIS/arcgis-js-api/issues/48588
    },
    { initial: true }
  );

  watch(
    () => ({
      simpleUpdateCount: routeSimpleSVM.updateGraphics.length,
      detailUpdateCount: routeDetailSVM.updateGraphics.length
    }),
    ({ simpleUpdateCount, detailUpdateCount }) => {
      const showEditButton = simpleUpdateCount !== 0 || detailUpdateCount !== 0;
      addBtn.className = showEditButton ? "hidden" : "";
      editToggleBtn.className = showEditButton ? "" : "hidden";
      if (detailUpdateCount === 0) {
        updateEditMode("simple");
      } else {
        updateEditMode("detail");
      }
    },
    { initial: true }
  );
  editToggleBtn.addEventListener("click", () => {
    if (routeDetailSVM.updateGraphics.length > 0) {
      const routeDetailGraphic = routeDetailSVM.updateGraphics.at(0);
      const routeSimpleGraphic = liftGraphicGroups.find(
        (group) => group.detailGraphic === routeDetailGraphic
      )?.simpleGraphic;
      routeDetailSVM.complete();
      routeSimpleSVM.update(routeSimpleGraphic);
    } else if (routeSimpleSVM.updateGraphics.length > 0) {
      const routeSimpleGraphic = routeSimpleSVM.updateGraphics.at(0);
      const routeDetailGraphic = liftGraphicGroups.find(
        (group) => group.simpleGraphic === routeSimpleGraphic
      )?.detailGraphic;
      routeSimpleSVM.complete();
      routeDetailSVM.update(routeDetailGraphic);
    }
  });

  view.on("click", function (event) {
    view.hitTest(event).then(function (response) {
      const result = response.results[0];
      if (result?.type === "graphic") {
        const { graphic } = result;
        const simpleGraphic = liftGraphicGroups.find(
          (group) =>
            graphic === group.simpleGraphic ||
            graphic === group.detailGraphic ||
            graphic === group.displayGraphic ||
            graphic.layer === group.towerLayer
        )?.simpleGraphic;
        if (simpleGraphic) {
          appState.editMode = EditMode.Lift;
          routeSimpleSVM.update(simpleGraphic);
        }
      }
    });
  });

  function computeTilt(v0: number[], v1: number[]): number {
    return (-Math.atan2(vec2.distance(v0, v1), v1[2] - v0[2]) * 180) / Math.PI - 90;
  }

  function placeTowers(towerLayer: GraphicsLayer, relativeZGeometry: Polyline, options: { updateTilt: boolean }) {
    let objectID = 0;
    const {
      paths: [relativeZPath],
      spatialReference
    } = relativeZGeometry;
    const start = webMercatorToGeographic(vertexToPoint(relativeZPath[0], spatialReference)) as Point;
    const end = webMercatorToGeographic(
      vertexToPoint(relativeZPath[relativeZPath.length - 1], spatialReference)
    ) as Point;
    const heading = geodesicDistance(start, end).azimuth;
    const absoluteZGeometry = geometryToAbsoluteHeight(relativeZGeometry);
    const absoluteZPath = absoluteZGeometry.paths[0];
    // reuse symbols if possible to avoid flickering
    // NB: this will cause the symbol tilt and heading to not be updated
    const reuseSymbols = absoluteZPath.length === towerLayer.graphics.length && !options.updateTilt;
    const newFeatures: Graphic[] = [];
    for (let i = 0; i < absoluteZPath.length; i++) {
      const vertex = absoluteZPath[i];
      const nextVertex = absoluteZPath[i + 1];
      const previousVertex = absoluteZPath[i - 1];
      const nextTilt = nextVertex ? computeTilt(vertex, nextVertex) : null;
      const previousTilt = previousVertex ? computeTilt(previousVertex, vertex) : null;
      const tilt = nextTilt != null && previousTilt != null ? (nextTilt + previousTilt) / 2 : nextTilt ?? previousTilt;
      const geometry = vertexToPoint(vertex, relativeZGeometry.spatialReference);
      const symbol = reuseSymbols
        ? towerLayer.graphics.getItemAt(i).symbol
        : new PointSymbol3D({
          symbolLayers: [
            new ObjectSymbol3DLayer({
              width: 2,
              depth: 2,
              height: maxHeight,
              heading,
              tilt,
              resource: { primitive: "cylinder" },
              material: { color: "black" }
            })
          ]
        });
      newFeatures.push(new Graphic({ attributes: { objectID, heading, tilt }, geometry, symbol }));
      objectID++;
    }
    towerLayer.graphics.removeAll();
    towerLayer.graphics.addMany(newFeatures);
  }

  let constraintGeometry: Polyline = null;
  let newDetailGeometry: Polyline = null;
  routeDetailSVM.on("update", (e) => {
    if (e.tool !== "reshape" || e.state === "start") {
      return;
    }
    const detailGraphic = e.graphics[0];
    const { simpleGraphic, displayGraphic, towerLayer } = liftGraphicGroups.find(
      (group) => group.detailGraphic === detailGraphic
    );
    if (e.toolEventInfo?.type === "reshape-start") {
      constraintGeometry = null;
      newDetailGeometry = null;
      const path = (detailGraphic.geometry as Polyline).paths[0];
      const start = [...path[0]];
      const end = [...path[path.length - 1]];
      // extend line so that start and end points can be moved outwards
      const delta = [end[0] - start[0], end[1] - start[1]];
      start[0] -= delta[0];
      start[1] -= delta[1];
      end[0] += delta[0];
      end[1] += delta[1];
      constraintGeometry = new Polyline({
        paths: [[start, end]],
        spatialReference: detailGraphic.geometry.spatialReference
      });
    }
    const constrainedGeometry = detailGraphic.geometry.clone() as Polyline;
    for (const vertex of constrainedGeometry.paths[0]) {
      const nearest = nearestCoordinate(
        constraintGeometry,
        vertexToPoint(vertex, detailGraphic.geometry.spatialReference)
      );
      vertex[0] = nearest.coordinate.x;
      vertex[1] = nearest.coordinate.y;
    }
    const isValid = isRouteValid(constrainedGeometry, parcelGraphic.geometry as Polygon);
    const isReshapeStop = e.toolEventInfo?.type === "reshape-stop";
    simpleGraphic.symbol = isValid || isReshapeStop ? hiddenLineSymbol : invalidRouteSymbol;
    if (isValid) {
      newDetailGeometry = constrainedGeometry;
      displayGraphic.geometry = detailGeometryToDisplayGeometry(newDetailGeometry);
      simpleGraphic.geometry = new Polyline({
        hasZ: newDetailGeometry.hasZ,
        paths: [[newDetailGeometry.paths[0][0], newDetailGeometry.paths[0].at(-1)]],
        spatialReference: newDetailGeometry.spatialReference
      });
    }
    if (newDetailGeometry) {
      placeTowers(towerLayer, newDetailGeometry, { updateTilt: isReshapeStop });
      if (isReshapeStop) {
        detailGraphic.geometry = newDetailGeometry;
      }
    }
  });

  const draw = new Draw({ view: view as any });
  const drawHandles: IHandle[] = [];
  let routeGraphic: Graphic;
  let markerGraphic: Graphic;
  function onDone() {
    markerLayer.remove(markerGraphic);
    routeGraphic = null;
    addBtn.className = "hidden";
    cancelBtn.className = "hidden";
    drawHandles.forEach((h) => h.remove());
    drawHandles.length = 0;
  }

  addBtn.addEventListener("click", () => {
    appState.editMode = EditMode.Lift;
    addBtn.className = "hidden";
    cancelBtn.className = "";

    routeGraphic = new Graphic();
    routeSimpleLayer.add(routeGraphic);

    markerGraphic = new Graphic();
    markerLayer.add(markerGraphic);

    let isValid = true;
    const updateGeometry = (vertices: number[][]) => {
      // TODO: use SVM.create, so that alignWithGround isn't necessary
      const geometry = setInitialTowerHeight(
        new Polyline({
          paths: [vertices],
          spatialReference: view.spatialReference,
          hasZ: true
        })
      );
      isValid = isRouteValid(geometry, parcelGraphic.geometry as Polygon);
      routeGraphic.symbol = isValid ? validRouteSymbol : invalidRouteSymbol;
      routeGraphic.geometry = geometry;

      markerGraphic.symbol = isValid ? validMarkerSymbol : invalidMarkerSymbol;
      markerGraphic.geometry = vertexToPoint(vertices[0], geometry.spatialReference);
    };
    const completeGeometry = (vertices: number[][]) => {
      const geometry = setInitialTowerHeight(
        new Polyline({ paths: [vertices], spatialReference: view.spatialReference, hasZ: true })
      );
      routeGraphic.geometry = geometry;
      routeGraphic.symbol = hiddenLineSymbol;

      const detailGeometry = densify(geometry, towerSeparation) as typeof geometry;
      const routeDetailGraphic = new Graphic({ geometry: detailGeometry, symbol: hiddenLineSymbol });
      routeDetailLayer.add(routeDetailGraphic);

      const routeDisplayGraphic = new Graphic({ symbol: routeCableSymbol });
      routeDisplayGraphic.geometry = detailGeometryToDisplayGeometry(detailGeometry);
      routeDisplayLayer.add(routeDisplayGraphic);

      const towerLayer = new GraphicsLayer({
        elevationInfo: { mode: "absolute-height" },
        listMode: "hide",
        title: "Tower layer"
      });
      view.map.add(towerLayer);
      placeTowers(towerLayer, detailGeometry, { updateTilt: true });

      liftGraphicGroups.push({
        simpleGraphic: routeGraphic,
        detailGraphic: routeDetailGraphic,
        displayGraphic: routeDisplayGraphic,
        towerLayer
      });
    };

    const action = draw.create("polyline", { mode: "click" });
    const validVertices: number[][] = [];
    drawHandles.push(
      action.on("cursor-update", (e) => {
        updateGeometry([...validVertices, e.vertices.at(-1)]);
      }),
      action.on("vertex-add", (e) => {
        if (!isValid) {
          return;
        }
        validVertices.push(e.vertices.at(-1));
        if (validVertices.length === 2) {
          draw.complete();
          onDone();
        }
      }),
      action.on("draw-complete", () => {
        if (validVertices.length !== 2) {
          routeSimpleLayer.remove(routeGraphic);
        } else {
          completeGeometry(validVertices);
          routeSimpleSVM.update(routeGraphic);
        }
        onDone();
      })
    );
  });
  cancelBtn.addEventListener("click", () => {
    draw.reset();
    routeSimpleLayer.remove(routeGraphic);
    onDone();
  });

  function setInitialTowerHeight(line: Polyline): Polyline {
    const result = line.clone();
    for (const path of result.paths) {
      for (const v of path) {
        v[2] = initialTowerHeight;
      }
    }
    return result;
  }

  return [routeSimpleSVM, routeDetailSVM];
}
