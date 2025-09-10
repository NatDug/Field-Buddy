import axios from 'axios';

// USDA QuickStats API configuration
const QUICKSTATS_BASE_URL = 'https://quickstats.nass.usda.gov/api/api_GET';
const QUICKSTATS_KEY = '628375F3-25E7-3C82-8C14-B9C8C1D39E7C';

export interface FarmLocation {
  latitude: number;
  longitude: number;
  state?: string;
  county?: string;
  zipCode?: string;
  address?: string;
}

export interface LandUseStrata {
  strataId: string;
  farmType: string;
  percentCultivated: number;
  percentNonAgricultural: number;
  percentWater: number;
  percentUrban: number;
  polygon: any; // GeoJSON polygon
}

export interface CropData {
  commodity: string;
  year: number;
  state: string;
  county: string;
  value: number;
  unit: string;
  source: string;
}

export interface FarmClassification {
  location: FarmLocation;
  landUseStrata?: LandUseStrata;
  cropData: CropData[];
  farmType: 'Cultivated' | 'Mixed' | 'Non-Agricultural' | 'Unknown';
  efficiencyScore?: number;
}

/**
 * Get current location using device GPS
 */
export async function getCurrentLocation(): Promise<FarmLocation> {
  const { Location } = await import('expo-location');
  
  // Request permissions
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  // Get current position
  const location = await Location.getCurrentPositionAsync({});
  
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

/**
 * Geocode address to coordinates
 */
export async function geocodeAddress(address: string): Promise<FarmLocation> {
  // Using a free geocoding service (you might want to use Google Maps API for production)
  const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
    params: {
      q: address,
      format: 'json',
      limit: 1,
    },
  });

  if (response.data.length === 0) {
    throw new Error('Address not found');
  }

  const result = response.data[0];
  return {
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    address: result.display_name,
  };
}

/**
 * Fetch crop production data from USDA QuickStats API
 */
export async function fetchCropData(
  state: string,
  county?: string,
  commodity?: string,
  year?: number
): Promise<CropData[]> {
  const params: any = {
    key: QUICKSTATS_KEY,
    format: 'JSON',
    source_desc: 'SURVEY',
    sector_desc: 'CROPS',
    group_desc: 'FIELD CROPS',
    state_alpha: state,
  };

  if (county) params.county_name = county;
  if (commodity) params.commodity_desc = commodity;
  if (year) params.year = year;

  try {
    const response = await axios.get(QUICKSTATS_BASE_URL, { params });
    
    return response.data.data.map((item: any) => ({
      commodity: item.commodity_desc,
      year: parseInt(item.year),
      state: item.state_alpha,
      county: item.county_name,
      value: parseFloat(item.value) || 0,
      unit: item.unit_desc,
      source: item.source_desc,
    }));
  } catch (error) {
    console.error('Error fetching crop data:', error);
    return [];
  }
}

/**
 * Match farm coordinates to USDA Land Use Strata
 * Note: This is a simplified implementation. In production, you'd need to:
 * 1. Download and parse USDA shapefiles
 * 2. Use a spatial database or library like Turf.js for point-in-polygon queries
 * 3. Cache the strata data locally
 */
export async function matchLandUseStrata(location: FarmLocation): Promise<LandUseStrata | null> {
  // This is a placeholder implementation
  // In production, you would:
  // 1. Load USDA Land Use Strata shapefiles
  // 2. Use spatial queries to find which polygon contains the farm coordinates
  // 3. Return the strata classification
  
  console.log('Matching land use strata for:', location);
  
  // Mock data for demonstration
  return {
    strataId: 'MOCK_STRATA_001',
    farmType: 'Cultivated',
    percentCultivated: 75,
    percentNonAgricultural: 20,
    percentWater: 3,
    percentUrban: 2,
    polygon: null, // Would contain actual GeoJSON polygon
  };
}

/**
 * Classify farm based on location and data
 */
export async function classifyFarm(location: FarmLocation): Promise<FarmClassification> {
  try {
    // Get land use strata
    const landUseStrata = await matchLandUseStrata(location);
    
    // Get crop data for the area
    const cropData = await fetchCropData(
      location.state || 'CA', // Default to California for demo
      location.county
    );
    
    // Determine farm type based on strata
    let farmType: FarmClassification['farmType'] = 'Unknown';
    if (landUseStrata) {
      if (landUseStrata.percentCultivated > 70) {
        farmType = 'Cultivated';
      } else if (landUseStrata.percentCultivated > 30) {
        farmType = 'Mixed';
      } else {
        farmType = 'Non-Agricultural';
      }
    }
    
    // Calculate efficiency score (simplified)
    const efficiencyScore = landUseStrata ? 
      (landUseStrata.percentCultivated / 100) * 100 : 0;
    
    return {
      location,
      landUseStrata,
      cropData,
      farmType,
      efficiencyScore,
    };
  } catch (error) {
    console.error('Error classifying farm:', error);
    throw error;
  }
}

/**
 * Get USDA API key (placeholder - in production, store securely)
 */
export function getUSDAApiKey(): string {
  // In production, this should be stored securely (e.g., in environment variables)
  // For now, return a placeholder
  return QUICKSTATS_KEY;
}

/**
 * Set USDA API key
 */
export function setUSDAApiKey(apiKey: string): void {
  // In production, store this securely
  console.log('Setting USDA API key:', apiKey);
}
