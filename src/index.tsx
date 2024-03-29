import React, { useState, createRef } from "react";
//import type GeoJSON from "geojson";
import { geoMercator, geoPath } from "d3-geo";
import geoData from './geodata/provinces_ec.json';
import type { Props, CountryContext, DataItem } from "./types";
import Frame from "./components/Frame";
import Region from "./components/Region";
import TextLabel from "./components/TextLabel";
import { drawTooltip } from "./draw";
import {defaultCountryStyle} from "./constants";

function toValue({ value }: DataItem<string | number>): number {
  return typeof value === "string" ? 0 : value;
}

export default function EcMap<T extends number | string>(
  props: Props<T>,
): JSX.Element {
  const {
    data,
    title,
    styleFunction = defaultCountryStyle("black", 0.2),
    textLabelFunction = () => [],
  } = props;

  const width = 1000;
  const height = 1000;
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const containerRef = createRef<SVGSVGElement>();

  const countryValueMap = Object.fromEntries(
    data.map(({ province, value }) => [province, value]),
  );

  const minValue = Math.min(...data.map(toValue));
  const maxValue = Math.max(...data.map(toValue));

  // Construcción de cada provincia
  const projection = geoMercator().fitSize([1000, 1000], geoData).precision(100);
  const pathGenerator = geoPath().projection(projection);

  const regions = geoData.features.map((feature) => {
    const triggerRef = createRef<SVGPathElement>();

    const context: CountryContext<T> = {
      countryCode: feature.properties.code,
      countryValue: countryValueMap[feature.properties.code],
      countryName: feature.properties.name,
      color : "red",
      minValue,
      maxValue,
      prefix: "",
      suffix: "",
    };

    const path = (
      <Region
        ref={triggerRef}
        d={pathGenerator(feature)!}
        style={styleFunction(context)}
        strokeOpacity={0.2}
        key={feature.properties.name}
      />
    );

    const tooltip = drawTooltip(
      feature.properties.name,
      "#FFFF99",
      "black",
      triggerRef,
      containerRef,
    );

    return { path, highlightedTooltip: tooltip };
  });


  // construcción de los paths
  const regionPaths = regions.map((entry) => entry.path);

  // construcción tooltips
  const regionTooltips = regions.map((entry) => entry.highlightedTooltip);

  // Renderizacion del SVG
  return (
    <figure className="worldmap__figure-container" style={{ backgroundColor : "white" }}>
      {title && (
        <figcaption className="worldmap__figure-caption">{title}</figcaption>
      )}
      <svg
        ref={containerRef}
        height={`${height}px`}
        width={`${width}px`}>
        {false && <Frame color={"blue"} />}
        <g
          transform={`translate(${translateX}, ${translateY}) scale(${
            (width / 960) * scale
          }) translate(0, 240)`}
          style={{ transition: "all 0.2s" }}>
          {regionPaths}
        </g>
        <g>
          {textLabelFunction(width).map((labelProps) => (
            <TextLabel {...labelProps} key={labelProps.label} />
          ))}
        </g>
        {regionTooltips}
      </svg>
    </figure>
  );
}

const regions = geoData.features.map((g) => ({ name: g.properties.name, code: g.properties.code }));

export { EcMap, regions };
