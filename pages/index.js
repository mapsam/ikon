import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwc2FtIiwiYSI6ImNrdWEyZWFmNDBjanAzMnE2bjQ3enV0bTgifQ.ytDjDrR0KTH6xgSmBkgDpw';

export async function getServerSideProps() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSE9B47Ch0Df4xCqxBE0l1pxoiMzqnmj5G7ZQno4pVpbB5rZVz8QIt_fzMYtMhtSgIX-kdLF0veRECT/pub?output=csv');
  const data = await res.text();

  // convert csv to json
  const prepared = data
    .split('\r\n')
    .map((row) => row.split(','));

  const headers = prepared.shift();
  const locations = prepared.map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });

  const geojson = {
    type: 'FeatureCollection',
    features: locations.map((loc) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [loc.Longitude, loc.Latitude]
        },
        properties: {
          name: loc.Name
        }
      }
    })
  };

  return { props: { locations, geojson } };
}

export default function Index({ locations, geojson }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-97);
  const [lat, setLat] = useState(39);
  const [zoom, setZoom] = useState(3.5);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapsam/ckua25my96d8n18nprlh4lkq1',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on('load', () => {
      map.current.addSource('ikon-locations', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50
      });

      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'ikon-locations',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#0074D9',
          'circle-radius': 20
        }
      });

      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'ikon-locations',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Ubuntu Mono Bold'],
          'text-size': 18,
          'text-offset': [0, 0.16]
        },
        paint: {
          'text-color': '#FFFFFF'
        }
      });

      map.current.addLayer({
        id: 'ikon-locations',
        type: 'circle',
        source: 'ikon-locations',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-color': '#001f3f',
          'circle-stroke-color': 'white'
        }
      });

      map.current.addLayer({
        id: 'ikon-locations-labels',
        type: 'symbol',
        source: 'ikon-locations',
        layout: {
          'text-field': ['get', 'name'],
          'text-variable-anchor': ['bottom-left', 'bottom-right', 'top-left', 'top-right'],
          'text-radial-offset': 0.5,
          'text-justify': 'center',
          'text-font': ['Ubuntu Mono Bold'],
          'text-size': 15,
          'text-transform': 'uppercase'
        },
        paint: {
          'text-color': '#FFFFFF',
          'text-halo-color': '#001f3f',
          'text-halo-width': 10
        }
      });
    });
  });

  function locationClick(e) {
    e.preventDefault();
    map.current.setCenter([e.currentTarget.dataset.lon, e.currentTarget.dataset.lat]);
    map.current.setZoom(9);
  }

  const list = locations.map((loc) => {
    return (
      <div data-lon={loc.Longitude} data-lat={loc.Latitude} className='item' onClick={locationClick}>
        <span className='item-title'>{loc.Name}</span> <span className='item-location'>[{loc.Country}]</span>
      </div>
    );
  });

  return (
    <div>
      <div className='left'>
        {list}
      </div>
      <div className='map-container'>
        <div className='map' ref={mapContainer} />
      </div>
    </div>
  );
}
