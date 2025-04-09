import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Platform.OS === "ios" ? insets.bottom : 10 },
      ]}
    >
      {Platform.OS === "ios" && (
        <BlurView
          tint="systemChromeMaterial"
          intensity={100}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Background color for Android */}
      {Platform.OS === "android" && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "#fff" }]} />
      )}

      <View style={styles.content}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // Add haptic feedback
              if (Platform.OS === "ios") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }

              // Navigate to the tab
              navigation.navigate(route.name);
            }
          };

          // Get the tab icon
          const TabBarIcon = options.tabBarIcon;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={
                options.tabBarAccessibilityLabel as string | undefined
              }
              onPress={onPress}
              style={styles.tab}
            >
              <View
                style={[
                  styles.iconContainer,
                  isFocused ? styles.activeIconContainer : null,
                ]}
              >
                {TabBarIcon &&
                  TabBarIcon({
                    focused: isFocused,
                    color: isFocused ? "#3498db" : "#687076",
                    size: 24,
                  })}
              </View>

              <Text
                style={[
                  styles.label,
                  isFocused ? styles.activeLabel : styles.inactiveLabel,
                ]}
              >
                {label}
              </Text>

              {isFocused && <View style={styles.indicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Platform.OS === "ios" ? "transparent" : "#fff",
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    position: "relative",
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: "rgba(52, 152, 219, 0.15)",
  },
  label: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  activeLabel: {
    color: "#3498db",
    fontWeight: "600",
  },
  inactiveLabel: {
    color: "#687076",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: 30,
    backgroundColor: "#3498db",
    borderRadius: 3,
  },
});
