import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";
import Widget from "@arcgis/core/widgets/Widget";

@subclass("winter-resort.App")
class App extends Widget {
  @property()
  counter = 0;

  initialize() {
    setInterval(() => this.counter += 1, 100);
  }

  render() {
    return (<div>App {this.counter}</div>)
  }
}

export default App;
