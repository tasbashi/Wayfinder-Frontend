import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PathResult, RouteNodeDto } from "@/types/route.types";
import { ChevronLeft, ChevronRight, X, Navigation as NavIcon } from "lucide-react-native";
import { FloorPlanView } from "@/components/FloorPlanView";
import { fadeIn, slideInFromBottom, fadeOut } from "@/utils/animations";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { speakInstruction, stopSpeaking } from "@/utils/voiceNavigation";

export default function NavigationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [routeResult, setRouteResult] = useState<PathResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Animation values
  const instructionOpacity = useRef(new Animated.Value(0)).current;
  const instructionTranslateY = useRef(new Animated.Value(50)).current;
  const controlsOpacity = useRef(new Animated.Value(0)).current;

  // Accessibility
  const { settings, fontSizeMultiplier } = useAccessibility();

  useEffect(() => {
    try {
      const routeData = params.routeData as string;
      if (routeData) {
        const parsed = JSON.parse(routeData) as PathResult;
        setRouteResult(parsed);
        // Animate in
        fadeIn(instructionOpacity, 300, 100).start();
        slideInFromBottom(instructionTranslateY, 300, 100).start();
        fadeIn(controlsOpacity, 300, 200).start();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load navigation data");
      router.back();
    }

    return () => {
      // Cleanup: stop voice navigation when leaving screen
      stopSpeaking();
    };
  }, [params.routeData]);

  // Speak instruction when step changes
  useEffect(() => {
    if (routeResult && routeResult.pathFound && settings.voiceNavigation) {
      const currentStep = routeResult.path[currentStepIndex];
      const currentName = currentStep.nodeName || currentStep.name || 'Unknown';
      const nextStep = routeResult.path[currentStepIndex + 1];
      const nextName = nextStep?.nodeName || nextStep?.name || 'next point';
      const instruction =
        routeResult.instructions && routeResult.instructions[currentStepIndex]
          ? routeResult.instructions[currentStepIndex]
          : currentStepIndex === routeResult.path.length - 1
            ? `Arrive at ${currentName}`
            : `Continue to ${nextName}`;

      speakInstruction(instruction);
    }
  }, [currentStepIndex, routeResult, settings.voiceNavigation]);

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      // Animate out
      fadeOut(instructionOpacity, 150).start(() => {
        setCurrentStepIndex(currentStepIndex - 1);
        instructionTranslateY.setValue(50);
        // Animate in
        fadeIn(instructionOpacity, 300).start();
        slideInFromBottom(instructionTranslateY, 300).start();
      });
    }
  };

  const handleNext = () => {
    if (routeResult && currentStepIndex < routeResult.path.length - 1) {
      // Animate out
      fadeOut(instructionOpacity, 150).start(() => {
        setCurrentStepIndex(currentStepIndex + 1);
        instructionTranslateY.setValue(50);
        // Animate in
        fadeIn(instructionOpacity, 300).start();
        slideInFromBottom(instructionTranslateY, 300).start();
      });
    } else {
      // Reached destination
      Alert.alert("Arrived", "You have reached your destination!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    }
  };

  const handleEndNavigation = () => {
    Alert.alert(
      "End Navigation",
      "Are you sure you want to end navigation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End",
          style: "destructive",
          onPress: () => router.replace("/(tabs)"),
        },
      ]
    );
  };

  if (!routeResult || !routeResult.pathFound) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Navigation data not available</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStep = routeResult.path[currentStepIndex];
  const currentName = currentStep.nodeName || currentStep.name || 'Unknown';
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === routeResult.path.length - 1;
  const nextStep = routeResult.path[currentStepIndex + 1];
  const nextName = nextStep?.nodeName || nextStep?.name || 'next point';
  const instruction =
    routeResult.instructions && routeResult.instructions[currentStepIndex]
      ? routeResult.instructions[currentStepIndex]
      : isLastStep
        ? `Arrive at ${currentName}`
        : `Continue to ${nextName}`;

  // Calculate distance to next step
  const distanceToNext = isLastStep
    ? 0
    : Math.sqrt(
      Math.pow(
        routeResult.path[currentStepIndex + 1].x - currentStep.x,
        2
      ) +
      Math.pow(
        routeResult.path[currentStepIndex + 1].y - currentStep.y,
        2
      )
    );

  return (
    <View style={styles.container}>
      {/* Instruction Card */}
      <Animated.View
        style={[
          styles.instructionCard,
          {
            opacity: instructionOpacity,
            transform: [{ translateY: instructionTranslateY }],
          },
        ]}
      >
        <View style={styles.instructionHeader}>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              {currentStepIndex + 1} / {routeResult.path.length}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleEndNavigation}
            accessibilityLabel="End navigation"
            accessibilityRole="button"
            accessibilityHint="Stop navigation and return to home"
          >
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <Text
          style={[styles.instructionText, { fontSize: 20 * fontSizeMultiplier }]}
          accessibilityLabel={instruction}
          accessibilityRole="text"
        >
          {instruction}
        </Text>

        {!isLastStep && (
          <View style={styles.distanceContainer}>
            <NavIcon size={16} color="#6b7280" />
            <Text style={styles.distanceText}>
              {distanceToNext.toFixed(1)} m to next turn
            </Text>
          </View>
        )}

        {isLastStep && (
          <View style={styles.arrivalContainer}>
            <Text style={styles.arrivalText}>You have arrived!</Text>
          </View>
        )}
      </Animated.View>

      {/* Floor Plan View */}
      <View style={styles.mapContainer}>
        <FloorPlanView
          floorId={currentStep.floorId}
          routePath={routeResult.path}
          currentStepIndex={currentStepIndex}
        />
      </View>

      {/* Navigation Controls */}
      <Animated.View
        style={[
          styles.controls,
          {
            opacity: controlsOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.controlButton, isFirstStep && styles.controlButtonDisabled]}
          onPress={handlePrevious}
          disabled={isFirstStep}
          accessibilityLabel="Previous step"
          accessibilityRole="button"
          accessibilityHint="Go to the previous navigation step"
        >
          <ChevronLeft size={24} color={isFirstStep ? "#9ca3af" : "#3b82f6"} />
          <Text
            style={[
              styles.controlButtonText,
              isFirstStep && styles.controlButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleNext}
          accessibilityLabel={isLastStep ? "Arrived at destination" : "Next step"}
          accessibilityRole="button"
          accessibilityHint={isLastStep ? "You have reached your destination" : "Go to the next navigation step"}
        >
          <Text style={styles.controlButtonText}>
            {isLastStep ? "Arrived" : "Next"}
          </Text>
          {!isLastStep && (
            <ChevronRight size={24} color="#3b82f6" />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 48,
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    alignSelf: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  instructionCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  instructionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  stepIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
  },
  stepText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },
  closeButton: {
    padding: 4,
  },
  instructionText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
    lineHeight: 28,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  distanceText: {
    fontSize: 14,
    color: "#6b7280",
  },
  arrivalContainer: {
    paddingVertical: 8,
  },
  arrivalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#e5e7eb",
  },
  controls: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  controlButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    gap: 8,
  },
  controlButtonDisabled: {
    backgroundColor: "#f3f4f6",
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3b82f6",
  },
  controlButtonTextDisabled: {
    color: "#9ca3af",
  },
});

