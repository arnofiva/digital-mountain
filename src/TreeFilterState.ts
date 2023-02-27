import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Geometry from "@arcgis/core/geometry/Geometry";
import { union } from "@arcgis/core/geometry/geometryEngine";

/**
 * Manages the state for the filter geometry used to mask out trees while drawing or editing lifts and slopes.
 *
 * The class uses the concepts of 'staged' and 'committed' geometry. Staged geometry only exists
 * until `revert()` is called, and can be thought of as temporary. The currently staged geometry
 * becomes permanent committed geometry once `commit()` is called.
 */
@subclass("digital-mountain.TreeFilterState")
class TreeFilterState extends Accessor {
  /**
   * Returns a union of the staged and committed geometry, that can be applied in a feature filter.
   */
  @property()
  get geometry(): Geometry | null {
    return this._geometry;
  }
  @property()
  private _geometry: Geometry | null = null;

  private _committedGeometry: Geometry | null = null;

  /**
   * Set a geometry to be the staged geometry, replacing any existing staged geometry.
   */
  stage(geometry: Geometry): void {
    this._geometry = this._committedGeometry ? union([this._committedGeometry, geometry]) : geometry;
  }

  /**
   * Commit the currently staged geometry. Optionally, provide an array of geometries that will be
   * unioned to create the new committed geometry.
   */
  commit(geometries?: Geometry[]): void {
    if (geometries) {
      this._committedGeometry = geometries.length ? union(geometries) : null;
    } else {
      this._committedGeometry = this._geometry;
    }
  }

  /**
   * Discard the currently staged geometry.
   */
  revert(): void {
    // revert any staged change that was not committed
    this._geometry = this._committedGeometry;
  }
}

export default TreeFilterState;
