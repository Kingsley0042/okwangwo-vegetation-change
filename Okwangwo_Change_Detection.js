// ============================================================
// SENTINEL-2 VEGETATION CHANGE DETECTION
// Okwangwo, Cross River, Nigeria
// 2020–2025
//
// Workflow:
// 1. Define study area
// 2. Load Sentinel-2 imagery
// 3. Apply cloud-probability masking
// 4. Create 2020 and 2025 composites
// 5. Calculate NDVI
// 6. Calculate NDVI change
// 7. Identify potential vegetation loss
// 8. Reference 2024 FAO land-cover data
// 9. Calculate area and loss pixels
// 10. Export GIS outputs
// ============================================================


// ============================================================
// 1. DATASETS
// ============================================================

// Sentinel-2 surface reflectance imagery
var sentinel = ee.ImageCollection(
  'COPERNICUS/S2_SR_HARMONIZED'
);

// Sentinel-2 cloud probability
var cloudProbability = ee.ImageCollection(
  'COPERNICUS/S2_CLOUD_PROBABILITY'
);

// 2024 Nigeria land-cover reference data
var landCover2024 = ee.Image(
  'projects/nigeriagisproject/assets/LCLU_LC_NG_2024'
);


// ============================================================
// 2. STUDY AREA
// ============================================================

// Original working area used to locate the Cross River
// protected-area record.
var workingArea = ee.Geometry.Rectangle([
  9.18, 6.23,
  9.28, 6.33
]);

// Load protected areas
var protectedAreas = ee.FeatureCollection(
  'WCMC/WDPA/current/polygons'
);

// Find protected areas overlapping the working area
var nearbyProtectedAreas = protectedAreas
  .filterBounds(workingArea);

// Select the Cross River protected-area record
var crossRiver = nearbyProtectedAreas
  .filter(
    ee.Filter.eq('NAME', 'Cross River')
  )
  .first();

// Create the final working study boundary
var aoi = ee.Geometry(
  crossRiver.geometry()
).intersection(
  workingArea,
  ee.ErrorMargin(1)
);

// Display study boundary
Map.centerObject(aoi, 12);

Map.addLayer(
  aoi,
  {color: 'blue'},
  'Okwangwo Study Boundary'
);


// ============================================================
// 3. SENTINEL-2 2020
// ============================================================

// Get Sentinel-2 imagery from 2020
var sentinel2020 = sentinel
  .filterBounds(aoi)
  .filterDate(
    '2020-01-01',
    '2021-01-01'
  );

// Get matching cloud-probability imagery
var cloud2020 = cloudProbability
  .filterBounds(aoi)
  .filterDate(
    '2020-01-01',
    '2021-01-01'
  );

// Match Sentinel-2 images with cloud probability
var joined2020 = ee.Join.saveFirst(
  'cloud_probability'
).apply({
  primary: sentinel2020,
  secondary: cloud2020,
  condition: ee.Filter.equals({
    leftField: 'system:index',
    rightField: 'system:index'
  })
});

// Convert to ImageCollection
var joinedCollection2020 =
  ee.ImageCollection(joined2020);

// Apply cloud mask
var cloudMasked2020 =
  joinedCollection2020.map(
    function(image) {

      var cloud = ee.Image(
        image.get('cloud_probability')
      );

      var mask = cloud.lt(60);

      return image.updateMask(mask);
    }
  );

// Create median composite
var composite2020 =
  cloudMasked2020
    .median()
    .clip(aoi);


// ============================================================
// 4. SENTINEL-2 2025
// ============================================================

// Get Sentinel-2 imagery from 2025
var sentinel2025 = sentinel
  .filterBounds(aoi)
  .filterDate(
    '2025-01-01',
    '2026-01-01'
  );

// Get matching cloud-probability imagery
var cloud2025 = cloudProbability
  .filterBounds(aoi)
  .filterDate(
    '2025-01-01',
    '2026-01-01'
  );

// Match Sentinel-2 images with cloud probability
var joined2025 = ee.Join.saveFirst(
  'cloud_probability'
).apply({
  primary: sentinel2025,
  secondary: cloud2025,
  condition: ee.Filter.equals({
    leftField: 'system:index',
    rightField: 'system:index'
  })
});

// Convert to ImageCollection
var joinedCollection2025 =
  ee.ImageCollection(joined2025);

// Apply cloud mask
var cloudMasked2025 =
  joinedCollection2025.map(
    function(image) {

      var cloud = ee.Image(
        image.get('cloud_probability')
      );

      var mask = cloud.lt(60);

      return image.updateMask(mask);
    }
  );

// Create median composite
var composite2025 =
  cloudMasked2025
    .median()
    .clip(aoi);


// ============================================================
// 5. NDVI
// ============================================================

