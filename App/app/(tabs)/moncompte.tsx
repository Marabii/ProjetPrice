import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MonCompteScreen() {
  return (
    <View style={styles.container}>
      <Text>Mon compte</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
