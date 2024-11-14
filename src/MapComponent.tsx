//@ts-nocheck
import React, { useEffect, useState } from 'react';
import { Map } from 'react-map-gl/maplibre';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import DeckGL from '@deck.gl/react';
import { CSVLoader } from '@loaders.gl/csv';
import { load } from '@loaders.gl/core';

import type { Color, PickingInfo, ViewStateProps } from '@deck.gl/core';

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/lucastavarex/microcredit-map/refs/heads/main/src/assets/coordinates.csv';

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000],
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000],
});

const lightingEffect = new LightingEffect({
  ambientLight,
  pointLight1,
  pointLight2,
});

const INITIAL_VIEW_STATE: ViewStateProps = {
  longitude: -43.0988390451405,
  latitude: -22.934947215826018,
  zoom: 16.4,
  minZoom: 5,
  maxZoom: 18.4,
  pitch: 40.5,
  bearing: -27,
};

// const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
// const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json'
// const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json'
// const MAP_STYLE = 	'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
// const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
export const colorRange: Color[] = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78],
];

function getTooltip({ object }: PickingInfo) {
  if (!object) return null;

  const count = object.points.length;

  return {
    html: `
      <div style="padding: 10px; font-size: 14px;">
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <span style="width: 10px; height: 10px; background-color: #4caf50; border-radius: 50%; margin-right: 8px;"></span>
          <span>Quitado:  <b>${count}</b></span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <span style="width: 10px; height: 10px; background-color: #2196f3; border-radius: 50%; margin-right: 8px;"></span>
          <span>Pagando:  <b>${count}</b></span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <span style="width: 10px; height: 10px; background-color: #f44336; border-radius: 50%; margin-right: 8px;"></span>
          <span>Cancelado:  <b>${count}</b></span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <span style="width: 10px; height: 10px; background-color: #ff9800; border-radius: 50%; margin-right: 8px;"></span>
          <span>Pg.Juros/Parc.:  <b>${count}</b></span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <span style="width: 10px; height: 10px; background-color: #9c27b0; border-radius: 50%; margin-right: 8px;"></span>
          <span>Solic. Repr.:  <b>${count}</b></span>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="width: 10px; height: 10px; background-color: #ff5722; border-radius: 50%; margin-right: 8px;"></span>
          <span>Inadimplente: <b>${count}</b></span>
        </div>
      </div>
    `,
  };
}


type DataPoint = [number, number];

interface MapComponentProps {
  data?: DataPoint[] | null;
  mapStyle?: string;
  radius?: number;
  upperPercentile?: number;
  coverage?: number;
}

const MapComponent: React.FC<MapComponentProps> = ({
  data = null,
  mapStyle = MAP_STYLE,
  radius = 50,
  upperPercentile = 100,
  coverage = 1,
}) => {
  const [points, setPoints] = useState<DataPoint[] | null>(null);
  console.log('points', points)
  useEffect(() => {
    const fetchData = async () => {
      const loadedData = await load(DATA_URL, CSVLoader);
      const pointsData: DataPoint[] = loadedData.data.map((d: { lng: number; lat: number }) => [
        d.lng,
        d.lat,
      ]);
      setPoints(pointsData);
    };

    fetchData();
  }, []);

  const layers = [
    new HexagonLayer<DataPoint>({
      id: 'heatmap',
      colorRange,
      coverage,
      data: points,
      elevationRange: [0, 5],
      elevationScale: points && points.length ? 5 : 0,
      opacity: 0.5,
      extruded: true,
      getPosition: (d) => d,
      pickable: true,
      radius,
      upperPercentile,
      material: {
        ambient: 0.64,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [51, 51, 51],
      },
      transitions: {
        elevationScale: 3000,
      },
    }),
  ];

  return (
    <DeckGL
      layers={layers}
      effects={[lightingEffect]}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
};

export default MapComponent;
