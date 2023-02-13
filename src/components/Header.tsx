import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { UIActions } from "./interfaces";
import { Widget } from "./Widget";

type ConstructProperties = Pick<Header, "actions" | "contentElement" | "subtitle">;

@subclass("digital-mountain.Header")
class Header extends Widget<ConstructProperties> {
  @property()
  actions: UIActions;

  @property()
  contentElement?: tsx.JSX.Element;

  @property()
  subtitle: string;

  render() {
    return (
      <div class="header">
        <calcite-button
          icon-start="chevron-left"
          onclick={() => this.actions.openTaskSelectionScreen({ animateCameraToStart: true })}
        />
        <div class="title">
          <h1>Digital Mountain</h1>
          <h3 class="subtitle">{this.subtitle}</h3>
        </div>
        {this.contentElement}
      </div>
    );
  }
}

export default Header;
