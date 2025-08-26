/**
 * Example usage of BaseTextInput with debounce functionality
 * This demonstrates how to use the new debounceMs prop
 */

import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { BaseTextInput } from '@/components/ui/BaseTextInput';
import { SearchBar } from '@/components/ui/SearchBar';

export function BaseTextInputDebounceExample() {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [immediateValue, setImmediateValue] = useState('');

  return (
    <View style={{ padding: 20, gap: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>BaseTextInput Debounce Examples</Text>

      {/* Example 1: Search input with 300ms debounce */}
      <View>
        <Text style={{ marginBottom: 8 }}>Search with 300ms debounce:</Text>
        <BaseTextInput
          placeholder="Type to search..."
          value={searchValue}
          onChangeText={setSearchValue}
          debounceMs={300}
          variant="outlined"
        />
        <Text style={{ marginTop: 4, color: '#666' }}>Current value: {searchValue}</Text>
      </View>

      {/* Example 2: Debounced vs immediate comparison */}
      <View>
        <Text style={{ marginBottom: 8 }}>Debounced (500ms) vs Immediate:</Text>

        <BaseTextInput
          placeholder="Debounced input (500ms)"
          onChangeText={setDebouncedValue}
          debounceMs={500}
          variant="filled"
          style={{ marginBottom: 10 }}
        />
        <Text style={{ color: '#666' }}>Debounced: {debouncedValue}</Text>

        <BaseTextInput
          placeholder="Immediate input"
          onChangeText={setImmediateValue}
          variant="filled"
          style={{ marginTop: 10 }}
        />
        <Text style={{ color: '#666' }}>Immediate: {immediateValue}</Text>
      </View>

      {/* Example 3: SearchBar component (inherits debounce from BaseTextInput) */}
      <View>
        <Text style={{ marginBottom: 8 }}>SearchBar with debounce:</Text>
        <SearchBar
          value={searchValue}
          onChangeText={setSearchValue}
          debounceMs={400} // This will now work!
          placeholder="Search venues..."
        />
      </View>
    </View>
  );
}

/**
 * Usage recommendations:
 *
 * 1. For search inputs: 300-500ms
 *    - Good balance between responsiveness and performance
 *    - Reduces API calls or expensive filtering operations
 *
 * 2. For form validation: 500-1000ms
 *    - Allows users to finish typing before validation
 *    - Reduces unnecessary validation calls
 *
 * 3. For auto-save: 1000-2000ms
 *    - Prevents too frequent save operations
 *    - Good user experience for draft saving
 *
 * 4. No debounce (undefined): 0ms
 *    - For inputs that need immediate response
 *    - Simple form fields, counters, etc.
 */
