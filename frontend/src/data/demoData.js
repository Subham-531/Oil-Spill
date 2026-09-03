/**
 * Graphite Bridge — Pre-cached Forensic Analysis Dataset
 * Fallback dataset guaranteeing immediate offline testability
 * and alignment with backend demo_cache files.
 */

export const DEMO_DETECTION = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.540479, 19.494339],
            [72.537164, 19.495756],
            [72.531236, 19.494773],
            [72.523598, 19.491542],
            [72.515411, 19.486553],
            [72.507924, 19.480567],
            [72.502275, 19.474494],
            [72.499324, 19.46926],
            [72.499521, 19.465661],
            [72.502836, 19.464244],
            [72.508764, 19.465227],
            [72.516402, 19.468458],
            [72.524589, 19.473447],
            [72.532076, 19.479433],
            [72.537725, 19.485506],
            [72.540676, 19.49074],
            [72.540479, 19.494339],
          ],
        ],
      },
      properties: {
        area_km2: 8.48,
        centroid: [72.5443, 19.4974],
        orientation_deg: 35.0,
        elongation_ratio: 3.1,
        confidence: 0.88,
        timestamp: '2024-01-15T06:00:00Z',
        age_bucket: '> 24 h',
      },
    },
  ],
}

export const DEMO_DRIFT = {
  origin_estimate: {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [72.524434, 19.413444],
          [72.513976, 19.406028],
          [72.507469, 19.392025],
          [72.505904, 19.373566],
          [72.509519, 19.353463],
          [72.517764, 19.334774],
          [72.529384, 19.320347],
          [72.543034, 19.312847],
          [72.557112, 19.314221],
          [72.569941, 19.324314],
          [72.579934, 19.341872],
          [72.585721, 19.363914],
          [72.586234, 19.387114],
          [72.581023, 19.407234],
          [72.568431, 19.420112],
          [72.551234, 19.423451],
          [72.534211, 19.418934],
          [72.524434, 19.413444],
        ],
      ],
    },
    properties: {
      timestamp: '2024-01-14T23:30:00Z',
      uncertainty_radius_km: 14.8,
    },
  },
  forecast_track: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [72.5394, 19.3642],
      },
      properties: { timestamp: '2024-01-14T23:30:00Z', step: 0 },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [72.5401, 19.3920],
      },
      properties: { timestamp: '2024-01-15T01:30:00Z', step: 1 },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [72.5422, 19.4410],
      },
      properties: { timestamp: '2024-01-15T03:30:00Z', step: 2 },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [72.5443, 19.4974],
      },
      properties: { timestamp: '2024-01-15T06:00:00Z', step: 3 },
    },
  ],
}

export const DEMO_ATTRIBUTION = [
  {
    mmsi: 'CULPRIT_999',
    name: 'STEALTH VOYAGER',
    type: 'Crude Oil Tanker',
    suspicion_score: 94,
    distance_km: 1.2,
    sub_scores: {
      spatial: 98,
      temporal: 95,
      vessel_type: 100,
    },
    intersection_point: [72.5394, 19.3642],
    intersection_time: '2024-01-14T23:30:00Z',
    track_geojson: {
      type: 'LineString',
      coordinates: [
        [72.4434, 19.3002],
        [72.4674, 19.3144],
        [72.4914, 19.3319],
        [72.5154, 19.3501],
        [72.5394, 19.3642],
        [72.5634, 19.3806],
        [72.5874, 19.3956],
        [72.6114, 19.4120],
        [72.6354, 19.4285],
        [72.6594, 19.4449],
      ],
    },
  },
  {
    mmsi: '419002345',
    name: 'PACIFIC HORIZON',
    type: 'Bulk Carrier',
    suspicion_score: 68,
    distance_km: 8.4,
    sub_scores: {
      spatial: 72,
      temporal: 65,
      vessel_type: 60,
    },
    track_geojson: {
      type: 'LineString',
      coordinates: [
        [72.4800, 19.2600],
        [72.5100, 19.3100],
        [72.5450, 19.3600],
        [72.5800, 19.4200],
      ],
    },
  },
  {
    mmsi: '419003456',
    name: 'ARABIAN SEA STAR',
    type: 'Container Ship',
    suspicion_score: 42,
    distance_km: 14.1,
    sub_scores: {
      spatial: 45,
      temporal: 50,
      vessel_type: 40,
    },
    track_geojson: {
      type: 'LineString',
      coordinates: [
        [72.4200, 19.4000],
        [72.4800, 19.4100],
        [72.5600, 19.4300],
        [72.6200, 19.4500],
      ],
    },
  },
  {
    mmsi: '419004567',
    name: 'MARITIME LEADER',
    type: 'Chemical Tanker',
    suspicion_score: 38,
    distance_km: 19.8,
    sub_scores: {
      spatial: 32,
      temporal: 40,
      vessel_type: 55,
    },
    track_geojson: {
      type: 'LineString',
      coordinates: [
        [72.5000, 19.2000],
        [72.5300, 19.2500],
        [72.5700, 19.3000],
      ],
    },
  },
  {
    mmsi: '419005678',
    name: 'OCEAN EXPLORER',
    type: 'General Cargo',
    suspicion_score: 24,
    distance_km: 26.5,
    sub_scores: {
      spatial: 20,
      temporal: 30,
      vessel_type: 30,
    },
    track_geojson: {
      type: 'LineString',
      coordinates: [
        [72.4500, 19.5200],
        [72.5200, 19.5300],
        [72.5900, 19.5500],
      ],
    },
  },
]