// Calculate NDVI for 2020
var ndvi2020 =
  composite2020
    .normalizedDifference([
      'B8',
      'B4'
    ])
    .rename('NDVI_2020');

// Calculate NDVI for 2025
var ndvi2025 =
  composite2025
    .normalizedDifference([
      'B8',
      'B4'
    ])
    .rename('NDVI_2025');


// ============================================================
// 6. NDVI CHANGE
// ============================================================

// Calculate NDVI change
// Positive = vegetation increase
// Negative = vegetation decrease
var ndviChange =
  ndvi2025
    .subtract(ndvi2020)
    .rename('NDVI_Change');


// ============================================================
// 7. POTENTIAL VEGETATION LOSS
// ============================================================

// Identify pixels where NDVI decreased
// by more than 0.2.
var vegetationLoss =
  ndviChange.lt(-0.2);


// ============================================================
// 8. MAP LAYERS
// ============================================================

// 2020 satellite composite
Map.addLayer(
  composite2020,
  {
    bands: [
      'B4',
      'B3',
      'B2'
    ],
    min: 0,
    max: 3000
  },
  'Okwangwo 2020',
  false
);

// 2025 satellite composite
Map.addLayer(
  composite2025,
  {
    bands: [
      'B4',
      'B3',
      'B2'
    ],
    min: 0,
    max: 3000
  },
  'Okwangwo 2025',
  false
);

// NDVI change
Map.addLayer(
  ndviChange,
  {
    min: -0.5,
    max: 0.5,
    palette: [
      'red',
      'white',
      'green'
    ]
  },
  'NDVI Change 2020-2025',
  false
);

// Potential vegetation loss
Map.addLayer(
  vegetationLoss.selfMask(),
  {
    palette: [
      'red'
    ]
  },
  'Potential Vegetation Loss',
  true
);

// 2024 land-cover reference
Map.addLayer(
  landCover2024.clip(aoi),
  {},
  '2024 Land Cover Reference',
  false
);


// ============================================================
// 9. AREA CALCULATION
// ============================================================

// Calculate potential vegetation-loss area
var lossArea =
  vegetationLoss
    .selfMask()
    .multiply(
      ee.Image.pixelArea()
    )
    .reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: aoi,
      scale: 30,
      maxPixels: 1e8,
      bestEffort: true
    });

// Convert square metres to hectares
var lossAreaHectares =
  ee.Number(
    lossArea.get(
      'NDVI_Change'
    )
  ).divide(10000);


// ============================================================
// 10. LOSS PIXEL COUNT
// ============================================================

// Count pixels classified as potential loss
var lossPixelCount =
  vegetationLoss
    .selfMask()
    .reduceRegion({
      reducer: ee.Reducer.count(),
      geometry: aoi,
      scale: 30,
      maxPixels: 1e8,
      bestEffort: true
    });


// ============================================================
// 11. STUDY AREA SIZE
// ============================================================

var studyAreaHectares =
  aoi
    .area()
    .divide(10000);


// ============================================================
// 12. PROJECT SUMMARY
// ============================================================

print(
  '2020 Sentinel-2 images:',
  cloudMasked2020.size()
);

print(
  '2025 Sentinel-2 images:',
  cloudMasked2025.size()
);

print(
  'Study area (hectares):',
  studyAreaHectares
);

print(
  'Potential vegetation loss (hectares):',
  lossAreaHectares
);

print(
  'Potential vegetation loss pixels:',
  lossPixelCount
);


// ============================================================
// 13. EXPORT POTENTIAL VEGETATION LOSS
// ============================================================

Export.image.toDrive({
  image: vegetationLoss.selfMask(),
  description:
    'Okwangwo_Potential_Vegetation_Loss_Final',
  folder:
    'Okwangwo_GIS_Project',
  fileNamePrefix:
    'Okwangwo_Potential_Vegetation_Loss_Final',
  region: aoi,
  scale: 30,
  maxPixels: 1e8
});


// ============================================================
// 14. EXPORT NDVI CHANGE
// ============================================================

Export.image.toDrive({
  image: ndviChange,
  description:
    'Okwangwo_NDVI_Change_2020_2025',
  folder:
    'Okwangwo_GIS_Project',
  fileNamePrefix:
    'Okwangwo_NDVI_Change_2020_2025',
  region: aoi,
  scale: 30,
  maxPixels: 1e8
});


// ============================================================
// 15. EXPORT STUDY BOUNDARY
// ============================================================

Export.table.toDrive({
  collection:
    ee.FeatureCollection([
      ee.Feature(aoi)
    ]),
  description:
    'Okwangwo_Study_Boundary',
  folder:
    'Okwangwo_GIS_Project',
  fileNamePrefix:
    'Okwangwo_Study_Boundary',
  fileFormat:
    'SHP'
});
