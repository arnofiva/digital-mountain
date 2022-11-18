import { contains } from "@arcgis/core/geometry/geometryEngine";
import { watch } from "@arcgis/core/core/reactiveUtils";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import { buffer, generalize, union } from "@arcgis/core/geometry/geometryEngine";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import SceneView from "@arcgis/core/views/SceneView";
import { Polygon, Polyline } from "@arcgis/core/geometry";
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
const createBufferSymbol = {
  type: "simple-fill",
  color: [200, 200, 200],
  style: "solid",
  outline: { color: "green", width: 1 }
};
const bufferSymbol = {
  type: "simple-fill",
  color: [200, 200, 200],
  style: "solid",
  outline: { color: "black", width: 1 }
};

const bufferDistance = 15;
const maxDeviation = 5;

export function connect(view: SceneView, appState: AppState): SketchViewModel[] {
  const addBtn = document.getElementById("add-slope-button") as HTMLButtonElement;
  const doneBtn = document.getElementById("done-slope-button") as HTMLButtonElement;
  const editToggleBtn = document.getElementById("edit-slope-toggle-button") as HTMLButtonElement;

  const bufferUnionGraphic = new Graphic({ symbol: bufferSymbol });
  const bufferUnionLayer = new GraphicsLayer({
    elevationInfo: { mode: "on-the-ground" },
    graphics: [bufferUnionGraphic]
  });
  view.map.add(bufferUnionLayer);

  const bufferLayer = new GraphicsLayer({
    elevationInfo: { mode: "on-the-ground" },
    graphics: []
  });
  view.map.add(bufferLayer);

  const routesLayer = new GraphicsLayer({
    elevationInfo: { mode: "on-the-ground" },
    graphics: []
  });
  view.map.add(routesLayer);

  const routeSVM = new SketchViewModel({
    layer: routesLayer,
    view,
    defaultUpdateOptions: {
      tool: "reshape",
      reshapeOptions: { shapeOperation: "none" },
      toggleToolOnClick: false
    },
    polylineSymbol: validRouteSymbol,
    snappingOptions: {
      enabled: true,
      selfEnabled: false,
      featureSources: [
        { layer: routesLayer, enabled: true },
        { layer: appState.skiSlopesLayer, enabled: true }
      ]
    },
    updateOnGraphicClick: false
  });

  const bufferSVM = new SketchViewModel({
    layer: bufferLayer,
    view,
    defaultUpdateOptions: {
      tool: "reshape",
      reshapeOptions: { shapeOperation: "none" },
      toggleToolOnClick: false
    },
    updateOnGraphicClick: false
  });

  watch(
    () => appState.editMode,
    (editMode) => {
      if (editMode !== EditMode.Slope) {
        routeSVM.complete();
        bufferSVM.complete();
      }
    }
  );

  const routeToBufferMap = new Map();
  const bufferToRouteMap = new Map();

  function updateEditMode(newEditMode: "route" | "buffer") {
    editToggleBtn.textContent = newEditMode === "route" ? "Edit area" : "Edit route";
  }
  watch(
    () => ({
      bufferUpdateCount: bufferSVM.updateGraphics.length,
      routeUpdateCount: routeSVM.updateGraphics.length
    }),
    ({ bufferUpdateCount, routeUpdateCount }) => {
      const showEditButton = bufferUpdateCount !== 0 || routeUpdateCount !== 0;
      addBtn.className = showEditButton ? "hidden" : "";
      editToggleBtn.className = showEditButton ? "" : "hidden";
      if (bufferUpdateCount === 0) {
        updateEditMode("route");
      } else {
        updateEditMode("buffer");
      }
    },
    { initial: true }
  );
  editToggleBtn.addEventListener("click", () => {
    if (routeSVM.updateGraphics.length > 0) {
      const routeGraphic = routeSVM.updateGraphics.at(0);
      const bufferGraphic = routeToBufferMap.get(routeGraphic);
      routeSVM.complete();
      bufferSVM.update(bufferGraphic);
    } else if (bufferSVM.updateGraphics.length > 0) {
      const bufferGraphic = bufferSVM.updateGraphics.at(0);
      const routeGraphic = bufferToRouteMap.get(bufferGraphic);
      bufferSVM.complete();
      routeSVM.update(routeGraphic);
    }
  });

  function updateBufferUnionGeometry(excludeBufferGraphic?: Graphic) {
    const bufferGraphics = bufferLayer.graphics
      .map((graphic) => (graphic === excludeBufferGraphic ? null : graphic.geometry))
      .filter((geometry) => geometry != null)
      .toArray();
    const geometry = bufferGraphics.length > 0 ? union(bufferGraphics) : null;
    bufferUnionGraphic.geometry = geometry;
  }

  function isolateBufferGraphic(bufferGraphic?: Graphic) {
    if (bufferGraphic) {
      bufferLayer.opacity = 1;
      bufferLayer.graphics.forEach((graphic) => {
        graphic.visible = graphic === bufferGraphic;
      });
    } else {
      bufferLayer.opacity = 0;
      bufferLayer.graphics.forEach((graphic) => {
        graphic.visible = true;
      });
    }
  }
  let startRouteGeometry: Polyline = null;
  let startBufferGeometry: Polygon = null;
  routeSVM.on("update", (e) => {
    const routeGraphic = e.graphics[0];
    const bufferGraphic = routeToBufferMap.get(routeGraphic);
    const updateGeometry = () => {
      const routeGeometry = routeGraphic.geometry as Polyline;
      if (routeGeometry.paths[0].length !== startRouteGeometry.paths[0].length) {
        return;
      }
      const vertexDeltas: number[][] = [];
      const movedVertices: number[][] = [];
      startRouteGeometry.paths[0].forEach((oldVertex, i) => {
        const newVertex = routeGeometry.paths[0][i];
        if (oldVertex[0] !== newVertex[0] && oldVertex[1] !== newVertex[1]) {
          vertexDeltas.push([newVertex[0] - oldVertex[0], newVertex[1] - oldVertex[1]]);
          movedVertices.push(oldVertex);
        }
      });

      const distanceSquared = (v1: number[], v2: number[]) => {
        const x = v2[0] - v1[0];
        const y = v2[1] - v1[1];
        return x * x + y * y;
      };
      let bufferGeometry = startBufferGeometry.clone();
      for (const ring of bufferGeometry.rings) {
        for (const vertex of ring) {
          let minDistanceSquaredToMovedVertex = Number.MAX_VALUE;
          let minDistanceSquaredToOriginalVertex = Number.MAX_VALUE;
          let movedVertexIdx = 0;
          for (let i = 0; i < movedVertices.length; i++) {
            const d = distanceSquared(vertex, movedVertices[i]);
            if (d < minDistanceSquaredToMovedVertex) {
              minDistanceSquaredToMovedVertex = d;
              movedVertexIdx = i;
            }
          }
          for (const unmovedVertex of startRouteGeometry.paths[0]) {
            minDistanceSquaredToOriginalVertex = Math.min(
              distanceSquared(vertex, unmovedVertex),
              minDistanceSquaredToOriginalVertex
            );
          }
          if (minDistanceSquaredToMovedVertex <= minDistanceSquaredToOriginalVertex) {
            vertex[0] += vertexDeltas[movedVertexIdx][0];
            vertex[1] += vertexDeltas[movedVertexIdx][1];
          }
        }
      }
      bufferGeometry = union([bufferGeometry, buffer(routeGraphic.geometry, bufferDistance) as Polygon]) as Polygon;
      bufferGeometry.rings = bufferGeometry.rings.slice(0, 1); // remove islands
      bufferGraphic.geometry = generalize(bufferGeometry, maxDeviation);
    };
    if (e.toolEventInfo?.type === "reshape-start") {
      startRouteGeometry = routeGraphic.geometry.clone() as Polyline;
      startBufferGeometry = bufferGraphic.geometry.clone();
      isolateBufferGraphic(bufferGraphic);
      updateBufferUnionGeometry(bufferGraphic);
    }
    if (e.toolEventInfo?.type === "reshape") {
      updateGeometry();
    }
    if (e.toolEventInfo?.type === "reshape-stop") {
      updateGeometry();
      isolateBufferGraphic(null);
      updateBufferUnionGeometry();
    }
  });

  bufferSVM.on("update", (e) => {
    const bufferGraphic = e.graphics[0];
    const routeGraphic = bufferToRouteMap.get(bufferGraphic);
    if (e.tool === "reshape") {
      const isValid = contains(bufferGraphic.geometry, routeGraphic.geometry);
      if (e.toolEventInfo?.type === "reshape-stop" && !isValid) {
        bufferSVM.undo();
        routeGraphic.symbol = validRouteSymbol;
      } else {
        routeGraphic.symbol = isValid ? validRouteSymbol : invalidRouteSymbol;
      }
      if (e.toolEventInfo?.type === "reshape-stop") {
        updateBufferUnionGeometry();
      }
    }
  });

  view.on("click", function (event) {
    view.hitTest(event).then(function (response) {
      const result = response.results[0];
      if (result?.type === "graphic") {
        const routeGraphic = bufferLayer.graphics.includes(result.graphic)
          ? bufferToRouteMap.get(result.graphic)
          : routesLayer.graphics.includes(result.graphic)
          ? result.graphic
          : null;
        if (routeGraphic) {
          appState.editMode = EditMode.Slope;
          routeSVM.update(routeGraphic);
        }
      }
    });
  });

  const drawHandles: IHandle[] = [];
  const onDone = () => {
    addBtn.className = "hidden";
    doneBtn.className = "hidden";
    drawHandles.forEach((h) => h.remove());
    drawHandles.length = 0;
    routeSVM.update(routesLayer.graphics.at(-1), { tool: "reshape" });
  };
  addBtn.addEventListener("click", () => {
    appState.editMode = EditMode.Slope;
    bufferSVM.complete();
    routeSVM.complete();

    addBtn.className = "hidden";
    doneBtn.className = "";

    drawHandles.push(
      routeSVM.on("create", (e) => {
        const routeGraphic = e.graphic;
        if (e.state === "start") {
          const bufferGraphic = new Graphic({
            geometry: null,
            symbol: createBufferSymbol
          });
          bufferLayer.add(bufferGraphic);
          isolateBufferGraphic(bufferGraphic);

          drawHandles.push(
            watch(
              () => routeGraphic.geometry,
              (routeGeometry) => {
                let bufferGeometry = buffer(routeGeometry, bufferDistance) as Polygon;
                bufferGeometry = generalize(bufferGeometry, maxDeviation) as Polygon;
                bufferGraphic.geometry = bufferGeometry;
              },
              { sync: true }
            )
          );
        }
        if (e.state === "complete") {
          routeGraphic.geometry = generalize(routeGraphic.geometry, maxDeviation);

          const bufferGraphic = bufferLayer.graphics.at(-1);
          routeToBufferMap.set(routeGraphic, bufferGraphic);
          bufferToRouteMap.set(bufferGraphic, routeGraphic);

          isolateBufferGraphic(null);
          updateBufferUnionGeometry();
          onDone();
        }
      })
    );
    routeSVM.create("polyline", { mode: "hybrid" });
  });

  doneBtn.addEventListener("click", () => {
    routeSVM.complete();
    onDone();
  });

  return [routeSVM, bufferSVM];
}
