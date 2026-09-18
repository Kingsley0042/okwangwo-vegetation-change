# Okwangwo Vegetation Change Detection

## Overview

This project analyzes vegetation change in Okwangwo, Cross River, Nigeria, using Sentinel-2 satellite imagery and NDVI (Normalized Difference Vegetation Index).

The analysis compares vegetation conditions between 2020 and 2025 and identifies areas where NDVI decreased significantly. A 2024 FAO land-cover dataset is included as a reference layer for interpreting the results.

## Study Area

The study area is located within the Cross River region of southeastern Nigeria.

The analysis uses a study boundary derived from the Cross River protected-area dataset and a defined working area around Okwangwo.

## Data

### Sentinel-2

Sentinel-2 Surface Reflectance imagery was used for:

* 2020
* 2025

The imagery was processed in Google Earth Engine using cloud-probability masking and median compositing.

### 2024 Land Cover

A 2024 FAO land-cover dataset for Nigeria was used as a reference layer.

The land-cover data provides contextual information for interpreting areas identified as potential vegetation loss.

## Methodology

The workflow was developed in Google Earth Engine.

1. Define the study area.
2. Load Sentinel-2 Surface Reflectance imagery.
3. Match Sentinel-2 imagery with cloud-probability data.
4. Apply cloud masking.
5. Create median composites for 2020 and 2025.
6. Calculate NDVI for both years.
7. Calculate NDVI change between 2020 and 2025.
8. Identify pixels where NDVI decreased by more than 0.2.
9. Calculate the area of potential vegetation loss.
10. Export the analysis results for GIS use.

## NDVI

NDVI is calculated using the near-infrared (NIR) and red bands:

NDVI = (NIR - Red) / (NIR + Red)

For Sentinel-2, the analysis uses:

* B8: Near-infrared
* B4: Red

NDVI change is calculated as:

NDVI Change = NDVI 2025 - NDVI 2020

Negative values indicate a decrease in NDVI.

## Results

The analysis produced the following results:

* Study area: approximately 7,823.82 hectares
* Potential vegetation loss: approximately 0.49 hectares
* Potential vegetation loss pixels: 6
* Sentinel-2 images used in 2020: 142
* Sentinel-2 images used in 2025: 205

The identified areas represent **potential vegetation loss based on an NDVI threshold**. They should not automatically be interpreted as confirmed deforestation without additional validation.

## Outputs

The project produced:

* `Okwangwo_Potential_Vegetation_Loss_Final.tif`
* `Okwangwo_NDVI_Change_2020_2025.tif`
* `Okwangwo_Study_Boundary` shapefile

These outputs can be used for further analysis and visualization in GIS software such as QGIS or ArcGIS Pro.

## Tools

* Google Earth Engine
* JavaScript
* Sentinel-2
* NDVI
* QGIS / ArcGIS Pro for GIS visualization and further analysis

## Project Structure

```text
okwangwo-vegetation-change/
│
├── Okwangwo_Change_Detection.js
├── README.md
└── outputs/
    ├── Okwangwo_Potential_Vegetation_Loss_Final.tif
    ├── Okwangwo_NDVI_Change_2020_2025.tif
    └── Okwangwo_Study_Boundary/
```

## Limitations

NDVI change can be caused by factors other than permanent vegetation loss, including seasonal differences, rainfall, vegetation condition, land management, and residual atmospheric or cloud effects.

Therefore, the detected areas are described as **potential vegetation loss** rather than confirmed deforestation.

Further validation using independent reference or ground-truth data would improve confidence in the results.

## Purpose

This project demonstrates a remote-sensing workflow for detecting vegetation change using freely available satellite imagery and cloud-based geospatial processing.

It is intended as a portfolio project demonstrating skills in:

* Remote sensing
* Satellite imagery analysis
* Google Earth Engine
* Python/JavaScript-based geospatial workflows
* NDVI analysis
* Raster analysis
* GIS data export
* Environmental monitoring
* Spatial data validation
