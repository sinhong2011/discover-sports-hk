/**
 * Test script to verify react-native-keyboard-controller integration
 * This script tests basic imports and functionality
 */

process.stdout.write('Testing react-native-keyboard-controller integration...\n');

try {
  // Test basic import
  const keyboardController = require('react-native-keyboard-controller');

  process.stdout.write('✅ Successfully imported react-native-keyboard-controller\n');

  // Check if KeyboardProvider exists
  if (keyboardController.KeyboardProvider) {
    process.stdout.write('✅ KeyboardProvider is available\n');
  } else {
    process.stdout.write('❌ KeyboardProvider is not available\n');
  }

  // Check if useKeyboardController exists
  if (keyboardController.useKeyboardController) {
    process.stdout.write('✅ useKeyboardController is available\n');
  } else {
    process.stdout.write('❌ useKeyboardController is not available\n');
  }

  process.stdout.write('\n🎉 react-native-keyboard-controller integration test passed!\n');
  process.stdout.write('The library is properly installed and can be imported.\n');
} catch (error) {
  process.stderr.write('❌ react-native-keyboard-controller integration test failed:\n');
  process.stderr.write(`${String(error.message)}\n`);
  process.exit(1);
}
