/**
 * Test file for map navigation functionality
 * Tests the react-native-map-link integration logic
 */

import { showLocation } from 'react-native-map-link';

// Mock react-native-map-link
jest.mock('react-native-map-link', () => ({
  showLocation: jest.fn(),
}));

// Mock Alert for React Native
const mockAlert = {
  alert: jest.fn(),
};

// Test data
interface MockVenue {
  name: string;
  address: string;
  coordinates?: {
    latitude: string;
    longitude: string;
  };
}

// Mock map navigation function (extracted from component logic with address fallback)
async function handleMapNavigation(venue: MockVenue | null, t: (key: string) => string) {
  if (!venue) {
    mockAlert.alert(
      t('Location Not Available'),
      t('Location information is not available for this venue.')
    );
    return;
  }

  try {
    // Check if we have valid coordinates
    const hasValidCoordinates =
      venue.coordinates?.latitude &&
      venue.coordinates?.longitude &&
      venue.coordinates.latitude.trim() !== '' &&
      venue.coordinates.longitude.trim() !== '';

    if (hasValidCoordinates) {
      // Use coordinates for precise location
      const { latitude, longitude } = venue.coordinates;
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      // Validate coordinates
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        await showLocation({
          latitude: lat,
          longitude: lng,
          title: venue.name,
          address: venue.address,
        });
        return;
      }
    }

    // Fallback to address-based navigation
    if (venue.address && venue.address.trim() !== '') {
      await showLocation({
        title: venue.name,
        address: venue.address,
      });
      return;
    }

    // No coordinates and no address available
    mockAlert.alert(
      t('Location Not Available'),
      t('Location information is not available for this venue.')
    );
  } catch (error) {
    mockAlert.alert(
      t('Map Navigation Error'),
      t('Unable to open map application. Please check if you have a map app installed.')
    );
  }
}

describe('Map Navigation Functionality', () => {
  const mockVenue: MockVenue = {
    name: 'Test Sports Center',
    address: '123 Test Street, Hong Kong',
    coordinates: {
      latitude: '22.2783',
      longitude: '114.1747',
    },
  };

  const mockT = (key: string) => key;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Valid Coordinates', () => {
    it('should call showLocation with correct parameters for valid coordinates', async () => {
      await handleMapNavigation(mockVenue, mockT);

      expect(showLocation).toHaveBeenCalledWith({
        latitude: 22.2783,
        longitude: 114.1747,
        title: 'Test Sports Center',
        address: '123 Test Street, Hong Kong',
      });
    });

    it('should handle edge case coordinates (0,0)', async () => {
      const edgeCaseVenue: MockVenue = {
        name: 'Edge Case Venue',
        address: 'Edge Case Address',
        coordinates: {
          latitude: '0',
          longitude: '0',
        },
      };

      await handleMapNavigation(edgeCaseVenue, mockT);

      expect(showLocation).toHaveBeenCalledWith({
        latitude: 0,
        longitude: 0,
        title: 'Edge Case Venue',
        address: 'Edge Case Address',
      });
    });

    it('should handle negative coordinates', async () => {
      const negativeCoordVenue: MockVenue = {
        name: 'Negative Coord Venue',
        address: 'Negative Coord Address',
        coordinates: {
          latitude: '-22.2783',
          longitude: '-114.1747',
        },
      };

      await handleMapNavigation(negativeCoordVenue, mockT);

      expect(showLocation).toHaveBeenCalledWith({
        latitude: -22.2783,
        longitude: -114.1747,
        title: 'Negative Coord Venue',
        address: 'Negative Coord Address',
      });
    });
  });

  describe('Address Fallback', () => {
    it('should use address when coordinates are missing', async () => {
      const venueWithoutCoordinates: MockVenue = {
        name: 'Test Sports Center',
        address: '123 Test Street, Hong Kong',
        // coordinates: undefined
      };

      await handleMapNavigation(venueWithoutCoordinates, mockT);

      expect(showLocation).toHaveBeenCalledWith({
        title: 'Test Sports Center',
        address: '123 Test Street, Hong Kong',
      });
    });

    it('should use address when coordinates are empty strings', async () => {
      const venueWithEmptyCoordinates: MockVenue = {
        name: 'Test Sports Center',
        address: '123 Test Street, Hong Kong',
        coordinates: {
          latitude: '',
          longitude: '',
        },
      };

      await handleMapNavigation(venueWithEmptyCoordinates, mockT);

      expect(showLocation).toHaveBeenCalledWith({
        title: 'Test Sports Center',
        address: '123 Test Street, Hong Kong',
      });
    });

    it('should use address when coordinates are invalid', async () => {
      const venueWithInvalidCoordinates: MockVenue = {
        name: 'Test Sports Center',
        address: '123 Test Street, Hong Kong',
        coordinates: {
          latitude: 'invalid',
          longitude: 'invalid',
        },
      };

      await handleMapNavigation(venueWithInvalidCoordinates, mockT);

      expect(showLocation).toHaveBeenCalledWith({
        title: 'Test Sports Center',
        address: '123 Test Street, Hong Kong',
      });
    });
  });

  describe('Error Handling', () => {
    it('should show alert when venue has no coordinates and no address', async () => {
      const venueWithoutLocationData: MockVenue = {
        name: 'Test Sports Center',
        address: '',
        // coordinates: undefined
      };

      await handleMapNavigation(venueWithoutLocationData, mockT);

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Location Not Available',
        'Location information is not available for this venue.'
      );
    });

    it('should show alert when venue is null', async () => {
      await handleMapNavigation(null, mockT);

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Location Not Available',
        'Location information is not available for this venue.'
      );
    });

    it('should handle showLocation errors gracefully', async () => {
      (showLocation as jest.Mock).mockRejectedValueOnce(new Error('Map app not available'));

      await handleMapNavigation(mockVenue, mockT);

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Map Navigation Error',
        'Unable to open map application. Please check if you have a map app installed.'
      );
    });

    it('should handle null venue gracefully', async () => {
      await handleMapNavigation(null, mockT);

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Location Not Available',
        'Location information is not available for this venue.'
      );
    });
  });

  describe('Coordinate Validation', () => {
    it('should reject empty string coordinates', async () => {
      const emptyCoordVenue: MockVenue = {
        name: 'Empty Coord Venue',
        address: 'Empty Coord Address',
        coordinates: {
          latitude: '',
          longitude: '',
        },
      };

      await handleMapNavigation(emptyCoordVenue, mockT);

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Location Not Available',
        'Location information is not available for this venue.'
      );
    });

    it('should reject partially invalid coordinates', async () => {
      const partiallyInvalidVenue: MockVenue = {
        name: 'Partially Invalid Venue',
        address: 'Partially Invalid Address',
        coordinates: {
          latitude: '22.2783',
          longitude: 'invalid',
        },
      };

      await handleMapNavigation(partiallyInvalidVenue, mockT);

      expect(mockAlert.alert).toHaveBeenCalledWith(
        'Location Not Available',
        'Location information is not available for this venue.'
      );
    });
  });
});
