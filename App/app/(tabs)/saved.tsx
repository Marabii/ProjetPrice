import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";

import { Formation } from "@/types/Formation";
import { FormationCard } from "@/components/FormationCard";

export default function SavedFormationsScreen() {
  const [savedFormations, setSavedFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(50))[0];

  // Load saved formations
  const loadSavedFormations = useCallback(async () => {
    try {
      setLoading(true);
      const savedFormationsJson = await AsyncStorage.getItem("savedFormations");

      if (savedFormationsJson) {
        const formations: Formation[] = JSON.parse(savedFormationsJson);
        setSavedFormations(formations);
      } else {
        setSavedFormations([]);
      }
    } catch (error) {
      console.error("Error loading saved formations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);

      // Animate content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, []);

  // Load saved formations when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadSavedFormations();
    }, [loadSavedFormations])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSavedFormations();
  }, [loadSavedFormations]);

  // Toggle save formation
  const toggleSaveFormation = async (formation: Formation) => {
    try {
      const updatedFormations = savedFormations.filter(
        (item) => item.id !== formation.id
      );

      setSavedFormations(updatedFormations);
      await AsyncStorage.setItem(
        "savedFormations",
        JSON.stringify(updatedFormations)
      );
    } catch (error) {
      console.error("Error removing formation:", error);
    }
  };

  // Render empty state
  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <LottieView
          source={require("@/assets/animations/empty-box.json")}
          autoPlay
          loop
          style={styles.emptyAnimation}
        />
        <Text style={styles.emptyTitle}>Aucune formation sauvegardée</Text>
        <Text style={styles.emptyText}>
          Les formations que vous sauvegardez apparaîtront ici pour un accès
          rapide.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={["#3498db", "#2980b9"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Formations sauvegardées</Text>
          <View style={styles.headerStats}>
            <View style={styles.statBadge}>
              <Text style={styles.statCount}>{savedFormations.length}</Text>
              <Text style={styles.statLabel}>Sauvegardées</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>
            Chargement des formations sauvegardées...
          </Text>
        </View>
      ) : (
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateY }],
            },
          ]}
        >
          <FlatList
            data={savedFormations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FormationCard
                formation={item}
                isSaved={true}
                onToggleSave={toggleSaveFormation}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#3498db"]}
                tintColor="#3498db"
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  headerStats: {
    flexDirection: "row",
  },
  statBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  statCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100, // Increased padding to avoid bottom navigation overlap
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 50,
  },
  emptyAnimation: {
    width: 200,
    height: 200,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    lineHeight: 24,
  },
});
