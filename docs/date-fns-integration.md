# Date-fns Integration Guide

## Overview

This document outlines the comprehensive integration of `date-fns` into the App Name app, providing robust date and time handling with full internationalization support.

## 📦 Package Information

- **Package**: `date-fns@4.1.0`
- **Purpose**: Modern JavaScript date utility library
- **Features**: Modular, immutable, TypeScript-friendly date operations

## 🏗️ Architecture

### Core Files

1. **`utils/dateUtils.ts`** - Core date utilities and formatting functions
2. **`hooks/useDateFormatting.ts`** - React hook for localized date formatting
3. **`components/venue/TimeSlotCard.tsx`** - Time slot display component
4. **`components/venue/DatePicker.tsx`** - Interactive date picker component
5. **`components/examples/DateFnsExample.tsx`** - Comprehensive demo component

### Integration Points

- **Internationalization**: Integrated with app's language preferences (en, zh-HK, zh-CN)
- **Zustand Store**: Connected to user preferences for automatic localization
- **Venue System**: Enhanced time slot and availability handling
- **API Services**: Date validation and transformation utilities

## 🌍 Internationalization Support

### Supported Locales

```typescript
const DATE_LOCALES = {
  'en': enUS,        // English (US)
  'zh-HK': zhTW,     // Traditional Chinese (Hong Kong)
  'zh-CN': zhCN,     // Simplified Chinese
};
```

### Automatic Language Detection

The system automatically uses the user's language preference from the Zustand store:

```typescript
const language = useAppStore((state) => state.preferences.language);
const { formatDate, formatTime } = useDateFormatting();
```

## 🔧 Core Utilities

### Basic Date Formatting

```typescript
import { useDateFormatting } from '@/hooks/useDateFormatting';

const { formatDate, formatTime, formatDateTime } = useDateFormatting();

// Examples
formatDate(new Date())                    // "January 1, 2024"
formatTime(new Date())                    // "14:30"
formatDateTime(new Date())                // "January 1, 2024 at 2:30 PM"
```

### Relative Time Formatting

```typescript
const { formatRelative } = useDateFormatting();

formatRelative(yesterday)                 // "yesterday"
formatRelative(tomorrow)                  // "tomorrow"
formatRelative(lastWeek)                  // "last Tuesday"
```

### Venue-Specific Formatting

```typescript
const { 
  formatAvailability, 
  formatBookingSlot, 
  formatVenueLastUpdated 
} = useDateFormatting();

formatAvailability(new Date())            // "Today"
formatBookingSlot(date, "09:00", "10:00") // "09:00 - 10:00"
formatVenueLastUpdated(lastUpdate)        // "Updated 2 hours ago"
```

## 🎯 Venue Integration

### Time Slot Validation

```typescript
import { isTimeSlotPast, isTimeSlotBookable } from '@/utils/dateUtils';

const isPast = isTimeSlotPast("2024-01-01", "09:00");
const canBook = isTimeSlotBookable("2024-01-01", "09:00");
```

### Date Range Generation

```typescript
import { generateDateRange, getNextSevenDays } from '@/utils/dateUtils';

const weekDates = getNextSevenDays();           // Next 7 days
const customRange = generateDateRange(start, 14); // Custom 14-day range
```

### Booking Window Validation

```typescript
import { isWithinBookingWindow } from '@/utils/dateUtils';

const canBookDate = isWithinBookingWindow(selectedDate, 30); // 30-day window
```

## 🧩 Components

### TimeSlotCard

Interactive time slot display with automatic status detection:

```tsx
<TimeSlotCard
  timeSlot={timeSlot}
  date="2024-01-01"
  onPress={handleTimeSlotSelect}
  selected={isSelected}
/>
```

**Features:**
- Automatic past/future detection
- Localized time formatting
- Visual status indicators
- Booking availability status

### DatePicker

Horizontal scrollable date picker:

```tsx
<DatePicker
  selectedDate={selectedDate}
  onDateSelect={handleDateSelect}
  days={14}
/>
```

**Features:**
- Localized date labels
- Today/Tomorrow indicators
- Smooth scrolling to selection
- Customizable date range

## 🔄 Data Transformation

