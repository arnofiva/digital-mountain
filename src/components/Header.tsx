import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";
import Widget from "@arcgis/core/widgets/Widget";

import { UIActions, WidgetProperties } from "./interfaces";

type Properties = Pick<Header, "actions" | "title"> & WidgetProperties;

@subclass("digital-mountain.Header")
class Header extends Widget {
  @property()
  actions: UIActions;

  @property()
  title: string;

  constructor(properties: Properties) {
    super(properties);
  }

  render() {
    return (
      <div class="header">
        <calcite-button onclick={() => this.actions.openTaskSelectionScreen()}>Back</calcite-button>
        <div class="title">{this.title}</div>
      </div>
    );
  }
}

export default Header;
