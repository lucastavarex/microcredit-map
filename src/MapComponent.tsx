//@ts-nocheck
import React, { useEffect, useState } from 'react';
import { Map } from 'react-map-gl/maplibre';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import DeckGL from '@deck.gl/react';
import { CSVLoader } from '@loaders.gl/csv';
import { load } from '@loaders.gl/core';
import "./MapComponent.css"
import type { Color, PickingInfo, ViewStateProps } from '@deck.gl/core';
import SliderComponent from './SliderComponent';

// Source data CSV
const DATA_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTuxVeI--E1Jue1Ir2qdwwefyGhF77WCaTOcR2iHJ81ylB1VjjfVpxALN8wVJqTmQ/pub?gid=1334782578&single=true&output=csv';

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

const isMobile = window.innerWidth <= 768;

const INITIAL_VIEW_STATE: ViewStateProps = {
  longitude: isMobile ? -43.0995390451405 : -43.0989390451405,
  latitude: isMobile ? -22.934947215826018 : -22.934947215826018,
  zoom: isMobile ? 14.9 : 16.4,
  minZoom: 5,
  maxZoom: 18.4,
  pitch: isMobile ? 40 : 40.5,
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

  const statusCounts = object.points.reduce((acc, point) => {
    const status = point.source.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return {
    html: `
      <div style="padding: 10px; font-size: 14px;">
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <span style="width: 10px; height: 10px; background-color: #4caf50; border-radius: 50%; margin-right: 8px;"></span>
          <span>Quitado:  <b>${statusCounts['QUITADO'] || 0}</b></span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <span style="width: 10px; height: 10px; background-color: #2196f3; border-radius: 50%; margin-right: 8px;"></span>
          <span>Pagando:  <b>${statusCounts['PAGANDO'] || 0}</b></span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <span style="width: 10px; height: 10px; background-color: #f44336; border-radius: 50%; margin-right: 8px;"></span>
          <span>Cancelado:  <b>${statusCounts['CANCELADO'] || 0}</b></span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <span style="width: 10px; height: 10px; background-color: #ff9800; border-radius: 50%; margin-right: 8px;"></span>
          <span>Pg.Juros/Parc.:  <b>${statusCounts['PAGO COM JUROS/PAGO PARCIAL'] || 0}</b></span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <span style="width: 10px; height: 10px; background-color: #9c27b0; border-radius: 50%; margin-right: 8px;"></span>
          <span>Solic. Repr.:  <b>${statusCounts['SOLICITAÇÃO REPROVADA'] || 0}</b></span>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="width: 10px; height: 10px; background-color: #ff5722; border-radius: 50%; margin-right: 8px;"></span>
          <span>Inadimplente: <b>${statusCounts['INADIMPLENTE'] || 0}</b></span>
        </div>
      </div>
    `,
  };
}

type DataPoint = { lng: number; lat: number; status: string };

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
  const [radiusValue, setRadiusValue] = useState(radius); // State for radius value
  useEffect(() => {
    const fetchData = async () => {
      const loadedData = await load(DATA_URL, CSVLoader);
      const pointsData: DataPoint[] = loadedData.data.map((d: { lng: number; lat: number; status: string }) => ({
        lng: d.lng,
        lat: d.lat,
        status: d.status,
      }));
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
      elevationRange: [0, 100],
      elevationScale: points && points.length ? 5 : 0,
      opacity: 0.5,
      extruded: true,
      getPosition: (d) => [d.lng, d.lat],
      pickable: true,
      radius: radiusValue,
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
    <div >
      <DeckGL
        layers={layers}
        effects={[lightingEffect]}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        getTooltip={getTooltip}
      >
        <Map reuseMaps mapStyle={mapStyle} />
      </DeckGL>
      {/* Image Overlay in Bottom Left */}
      <div className="icon" style={{
        position: 'fixed',
        zIndex: 1,
      }}>
        <a href="https://www.instagram.com/bancopreve/" target="_blank">
          <img
            src="icon.png"
            alt="Map Overlay"
            style={{ width: '40px', height: 'auto' }}
          />
        </a>
      </div>
      <div style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        maxWidth: '600px',
        zIndex: 1,
      }}>
        <SliderComponent
          value={radiusValue}
          min={50}
          max={300}
          step={10}
          onChange={setRadiusValue}
        />
      </div>


    </div>
  );
};

export default MapComponent;