/**
 * DatePage Utils Tests
 * Tests for district area mapping and sorting functionality
 */

import {
  getDistrictAreaCode,
  transformSportVenueData,
} from '@/components/home/components/DatePage/utils';
import type { SportVenueTimeslot } from '@/types/sport';

// Mock data for testing
const mockSportVenueTimeslots: SportVenueTimeslot[] = [
  {
    district: 'Central and Western District',
    venue: 'Central Sports Centre',
    address: '123 Central Street',
    phoneNumber: '+852 1234 5678',
    longitude: '114.1747',
    latitude: '22.2783',
    facilityType: 'Badminton Court',
    facilityLocation: 'Court A',
    availableDate: '2024-01-01',
    sessionStartTime: '09:00',
    sessionEndTime: '10:00',
    availableCourts: '2',
    originalData: {
      District_Name_EN: 'Central and Western District',
      District_Name_TC: '中西區',
      Venue_Name_EN: 'Central Sports Centre',
      Venue_Name_TC: '中央體育館',
      Venue_Address_EN: '123 Central Street',
      Venue_Address_TC: '中央街123號',
      'Venue_Phone_No.': '+852 1234 5678',
      Venue_Longitude: '114.1747',
      Venue_Latitude: '22.2783',
      Facility_Type_Name_EN: 'Badminton Court',
      Facility_Type_Name_TC: '羽毛球場',
      Facility_Location_Name_EN: 'Court A',
      Facility_Location_Name_TC: '球場A',
      Available_Date: '2024-01-01',
      Session_Start_Time: '09:00',
      Session_End_Time: '10:00',
      Available_Courts: '2',
    },
  },
  {
    district: 'Kowloon City District',
    venue: 'Kowloon City Sports Centre',
    address: '456 Kowloon Street',
    phoneNumber: '+852 8765 4321',
    longitude: '114.1900',
    latitude: '22.3200',
    facilityType: 'Badminton Court',
    facilityLocation: 'Court B',
    availableDate: '2024-01-01',
    sessionStartTime: '10:00',
    sessionEndTime: '11:00',
    availableCourts: '3',
    originalData: {
      District_Name_EN: 'Kowloon City District',
      District_Name_TC: '九龍城區',
      Venue_Name_EN: 'Kowloon City Sports Centre',
      Venue_Name_TC: '九龍城體育館',
      Venue_Address_EN: '456 Kowloon Street',
      Venue_Address_TC: '九龍街456號',
      'Venue_Phone_No.': '+852 8765 4321',
      Venue_Longitude: '114.1900',
      Venue_Latitude: '22.3200',
      Facility_Type_Name_EN: 'Badminton Court',
      Facility_Type_Name_TC: '羽毛球場',
      Facility_Location_Name_EN: 'Court B',
      Facility_Location_Name_TC: '球場B',
      Available_Date: '2024-01-01',
      Session_Start_Time: '10:00',
      Session_End_Time: '11:00',
      Available_Courts: '3',
    },
  },
  {
    district: 'Sha Tin District',
    venue: 'Sha Tin Sports Centre',
    address: '789 Sha Tin Road',
    phoneNumber: '+852 5555 6666',
    longitude: '114.1800',
    latitude: '22.3800',
    facilityType: 'Badminton Court',
    facilityLocation: 'Court C',
    availableDate: '2024-01-01',
    sessionStartTime: '11:00',
    sessionEndTime: '12:00',
    availableCourts: '1',
    originalData: {
      District_Name_EN: 'Sha Tin District',
      District_Name_TC: '沙田區',
      Venue_Name_EN: 'Sha Tin Sports Centre',
      Venue_Name_TC: '沙田體育館',
      Venue_Address_EN: '789 Sha Tin Road',
      Venue_Address_TC: '沙田路789號',
      'Venue_Phone_No.': '+852 5555 6666',
      Venue_Longitude: '114.1800',
      Venue_Latitude: '22.3800',
      Facility_Type_Name_EN: 'Badminton Court',
      Facility_Type_Name_TC: '羽毛球場',
      Facility_Location_Name_EN: 'Court C',
      Facility_Location_Name_TC: '球場C',
      Available_Date: '2024-01-01',
      Session_Start_Time: '11:00',
      Session_End_Time: '12:00',
      Available_Courts: '1',
    },
  },
];

describe('DatePage Utils', () => {
  describe('getDistrictAreaCode', () => {
    it('should return correct area code for known district', () => {
      const result = getDistrictAreaCode('Central and Western');
      expect(result).toBe('HKI');
    });

    it('should return null for unknown district', () => {
      const result = getDistrictAreaCode('Unknown District');
      expect(result).toBeNull();
    });
  });

  describe('transformSportVenueData', () => {
    it('should sort districts by area code', () => {
      const result = transformSportVenueData(mockSportVenueTimeslots);

      // Extract district names from section headers
      const sectionHeaders = result.flashListData.filter((item) => item.type === 'sectionHeader');
      const districtNames = sectionHeaders.map((header) => (header as any).districtName);

      // Should be sorted by area code: HKI, KLN, NT
      expect(districtNames).toEqual([
        'Central and Western District', // HKI
        'Kowloon City District', // KLN
        'Sha Tin District', // NT
      ]);
    });

    it('should include all venues with available time slots', () => {
      const result = transformSportVenueData(mockSportVenueTimeslots);

      // Should have 3 section headers and 3 venues
      const sectionHeaders = result.flashListData.filter((item) => item.type === 'sectionHeader');
      const venues = result.flashListData.filter((item) => item.type === 'venue');

      expect(sectionHeaders).toHaveLength(3);
      expect(venues).toHaveLength(3);
      expect(result.totalVenues).toBe(3);
      expect(result.totalDistricts).toBe(3);
    });

    it('should return empty data for empty input', () => {
      const result = transformSportVenueData([]);

      expect(result.flashListData).toEqual([]);
      expect(result.stickyHeaderIndices).toEqual([]);
      expect(result.totalVenues).toBe(0);
      expect(result.totalDistricts).toBe(0);
    });
  });
});
