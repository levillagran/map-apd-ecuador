import React, { useState, createRef } from "react";
//import type GeoJSON from "geojson";
import { geoMercator, geoPath } from "d3-geo";
import geoData from "./geodata/provinces_ec";
import type { Props, DataItem } from "./types";
import Frame from "./components/Frame";
import TextLabel from "./components/TextLabel";
/*import {
  defaultColor,
  defaultSize,
  heightRatio,
  defaultCountryStyle,
  defaultTooltip,
} from "./constants";
import { useWindowWidth, responsify } from "./utils";
import { drawTooltip } from "./draw";
import Frame from "./components/Frame";
import Region from "./components/Region";
import TextLabel from "./components/TextLabel";
// Import Tooltip from './components/Tooltip';

export type {
  ISOCode,
  SizeOption,
  DataItem,
  Data,
  CountryContext,
  Props,
} from "./types";*/

function toValue({ value }: DataItem<string | number>): number {
  return typeof value === "string" ? 0 : value;
}

export default function EcMap<T extends number | string>(
  props: Props<T>,
): JSX.Element {
  const {
    data,
    title,
    textLabelFunction = () => [],
  } = props;

  // Inits
  const width = 400;
  const height = 400;
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const containerRef = createRef<SVGSVGElement>();

  // Calc min/max values and build country map for direct access
  const countryValueMap = Object.fromEntries(
    data.map(({ province, value }) => [province, value]),
  );

  const minValue = Math.min(...data.map(toValue));
  const maxValue = Math.max(...data.map(toValue));

  // Build a path & a tooltip for each country
  const projection = geoMercator();
  const pathGenerator = geoPath().projection(projection);

  /*const onClick = React.useCallback(
    (context: CountryContext<T>) => (event: React.MouseEvent<SVGElement>) =>
      onClickFunction?.({ ...context, event }),
    [onClickFunction],
  );*/

  const regions = geoData.data;

  // Build paths
  //const regionPaths = regions.map((entry) => entry.path);

  // Build tooltips
  //const regionTooltips = regions.map((entry) => entry.highlightedTooltip);

  const eventHandlers = {
    onMouseDown(e: React.MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
    },
    onDoubleClick(e: React.MouseEvent) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (scale === 4) {
        setTranslateX(0);
        setTranslateY(0);
        setScale(1);
      } else {
        setTranslateX(2 * translateX - x);
        setTranslateY(2 * translateY - y);
        setScale(scale * 2);
      }
    },
  };

  // Render the SVG
  return (
    <figure className="worldmap__figure-container" style={{ background : "white" }}>
      {title && (
        <figcaption className="worldmap__figure-caption">{title}</figcaption>
      )}
      <svg
        ref={containerRef}
        height={`${height}px`}
        width={`${width}px`}
        {...(false ? eventHandlers : undefined)}>
        {false && <Frame color={"black"} />}
        <g
          transform={`translate(${translateX}, ${translateY}) scale(${
            (width / 960) * scale
          }) translate(0, 240)`}
          style={{ transition: "all 0.2s" }}>
         
        </g>
        <g>
          {textLabelFunction(width).map((labelProps) => (
            <TextLabel {...labelProps} key={labelProps.label} />
          ))}
        </g>
        
      </svg>
    </figure>
  );
}

const regions = geoData.data;

export { EcMap, regions };