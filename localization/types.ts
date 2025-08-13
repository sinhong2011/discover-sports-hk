// Localization types for the LCSD Facilities Checker app

export type SupportedLocale = 'en' | 'zh-HK' | 'zh-CN';

export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

export interface TranslationKeys {
  // Common
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    search: string;
    filter: string;
    clear: string;
    back: string;
    next: string;
    done: string;
    close: string;
    ok: string;
    more: string;
    checking: string;
  };
  
  // Navigation
  navigation: {
    home: string;
    search: string;
    bookmarks: string;
    settings: string;
    history: string;
  };
  
  // Home screen
  home: {
    title: string;
    subtitle: string;
    quickSearch: string;
    recentSearches: string;
    popularVenues: string;
    noRecentSearches: string;
    selectSport: string;
    totalVenues: string;
    bookmarked: string;
    sportTypes: string;
    noVenues: string;
    noVenuesForSport: string;
    noVenuesGeneral: string;
  };
  
  // Search
  search: {
    title: string;
    placeholder: string;
    filters: string;
    results: string;
    noResults: string;
    district: string;
    venueType: string;
    facility: string;
    date: string;
    timeRange: string;
    applyFilters: string;
    clearFilters: string;
  };
  
  // Venues
  venues: {
    details: string;
    facilities: string;
    address: string;
    availability: string;
    bookmark: string;
    removeBookmark: string;
    checkAvailability: string;
    noFacilities: string;
    lastUpdated: string;
  };
  
  // Bookmarks
  bookmarks: {
    title: string;
    empty: string;
    emptyDescription: string;
    removeConfirm: string;
  };
  
  // Settings
  settings: {
    title: string;
    language: string;
    theme: string;
    notifications: string;
    about: string;
    privacy: string;
    terms: string;
    version: string;
    themeLight: string;
    themeDark: string;
    themeAuto: string;
    notificationsEnabled: string;
    reminderTime: string;
    availabilityAlerts: string;
  };
  
  // Errors
  errors: {
    networkError: string;
    serverError: string;
    notFound: string;
    unauthorized: string;
    timeout: string;
    unknown: string;
    noInternet: string;
    title: string;
    refreshFailed: string;
    generic: string;
    // Sports API specific errors
    sportsListFailed: string;
    sportDataFailed: string;
    venueSearchFailed: string;
    apiConnectionLost: string;
  };

  status: {
    connected: string;
    offline: string;
    connecting: string;
    healthy: string;
    unhealthy: string;
  };
  
  // Time and dates
  time: {
    morning: string;
    afternoon: string;
    evening: string;
    today: string;
    tomorrow: string;
    yesterday: string;
    thisWeek: string;
    nextWeek: string;
    minutes: string;
    hours: string;
    days: string;
  };
}