### Enhanced API Transformations

The integration includes enhanced data transformation functions with date validation:

```typescript
// Enhanced venue transformation with date validation
transformApiVenueToVenueWithDateValidation(apiVenue)

// Enhanced availability transformation with date validation
transformApiAvailabilityWithDateValidation(apiAvailability)

// Enhanced time slot transformation with time validation
transformApiTimeSlotWithTimeValidation(apiTimeSlot)
```

### Validation Features

- **Date Format Validation**: Ensures ISO date strings are valid
- **Time Format Validation**: Validates HH:mm time format
- **Graceful Error Handling**: Invalid data is filtered out with warnings
- **Type Safety**: Full TypeScript support with proper type guards

## 📱 Usage Examples

### Basic Date Display

```tsx
function VenueCard({ venue }) {
  const { formatVenueLastUpdated } = useDateFormatting();
  
  return (
    <View>
      <Text>{venue.name}</Text>
      <Text>{formatVenueLastUpdated(venue.lastChecked)}</Text>
    </View>
  );
}
```

### Time Slot Booking

```tsx
function BookingScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { formatAvailability, isTimeSlotBookable } = useDateFormatting();
  
  return (
    <View>
      <Text>Booking for {formatAvailability(selectedDate)}</Text>
      <DatePicker
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />
      {timeSlots.map(slot => (
        <TimeSlotCard
          key={slot.id}
          timeSlot={slot}
          date={selectedDate}
          disabled={!isTimeSlotBookable(selectedDate, slot.startTime)}
        />
      ))}
    </View>
  );
}
```

### Notification Scheduling

```tsx
function NotificationSettings() {
  const { formatReminderTime, calculateReminderTime } = useDateFormatting();
  
  const scheduleReminder = (bookingTime, reminderMinutes) => {
    const reminderTime = calculateReminderTime(bookingTime, reminderMinutes);
    // Schedule notification for reminderTime
  };
  
  return (
    <View>
      <Text>Remind me {formatReminderTime(30)} booking</Text>
    </View>
  );
}
```

## 🎨 Styling Integration

The components are fully integrated with your unistyles theme system:

```typescript
const styles = StyleSheet.create((theme) => ({
  selectedCard: {
    borderColor: theme.colors.tint,
    backgroundColor: theme.colors.tint + '10',
  },
  pastCard: {
    backgroundColor: theme.colors.tabIconDefault + '10',
  },
}));
```

## 🧪 Testing

### Demo Component

Visit the **Demo** tab to see the comprehensive `DateFnsExample` component showcasing:

- Basic date formatting in all supported languages
- Relative time formatting
- Interactive date picker
- Time slot selection
- Venue-specific formatting
- Real-time language switching

### Manual Testing

1. Change language in Settings to see localized formatting
2. Select different dates to test time slot validation
3. Test with past and future dates
4. Verify booking window restrictions

## 🚀 Performance Considerations

- **Tree Shaking**: Only imports used date-fns functions
- **Memoization**: Hook results are memoized based on language changes
- **Efficient Re-renders**: Components only re-render when necessary
- **Lazy Loading**: Date utilities are imported only when needed

## 🔮 Future Enhancements

- **Calendar View**: Full month calendar component
- **Time Zone Support**: Multi-timezone booking support
- **Recurring Bookings**: Support for recurring time slots
- **Advanced Filtering**: Date range filtering for venue search
- **Offline Support**: Cached date calculations for offline use

## 📚 Resources

- [date-fns Documentation](https://date-fns.org/)
- [date-fns Locale Support](https://date-fns.org/v2.29.3/docs/Locale)
- [React Native Internationalization](https://reactnative.dev/docs/localization)

## 🐛 Troubleshooting

### Common Issues

1. **Invalid Date Errors**: Check date string format (should be ISO 8601)
2. **Locale Not Loading**: Ensure locale is properly imported
3. **Time Zone Issues**: Use consistent UTC handling for API data
4. **Performance Issues**: Check for unnecessary re-renders in date formatting

### Debug Tips

- Enable development logging for date validation warnings
- Use the DateFnsExample component to test formatting
- Check browser/device locale settings
- Verify API date formats match expected patterns
