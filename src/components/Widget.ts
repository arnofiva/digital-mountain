import EsriWidget from "@arcgis/core/widgets/Widget";

type WidgetProperties = ConstructorParameters<typeof EsriWidget>[0];

// declare our own Widget class to avoid boilerplate in defining the constructor
export class Widget<Properties = {}> extends EsriWidget {
  constructor(properties: Properties & WidgetProperties) {
    super(properties);
  }
}
