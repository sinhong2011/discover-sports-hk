import { z } from "zod"

export const DistrictHK = [
  {
    areaCode: "HKI",
    code: "CW",
    district: { "zh-HK": "中西區", "en-HK": "Central and Western District" },
  },
  {
    areaCode: "HKI",
    code: "E",
    district: { "zh-HK": "東區", "en-HK": "Eastern District" },
  },
  {
    areaCode: "HKI",
    code: "S",
    district: { "zh-HK": "南區", "en-HK": "Southern District" },
  },
  {
    areaCode: "HKI",
    code: "WC",
    district: { "zh-HK": "灣仔區", "en-HK": "Wan Chai District" },
  },
  {
    areaCode: "K",
    code: "SSP",
    district: { "zh-HK": "深水埗區", "en-HK": "Sham Shui Po District" },
  },
  {
    areaCode: "K",
    code: "KC",
    district: { "zh-HK": "九龍城區", "en-HK": "Kowloon City District" },
  },
  {
    areaCode: "K",
    code: "KT",
    district: { "zh-HK": "觀塘區", "en-HK": "Kwun Tong District" },
  },
  {
    areaCode: "K",
    code: "WTS",
    district: { "zh-HK": "黃大仙區", "en-HK": "Wong Tai Sin District" },
  },
  {
    areaCode: "K",
    code: "YTM",
    district: { "zh-HK": "油尖旺區", "en-HK": "Yau Tsim Mong District" },
  },
  {
    areaCode: "NT",
    code: "I",
    district: { "zh-HK": "離島區", "en-HK": "Islands District" },
  },
  {
    areaCode: "NT",
    code: "KTG",
    district: { "zh-HK": "葵青區", "en-HK": "Kwai Tsing District" },
  },
  {
    areaCode: "NT",
    code: "N",
    district: { "zh-HK": "北區", "en-HK": "North District" },
  },
  {
    areaCode: "NT",
    code: "SK",
    district: { "zh-HK": "西貢區", "en-HK": "Sai Kung District" },
  },
  {
    areaCode: "NT",
    code: "ST",
    district: { "zh-HK": "沙田區", "en-HK": "Sha Tin District" },
  },
  {
    areaCode: "NT",
    code: "TP",
    district: { "zh-HK": "大埔區", "en-HK": "Tai Po District" },
  },
  {
    areaCode: "NT",
    code: "TW",
    district: { "zh-HK": "荃灣區", "en-HK": "Tsuen Wan District" },
  },
  {
    areaCode: "NT",
    code: "TM",
    district: { "zh-HK": "屯門區", "en-HK": "Tuen Mun District" },
  },
  {
    areaCode: "NT",
    code: "YL",
    district: { "zh-HK": "元朗區", "en-HK": "Yuen Long District" },
  },
] as const

export const districtEnumEn = DistrictHK.map((item) => item.district["en-HK"])

export const districtEnumTC = DistrictHK.map((item) => item.district["zh-HK"])

export const DISTRICT_ENUM = [
  "中西區",
  "Central and Western District",
  "東區",
  "Eastern District",
  "南區",
  "Southern District",
  "灣仔區",
  "Wan Chai District",
  "深水埗區",
  "Sham Shui Po District",
  "九龍城區",
  "Kowloon City District",
  "觀塘區",
  "Kwun Tong District",
  "黃大仙區",
  "Wong Tai Sin District",
  "油尖旺區",
  "Yau Tsim Mong District",
  "離島區",
  "Islands District",
  "葵青區",
  "Kwai Tsing District",
  "北區",
  "North District",
  "西貢區",
  "Sai Kung District",
  "沙田區",
  "Sha Tin District",
  "大埔區",
  "Tai Po District",
  "荃灣區",
  "Tsuen Wan District",
  "屯門區",
  "Tuen Mun District",
  "元朗區",
  "Yuen Long District",
] as const

export const DistrictEnum = z.enum(DISTRICT_ENUM)
