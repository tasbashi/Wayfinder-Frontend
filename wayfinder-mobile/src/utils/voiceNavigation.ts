import * as Speech from "expo-speech";

let isEnabled = false;
let currentUtterance: Speech.SpeechOptions | null = null;

export interface VoiceNavigationOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

/**
 * Initialize voice navigation
 */
export function initializeVoiceNavigation(enabled: boolean) {
  isEnabled = enabled;
}

/**
 * Speak text for navigation instructions
 */
export async function speakInstruction(
  text: string,
  options?: VoiceNavigationOptions
): Promise<void> {
  if (!isEnabled) {
    return;
  }

  // Stop any current speech
  stopSpeaking();

  const speechOptions: Speech.SpeechOptions = {
    language: "en-US",
    pitch: options?.pitch || 1.0,
    rate: options?.rate || 0.9,
    volume: options?.volume || 1.0,
    onDone: () => {
      currentUtterance = null;
    },
    onError: (error) => {
      console.error("Speech error:", error);
      currentUtterance = null;
    },
  };

  currentUtterance = speechOptions;
  Speech.speak(text, speechOptions);
}

/**
 * Stop current speech
 */
export function stopSpeaking() {
  if (currentUtterance) {
    Speech.stop();
    currentUtterance = null;
  }
}

/**
 * Check if voice navigation is enabled
 */
export function isVoiceNavigationEnabled(): boolean {
  return isEnabled;
}

