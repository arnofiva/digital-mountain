import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";

@subclass("custom.AppState")
export class AppState extends Accessor {
  @property()
  editMode: EditMode | null = null;

  @property()
  readonly skiSlopes: GraphicsLayer;
}

export enum EditMode {
  Lift,
  Slope
}
