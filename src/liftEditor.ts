import Geometry from "@arcgis/core/geometry/Geometry";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import ObjectSymbol3DLayer from "@arcgis/core/symbols/ObjectSymbol3DLayer";
import PointSymbol3D from "@arcgis/core/symbols/PointSymbol3D";
import Point from "@arcgis/core/geometry/Point";
import { contains, densify, nearestCoordinate } from "@arcgis/core/geometry/geometryEngine";
import Polyline from "@arcgis/core/geometry/Polyline";
import Draw from "@arcgis/core/views/draw/Draw";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SceneView from "@arcgis/core/views/SceneView";
import { watch } from "@arcgis/core/core/reactiveUtils";
import { AppState, EditMode } from "./appState";

const validRouteSymbol = {
  type: "line-3d",
  symbolLayers: [
    {
      type: "line",
      size: 2, // points
      material: { color: "green" },
      cap: "round",
      join: "round",
      pattern: {
        type: "style",
        style: "dash"
      },
      marker: {
        type: "style",
        style: "circle",
        placement: "begin-end",
        color: "green"
      }
    }
  ]
};
const invalidRouteSymbol = {
  type: "line-3d",
  symbolLayers: [
    {
      type: "line",
      size: 2, // points
      material: { color: "red" },
      cap: "round",
      join: "round",
      pattern: {
        type: "style",
        style: "dash"
      },
      marker: {
        type: "style",
        style: "circle",
        placement: "begin-end",
        color: "red"
      }
    }
  ]
};
const routeCableSymbol = {
  type: "line-3d",
  symbolLayers: [
    {
      type: "line",
      size: 2, // points
      material: { color: "gray" },
      cap: "round",
      join: "round"
    }
  ]
};

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

const towerSeparation = 100;
const initialTowerHeight = 10;

