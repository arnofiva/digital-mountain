import "@esri/calcite-components/dist/components/calcite-card";

import "highlight.js/styles/obsidian.css";
import hljs from "highlight.js";

import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import { Widget } from "./Widget";

type ConstructProperties = Pick<CodeSnippet, "display" | "text">;

@subclass("digital-mountain.CodeSnippet")
class CodeSnippet extends Widget<ConstructProperties> {
  @property()
  display = false;

  @property()
  text: string;

  render() {
    const codeEl = (
      <pre>
        <code class="highlight-typescript">{this.text}</code>
      </pre>
    );
    setTimeout(() => hljs.highlightAll(), 100);
    return (
      <div
        class="code-snippet view-ui-shadow"
        style={`visibility: ${this.display ? "visible" : "hidden"};`}
      >
        {codeEl}
      </div>
    );
  }
}

export default CodeSnippet;
