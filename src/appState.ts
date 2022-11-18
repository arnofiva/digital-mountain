import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";

@subclass("custom.AppState")
export class AppState extends Accessor {
  @property()
  editMode: EditMode | null = null;
}

export enum EditMode {
  Lift,
  Slope
}
