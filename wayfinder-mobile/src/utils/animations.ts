import { Animated } from "react-native";

/**
 * Fade in animation
 */
export function fadeIn(
  value: Animated.Value,
  duration = 300,
  delay = 0
): Animated.CompositeAnimation {
  return Animated.sequence([
    Animated.delay(delay),
    Animated.timing(value, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }),
  ]);
}

/**
 * Fade out animation
 */
export function fadeOut(
  value: Animated.Value,
  duration = 300
): Animated.CompositeAnimation {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });
}

/**
 * Slide in from bottom animation
 */
export function slideInFromBottom(
  value: Animated.Value,
  duration = 300,
  delay = 0
): Animated.CompositeAnimation {
  return Animated.sequence([
    Animated.delay(delay),
    Animated.spring(value, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }),
  ]);
}

/**
 * Slide in from right animation
 */
export function slideInFromRight(
  value: Animated.Value,
  duration = 300
): Animated.CompositeAnimation {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });
}

/**
 * Scale animation
 */
export function scaleIn(
  value: Animated.Value,
  duration = 300,
  delay = 0
): Animated.CompositeAnimation {
  return Animated.sequence([
    Animated.delay(delay),
    Animated.spring(value, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }),
  ]);
}

/**
 * Pulse animation (for loading states)
 */
export function pulse(
  value: Animated.Value,
  minOpacity = 0.3,
  maxOpacity = 1,
  duration = 1000
): Animated.CompositeAnimation {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: maxOpacity,
        duration: duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: minOpacity,
        duration: duration / 2,
        useNativeDriver: true,
      }),
    ])
  );
}

