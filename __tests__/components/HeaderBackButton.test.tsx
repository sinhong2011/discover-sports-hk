/**
 * HeaderBackButton Component Tests
 * Tests for the custom header back button component
 */

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

// Note: StyleSheet is mocked globally in jest.setup.early.js; avoid per-test overrides that can break RN exports

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock AppIcon component
jest.mock('@/components/ui/Icon', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    AppIcon: ({
      name,
      size,
      color,
      style,
    }: {
      name: string;
      size: number;
      color: string;
      style?: unknown;
    }) => {
      return React.createElement(Text, {
        testID: `app-icon-${name}`,
        style: style || {},
        children: `${name}-${size}-${color}`,
      });
    },
  };
});

// Import after mocks so they take effect
import { HeaderBackButton } from '@/components/ui/HeaderBackButton';

describe('HeaderBackButton', () => {
  const mockRouter = {
    back: jest.fn(),
    canGoBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockRouter.canGoBack.mockReturnValue(true);
  });

  it('should render correctly with default props', () => {
    const { getByTestId } = render(<HeaderBackButton />);

    const button = getByTestId('header-back-button');
    expect(button).toBeTruthy();

    const icon = getByTestId('app-icon-back');
    expect(icon).toBeTruthy();
  });

  it('should call router.back() when pressed', () => {
    const { getByTestId } = render(<HeaderBackButton />);

    const button = getByTestId('header-back-button');
    fireEvent.press(button);

    expect(mockRouter.canGoBack).toHaveBeenCalled();
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('should call custom onPress when provided', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<HeaderBackButton onPress={mockOnPress} />);

    const button = getByTestId('header-back-button');
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalled();
    expect(mockRouter.back).not.toHaveBeenCalled();
  });

  it('should not call router.back() when canGoBack returns false', () => {
    mockRouter.canGoBack.mockReturnValue(false);
    const { getByTestId } = render(<HeaderBackButton />);

    const button = getByTestId('header-back-button');
    fireEvent.press(button);

    expect(mockRouter.canGoBack).toHaveBeenCalled();
    expect(mockRouter.back).not.toHaveBeenCalled();
  });

  it('should not respond to press when disabled', () => {
    const { getByTestId } = render(<HeaderBackButton disabled />);

    const button = getByTestId('header-back-button');
    fireEvent.press(button);

    expect(mockRouter.back).not.toHaveBeenCalled();
  });

  it('should render with custom accessibility label', () => {
    const customLabel = 'Custom back button';
    const { getByTestId } = render(<HeaderBackButton accessibilityLabel={customLabel} />);

    const button = getByTestId('header-back-button');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityLabel).toBe(customLabel);
  });

  it('should render with custom icon size and color', () => {
    const { getByTestId } = render(<HeaderBackButton size={32} color="#FF0000" />);

    const icon = getByTestId('app-icon-back');
    expect(icon.props.children).toContain('32');
    expect(icon.props.children).toContain('#FF0000');
  });
});