export function connect(view: SceneView, appState: AppState): SketchViewModel[] {
  const parcelLayer = new GraphicsLayer({
    graphics: [parcelGraphic],
    elevationInfo: { mode: "on-the-ground" }
  });
  view.map.add(parcelLayer);

  const routeSimpleLayer = new GraphicsLayer({ elevationInfo: { mode: "on-the-ground" } });
  view.map.add(routeSimpleLayer);

  const routeDetailLayer = new GraphicsLayer({ elevationInfo: { mode: "relative-to-ground" } });
  view.map.add(routeDetailLayer);

  const simpleGraphicToDetailGraphicMap = new Map();
  const detailGraphicToSimpleGraphicMap = new Map();
  const detailGraphicToTowerLayerMap = new Map();

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

  function matchRouteDetailGeometryToSimple(detailGeometry: Polyline, simpleGeometry: Polyline): Geometry {
    const detailPath = detailGeometry.paths[0];
    const simplePath = simpleGeometry.paths[0];
    const detailStart = detailPath[0];
    const detailEnd = detailPath[detailPath.length - 1];
    const simpleStart = simplePath[0];
    const simpleEnd = simplePath[simplePath.length - 1];
    const scale = (vec: number[], factor: number) => [vec[0] * factor, vec[1] * factor];
    const add = (vecA: number[], vecB: number[]) => [vecA[0] + vecB[0], vecA[1] + vecB[1]];
    const subtract = (vecA: number[], vecB: number[]) => [vecA[0] - vecB[0], vecA[1] - vecB[1]];
    const length = (vec: number[]) => Math.sqrt(vec[0] ** 2 + vec[1] ** 2);
    const simpleStartToEnd = subtract(simpleEnd, simpleStart);
    const detailStartToEnd = subtract(detailEnd, detailStart);
    const detailStartToEndLength = length(detailStartToEnd);
    const newPath = [];
    for (const vertex of detailPath) {
      const relativeToStart = subtract(vertex, detailPath[0]);
      const fraction = length(relativeToStart) / detailStartToEndLength;
      const newVertexRelativeToStart = scale(simpleStartToEnd, fraction);
      const newVertex = add(newVertexRelativeToStart, simplePath[0]);
      newPath.push([newVertex[0], newVertex[1], vertex[2]]);
    }
    return new Polyline({
      hasZ: true,
      paths: [newPath],
      spatialReference: detailGeometry.spatialReference
    });
  }

  routeSimpleSVM.on("update", (e) => {
    const routeSimpleGraphic = e.graphics[0];
    const routeSimpleGeometry = routeSimpleGraphic.geometry as Polyline;
    const isValid = contains(parcelGraphic.geometry, routeSimpleGeometry);
    routeSimpleGraphic.symbol =
      isValid || e.toolEventInfo?.type === "reshape-stop" ? validRouteSymbol : invalidRouteSymbol;
    if (e.toolEventInfo?.type === "reshape-stop") {
      if (!isValid) {
        routeSimpleSVM.undo();
        return;
      }
      const routeDetailGraphic = simpleGraphicToDetailGraphicMap.get(routeSimpleGraphic);
      const routeDetailGeometry = routeDetailGraphic.geometry;
      routeDetailGraphic.geometry = matchRouteDetailGeometryToSimple(routeDetailGeometry, routeSimpleGeometry);
      placeTowers(routeDetailGraphic);
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
      const routeSimpleGraphic = detailGraphicToSimpleGraphicMap.get(routeDetailGraphic);
      routeDetailSVM.complete();
      routeSimpleSVM.update(routeSimpleGraphic);
    } else if (routeSimpleSVM.updateGraphics.length > 0) {
      const routeSimpleGraphic = routeSimpleSVM.updateGraphics.at(0);
      const routeDetailGraphic = simpleGraphicToDetailGraphicMap.get(routeSimpleGraphic);
      routeSimpleSVM.complete();
      routeDetailSVM.update(routeDetailGraphic);
    }
  });

  view.on("click", function (event) {
    view.hitTest(event).then(function (response) {
      const result = response.results[0];
      if (result?.type === "graphic") {
        const simpleGraphic = routeSimpleLayer.graphics.includes(result.graphic)
          ? result.graphic
          : routeDetailLayer.graphics.includes(result.graphic)
          ? detailGraphicToSimpleGraphicMap.get(result.graphic)
          : null;
        if (simpleGraphic) {
          appState.editMode = EditMode.Lift;
          routeSimpleSVM.update(simpleGraphic);
        }
      }
    });
  });

  function placeTowers(routeDetailGraphic: Graphic) {
    let towerLayer = detailGraphicToTowerLayerMap.get(routeDetailGraphic);
    if (!towerLayer) {
      towerLayer = new GraphicsLayer({ elevationInfo: { mode: "relative-to-ground" } });
      detailGraphicToTowerLayerMap.set(routeDetailGraphic, towerLayer);
      view.map.add(towerLayer);
    } else {
      towerLayer.graphics.removeAll();
    }
    const routeGeometry = routeDetailGraphic.geometry as Polyline;
    for (const vertex of routeGeometry.paths[0]) {
      const geometry = new Point({
        x: vertex[0],
        y: vertex[1],
        spatialReference: routeGeometry.spatialReference,
        hasZ: false
      });
      const graphic = new Graphic({
        geometry,
        symbol: new PointSymbol3D({
          symbolLayers: [
            new ObjectSymbol3DLayer({
              width: 1,
              depth: 1,
              height: vertex[2],
              resource: { primitive: "cylinder" },
              material: { color: "black" }
            })
          ]
        })
      });
      towerLayer.graphics.push(graphic);
    }
  }

  let constraintGeometry: Polyline = null;
  routeDetailSVM.on("update", (e) => {
    const routeDetailGraphic = e.graphics[0];
    const routeIdx = routeDetailLayer.graphics.indexOf(routeDetailGraphic);
    const routeSimpleGraphic = routeSimpleLayer.graphics.at(routeIdx);
    const isValid = contains(parcelGraphic.geometry, routeDetailGraphic.geometry);
    routeSimpleGraphic.symbol =
      isValid || e.toolEventInfo?.type === "reshape-stop" ? validRouteSymbol : invalidRouteSymbol;
    if (e.toolEventInfo?.type === "reshape-start") {
      const path = (routeDetailGraphic.geometry as Polyline).paths[0];
      const start = path[0];
      const end = path[path.length - 1];

      // extend line so that start and end points can be moved outwards
      const delta = [end[0] - start[0], end[1] - start[1]];
      start[0] -= delta[0];
      start[1] -= delta[1];
      end[0] += delta[0];
      end[1] += delta[1];

      constraintGeometry = new Polyline({
        paths: [[start, end]],
        spatialReference: routeDetailGraphic.geometry.spatialReference
      });
    }
    if (e.toolEventInfo?.type === "reshape-stop") {
      if (!isValid) {
        routeDetailSVM.undo();
        return;
      }
      const newGeometry = routeDetailGraphic.geometry.clone() as Polyline;
      for (const vertex of newGeometry.paths[0]) {
        const nearest = nearestCoordinate(
          constraintGeometry,
          new Point({
            x: vertex[0],
            y: vertex[1],
            spatialReference: routeDetailGraphic.geometry.spatialReference
          })
        );
        vertex[0] = nearest.coordinate.x;
        vertex[1] = nearest.coordinate.y;
      }
      routeDetailGraphic.geometry = newGeometry;
      placeTowers(routeDetailGraphic);

      const routeSimpleGeometry = new Polyline({
        hasZ: newGeometry.hasZ,
        paths: [newGeometry.paths[0][0], newGeometry.paths[0].at(-1)],
        spatialReference: newGeometry.spatialReference
      });
      routeSimpleGraphic.geometry = routeSimpleGeometry;
    }
  });

  const draw = new Draw({ view });
  const drawHandles: IHandle[] = [];
  let routeGraphic: Graphic;
  function onDone() {
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

    routeGraphic = new Graphic({
      geometry: null,
      symbol: validRouteSymbol
    });
    routeSimpleLayer.add(routeGraphic);

    let isValid = true;
    const updateGeometry = (vertices: number[][]) => {
      // TODO: use SVM.create, so that alignWithGround isn't necessary
      const geometry = setInitialTowerHeight(
        new Polyline({
          paths: [vertices.length === 1 ? [vertices[0], [vertices[0][0] + 0.1, vertices[0][1] + 0.1, 0]] : vertices],
          spatialReference: view.spatialReference,
          hasZ: true
        })
      );
      isValid = contains(parcelGraphic.geometry, geometry);
      routeGraphic.symbol = isValid ? validRouteSymbol : invalidRouteSymbol;
      routeGraphic.geometry = geometry;
    };
    const completeGeometry = (vertices: number[][]) => {
      const geometry = setInitialTowerHeight(
        new Polyline({
          paths: [vertices],
          spatialReference: view.spatialReference,
          hasZ: true
        })
      );
      routeGraphic.geometry = geometry;
      const routeDetailGraphic = new Graphic({
        geometry: densify(geometry, towerSeparation),
        symbol: routeCableSymbol
      });

      detailGraphicToSimpleGraphicMap.set(routeDetailGraphic, routeGraphic);
      simpleGraphicToDetailGraphicMap.set(routeGraphic, routeDetailGraphic);

      routeDetailLayer.add(routeDetailGraphic);
      placeTowers(routeDetailGraphic);
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
