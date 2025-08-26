import { z } from 'zod';

export const DistrictHK = [
  {
    areaCode: 'HKI',
    code: 'CW',
    district: { 'zh-HK': '中西區', en: 'Central and Western' },
  },
  {
    areaCode: 'HKI',
    code: 'E',
    district: { 'zh-HK': '東區', en: 'Eastern' },
  },
  {
    areaCode: 'HKI',
    code: 'S',
    district: { 'zh-HK': '南區', en: 'Southern' },
  },
  {
    areaCode: 'HKI',
    code: 'WC',
    district: { 'zh-HK': '灣仔區', en: 'Wan Chai' },
  },
  {
    areaCode: 'KLN',
    code: 'SSP',
    district: { 'zh-HK': '深水埗區', en: 'Sham Shui Po' },
  },
  {
    areaCode: 'KLN',
    code: 'KC',
    district: { 'zh-HK': '九龍城區', en: 'Kowloon City' },
  },
  {
    areaCode: 'KLN',
    code: 'KT',
    district: { 'zh-HK': '觀塘區', en: 'Kwun Tong' },
  },
  {
    areaCode: 'KLN',
    code: 'WTS',
    district: { 'zh-HK': '黃大仙區', en: 'Wong Tai Sin' },
  },
  {
    areaCode: 'KLN',
    code: 'YTM',
    district: { 'zh-HK': '油尖旺區', en: 'Yau Tsim Mong' },
  },
  {
    areaCode: 'NT',
    code: 'I',
    district: { 'zh-HK': '離島區', en: 'Islands' },
  },
  {
    areaCode: 'NT',
    code: 'KTG',
    district: { 'zh-HK': '葵青區', en: 'Kwai Tsing' },
  },
  {
    areaCode: 'NT',
    code: 'N',
    district: { 'zh-HK': '北區', en: 'North' },
  },
  {
    areaCode: 'NT',
    code: 'SK',
    district: { 'zh-HK': '西貢區', en: 'Sai Kung' },
  },
  {
    areaCode: 'NT',
    code: 'ST',
    district: { 'zh-HK': '沙田區', en: 'Sha Tin' },
  },
  {
    areaCode: 'NT',
    code: 'TP',
    district: { 'zh-HK': '大埔區', en: 'Tai Po' },
  },
  {
    areaCode: 'NT',
    code: 'TW',
    district: { 'zh-HK': '荃灣區', en: 'Tsuen Wan' },
  },
  {
    areaCode: 'NT',
    code: 'TM',
    district: { 'zh-HK': '屯門區', en: 'Tuen Mun' },
  },
  {
    areaCode: 'NT',
    code: 'YL',
    district: { 'zh-HK': '元朗區', en: 'Yuen Long' },
  },
] as const;

export const districtEnumEn = DistrictHK.map((item) => item.district.en);

export const districtEnumTC = DistrictHK.map((item) => item.district['zh-HK']);

export const DISTRICT_ENUM = [
  '中西區',
  'Central and Western',
  '東區',
  'Eastern',
  '南區',
  'Southern',
  '灣仔區',
  'Wan Chai',
  '深水埗區',
  'Sham Shui Po',
  '九龍城區',
  'Kowloon City',
  '觀塘區',
  'Kwun Tong',
  '黃大仙區',
  'Wong Tai Sin',
  '油尖旺區',
  'Yau Tsim Mong',
  '離島區',
  'Islands',
  '葵青區',
  'Kwai Tsing',
  '北區',
  'North',
  '西貢區',
  'Sai Kung',
  '沙田區',
  'Sha Tin',
  '大埔區',
  'Tai Po',
  '荃灣區',
  'Tsuen Wan',
  '屯門區',
  'Tuen Mun',
  '元朗區',
  'Yuen Long',
] as const;

export const DistrictEnum = z.enum(DISTRICT_ENUM);

export const DistrictAreaEnum = z.enum(['HKI', 'KLN', 'NT']);
