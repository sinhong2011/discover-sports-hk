import type { TimeSlot } from "@/types/time"

export interface LastUpdateInfo {
  code: string
  message: string
  data: Data
  timestamp: number
}

export interface Data {
  modelCode: string
  contCode: string
  contName: string
  locale: string
  fields: Fields
  publishTime: string
}

export interface Fields {
  fileId: string
  fileName: string
  description: string
}

export interface LcsdVenueTimeslotTimeslotOrigin {
  District_Name_EN: string
  District_Name_TC: string
  Venue_Name_EN: string
  Venue_Name_TC: string
  Venue_Address_EN: string
  Venue_Address_TC: string
  ["Venue_Phone_No."]: string
  Venue_Longitude: string
  Venue_Latitude: string
  Facility_Type_Name_EN: string
  Facility_Type_Name_TC: string
  Facility_Location_Name_EN: string
  Facility_Location_Name_TC: string
  Available_Date: string
  Session_Start_Time: string
  Session_End_Time: string
  Available_Courts: string
}

export interface LcsdVenueTimeslot {
  district: string
  venue: string
  address: string
  phoneNumber: string
  longitude: string
  latitude: string
  facilityType: string
  facilityLocation: string
  availableDate: string
  sessionStartTime: string
  sessionEndTime: string
  availableCourts: string
}

export type LcsdVenueTimeslotTableDataItemByHour = Pick<
  LcsdVenueTimeslot,
  "availableCourts" | "sessionStartTime" | "sessionEndTime"
>

export type LcsdVenueTimeslotTableDataItem = {
  district: string
  venue: string
  latitude: LcsdVenueTimeslot["latitude"]
  longitude: LcsdVenueTimeslot["longitude"]
  address?: string
  facilityType?: string
  facilityLocation?: string
  phoneNumber: LcsdVenueTimeslot["phoneNumber"]
  availableDate: LcsdVenueTimeslot["availableDate"]
  totalAvailableCourts: number
  actions?: never
} & {
  [key in TimeSlot]?: LcsdVenueTimeslotTableDataItemByHour
}

export type LcsdSportType =
  | "badminton"
  | "basketball"
  | "volleyball"
  | "turfSoccerPitch"
  | "tennis"
