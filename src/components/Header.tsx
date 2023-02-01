import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { UIActions } from "./interfaces";
import { Widget } from "./Widget";

type ConstructProperties = Pick<Header, "actions" | "title">;

@subclass("digital-mountain.Header")
class Header extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  title: string;

  render() {
    return (
      <div class="header">
        <calcite-button
          onclick={() => this.actions.openTaskSelectionScreen({ animateCameraToStart: true })}
        >
          Back
        </calcite-button>
        <div class="title">{this.title}</div>
      </div>
    );
  }
}

export default Header;
