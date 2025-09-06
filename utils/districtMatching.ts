/**
 * Robust District Matching Utilities
 * Provides fuzzy matching for district names to handle API variations
 */

import { DistrictHK } from '@/constants/Geo';

// ============================================================================
// Types
// ============================================================================

type DistrictInfo = (typeof DistrictHK)[number];

// ============================================================================
// String Normalization Utilities
// ============================================================================

/**
 * Normalize a string for comparison by removing common variations
 */
function normalizeDistrictName(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      // Remove common suffixes that might vary
      .replace(/\s+(district|area|region)$/i, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters that might cause issues
      .replace(/[^\w\s]/g, '')
  );
}

/**
 * Extract key words from a district name for matching
 */
function extractKeyWords(name: string): string[] {
  const normalized = normalizeDistrictName(name);
  return normalized.split(' ').filter((word) => word.length > 2); // Filter out short words
}

/**
 * Calculate similarity score between two strings using multiple methods
 */
function calculateSimilarityScore(str1: string, str2: string): number {
  const norm1 = normalizeDistrictName(str1);
  const norm2 = normalizeDistrictName(str2);

  // Exact match after normalization
  if (norm1 === norm2) {
    return 1.0;
  }

  // Substring matching (bidirectional)
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return 0.9;
  }

  // Key word matching
  const words1 = extractKeyWords(str1);
  const words2 = extractKeyWords(str2);

  if (words1.length === 0 || words2.length === 0) {
    return 0;
  }

  // Count matching words
  const matchingWords = words1.filter((word1) =>
    words2.some((word2) => word1.includes(word2) || word2.includes(word1))
  );

  const wordMatchScore = matchingWords.length / Math.max(words1.length, words2.length);

  // Boost score if all key words match
  if (wordMatchScore === 1.0) {
    return 0.8;
  }

  // Partial word matching
  if (wordMatchScore > 0.5) {
    return 0.6 + (wordMatchScore - 0.5) * 0.4; // Scale between 0.6-0.8
  }

  return wordMatchScore * 0.5; // Lower score for partial matches
}

// ============================================================================
// Main Matching Functions
// ============================================================================

/**
 * Find district by fuzzy matching with confidence scoring
 */
export function findDistrictByFuzzyMatch(
  apiDistrictName: string,
  minConfidence = 0.6
): DistrictInfo | undefined {
  if (!apiDistrictName || apiDistrictName.trim() === '') {
    return undefined;
  }

  let bestMatch: DistrictInfo | undefined;
  let bestScore = 0;

  // Try matching against both English and Chinese names
  for (const district of DistrictHK) {
    // Check English name
    const enScore = calculateSimilarityScore(apiDistrictName, district.district.en);
    if (enScore > bestScore && enScore >= minConfidence) {
      bestScore = enScore;
      bestMatch = district;
    }

    // Check Chinese name (in case API returns mixed languages)
    const zhScore = calculateSimilarityScore(apiDistrictName, district.district['zh-HK']);
    if (zhScore > bestScore && zhScore >= minConfidence) {
      bestScore = zhScore;
      bestMatch = district;
    }
  }

  // Debug logging for development
  // if (__DEV__) {
  //   if (bestMatch) {
  //     console.log(`✅ District fuzzy match found:`, {
  //       input: apiDistrictName,
  //       matched: bestMatch.district.en,
  //       code: bestMatch.code,
  //       areaCode: bestMatch.areaCode,
  //       confidence: bestScore.toFixed(2),
  //     });
  //   } else {
  //     console.warn(`❌ No district fuzzy match found for: "${apiDistrictName}"`, {
  //       minConfidence,
  //       availableDistricts: DistrictHK.map((d) => d.district.en),
  //     });
  //   }
  // }

  return bestMatch;
}

/**
 * Get area code using fuzzy matching
 */
export function getAreaCodeByFuzzyMatch(
  apiDistrictName: string,
  minConfidence = 0.6
): string | null {
  const district = findDistrictByFuzzyMatch(apiDistrictName, minConfidence);
  return district?.areaCode || null;
}

/**
 * Get district code using fuzzy matching
 */
export function getDistrictCodeByFuzzyMatch(
  apiDistrictName: string,
  minConfidence = 0.6
): string | null {
  const district = findDistrictByFuzzyMatch(apiDistrictName, minConfidence);
  return district?.code || null;
}

// ============================================================================
// Validation and Testing Utilities
// ============================================================================

/**
 * Test the matching algorithm with common variations
 */
export function testDistrictMatching(): void {
  if (!__DEV__) return;

  const testCases = [
    'Wong Tai Sin',
    'Wong Tai Sin District',
    'Central and Western',
    'Central and Western District',
    'Sham Shui Po',
    'Sham Shui Po District',
    'Kwun Tong',
    'Kwun Tong Area',
    'Yau Tsim Mong',
    'Yau Tsim Mong Region',
    '黃大仙區',
    '中西區',
  ];

  console.log('🧪 Testing district matching algorithm:');
  testCases.forEach((testCase) => {
    const result = findDistrictByFuzzyMatch(testCase);
    console.log(
      `  "${testCase}" → ${result ? `${result.district.en} (${result.code})` : 'No match'}`
    );
  });
}
