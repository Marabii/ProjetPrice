import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Animated,
  Platform,
  Share,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

import { Formation } from "@/types/Formation";
import { BASE_URL } from "@/constants";

// Helper function to get a color based on a value (for visual indicators)
const getColorForValue = (value: number): string => {
  if (value < 0.3) return "#4CAF50"; // Green for low values (easier admission)
  if (value < 0.7) return "#FFC107"; // Yellow for medium values
  return "#F44336"; // Red for high values (harder admission)
};

// Helper function to get a percentage string
const getPercentage = (value: number, total: number): string => {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
};

export default function FormationDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Use transform instead of height for animation to avoid native module errors
  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0.9, 1],
    extrapolate: "clamp",
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: "clamp",
  });

  // Fetch formation details
  useEffect(() => {
    const fetchFormation = async () => {
      try {
        setLoading(true);

        // Add timeout to prevent hanging if server is unreachable
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          const response = await fetch(`${BASE_URL}/api/formations/${id}`, {
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error("Failed to fetch formation details");
          }

          const data = await response.json();
          setFormation(data);

          // Check if this formation is saved
          const savedFormationsJson = await AsyncStorage.getItem(
            "savedFormations"
          );
          if (savedFormationsJson) {
            const savedFormations: Formation[] =
              JSON.parse(savedFormationsJson);
            setIsSaved(savedFormations.some((item) => item.id === id));
          }
        } catch (fetchError) {
          console.error("Fetch error:", fetchError);
          if (fetchError instanceof Error && fetchError.name === "AbortError") {
            setError(
              "La requête a pris trop de temps. Veuillez vérifier votre connexion."
            );
          } else {
            setError("Impossible de charger les détails de cette formation.");
          }
        }
      } catch (err) {
        console.error("Error fetching formation:", err);
        setError("Une erreur est survenue lors du chargement des détails.");
      } finally {
        setLoading(false);
      }
    };

    fetchFormation();
  }, [id]);

  // Toggle save formation
  const toggleSaveFormation = async () => {
    if (!formation) return;

    try {
      const savedFormationsJson = await AsyncStorage.getItem("savedFormations");
      let savedFormations: Formation[] = savedFormationsJson
        ? JSON.parse(savedFormationsJson)
        : [];

      if (isSaved) {
        // Remove from saved
        savedFormations = savedFormations.filter(
          (item) => item.id !== formation.id
        );
      } else {
        // Add to saved
        savedFormations.push(formation);
      }

      await AsyncStorage.setItem(
        "savedFormations",
        JSON.stringify(savedFormations)
      );
      setIsSaved(!isSaved);
    } catch (err) {
      console.error("Error saving formation:", err);
    }
  };

  // Share formation
  const shareFormation = async () => {
    if (!formation) return;

    try {
      await Share.share({
        message: `Découvre ${formation.establishmentName} - ${formation.program} sur ProjetPrice!`,
        url: `https://projetprice.com/formations/${formation.id}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  if (error || !formation) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
        <Text style={styles.errorText}>
          {error || "Une erreur est survenue."}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate admission rate based on the sum of admitted by bac type
  const totalAdmitted =
    (formation.admittedBacGeneral || 0) +
    (formation.admittedBacTechno || 0) +
    (formation.admittedBacPro || 0);
  const admissionRate =
    formation.candidateCount > 0 ? totalAdmitted / formation.candidateCount : 0;

  return (
    <>
      <StatusBar barStyle="light-content" />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Animated header */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            opacity: headerOpacity,
            transform: [{ scale: headerScale }],
            paddingTop: insets.top,
          },
        ]}
      >
        {Platform.OS === "ios" && (
          <BlurView
            tint="dark"
            intensity={90}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text numberOfLines={1} style={styles.headerTitle}>
            {formation.establishmentName}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={shareFormation}
            >
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={toggleSaveFormation}
            >
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={24}
                color={isSaved ? "#ff6b6b" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero section */}
        <Animated.View
          style={[styles.heroSection, { transform: [{ scale: imageScale }] }]}
        >
          <LinearGradient
            colors={["#3498db", "#2980b9"]}
            style={styles.heroBackground}
          />
          <View style={styles.heroContent}>
            <View style={styles.backButtonContainer}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>
                {formation.establishmentName}
              </Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {formation.establishmentStatus}
                </Text>
              </View>
            </View>
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={shareFormation}
              >
                <Ionicons name="share-social-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, isSaved && styles.savedButton]}
                onPress={toggleSaveFormation}
              >
                <Ionicons
                  name={isSaved ? "heart" : "heart-outline"}
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Main content */}
        <View style={styles.mainContent}>
          {/* Location info */}
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color="#555" />
            <Text style={styles.locationText}>
              {formation.commune}, {formation.department}, {formation.region}
            </Text>
          </View>

          {/* Program info */}
          <View style={styles.programContainer}>
            <Text style={styles.programLabel}>Programme</Text>
            <Text style={styles.programText}>{formation.program}</Text>
          </View>

          {/* Key stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {formation.candidateCount || "N/A"}
              </Text>
              <Text style={styles.statLabel}>Candidats</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalAdmitted || "N/A"}</Text>
              <Text style={styles.statLabel}>Admis</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {Math.round(admissionRate * 100) + "%"}
              </Text>
              <Text style={styles.statLabel}>Taux d'admission</Text>
            </View>
          </View>

          {/* Admission rate visualization */}
          <View style={styles.admissionContainer}>
            <Text style={styles.sectionTitle}>Taux d'admission</Text>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(admissionRate * 100, 100)}%`,
                    backgroundColor: getColorForValue(1 - admissionRate),
                  },
                ]}
              />
              <Text style={styles.progressText}>
                {getPercentage(totalAdmitted, formation.candidateCount)}
              </Text>
            </View>
            <Text style={styles.admissionText}>
              {admissionRate < 0.3
                ? "Très sélectif"
                : admissionRate < 0.5
                ? "Sélectif"
                : admissionRate < 0.7
                ? "Modérément sélectif"
                : "Peu sélectif"}
            </Text>
          </View>

          {/* Detailed stats */}
          <View style={styles.detailedStatsContainer}>
            <Text style={styles.sectionTitle}>Statistiques détaillées</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Académie</Text>
              <Text style={styles.detailValue}>
                {formation.academy || "N/A"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sélectivité</Text>
              <Text style={styles.detailValue}>
                {formation.selectivity || "N/A"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Admis bac général</Text>
              <Text style={styles.detailValue}>
                {formation.admittedBacGeneral || "N/A"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Admis bac techno</Text>
              <Text style={styles.detailValue}>
                {formation.admittedBacTechno || "N/A"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Admis bac pro</Text>
              <Text style={styles.detailValue}>
                {formation.admittedBacPro || "N/A"}
              </Text>
            </View>
          </View>

          {/* Additional metrics */}
          <View style={styles.additionalMetricsContainer}>
            <Text style={styles.sectionTitle}>Métriques supplémentaires</Text>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>
                Part des terminales générales en position de recevoir une
                proposition
              </Text>
              <Text style={styles.metricValue}>
                {formation.generalTerminalOfferPercentage || "N/A"}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>
                Part des terminales technologiques en position de recevoir une
                proposition
              </Text>
              <Text style={styles.metricValue}>
                {formation.technoTerminalOfferPercentage || "N/A"}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>
                Part des terminales professionnelles en position de recevoir une
                proposition
              </Text>
              <Text style={styles.metricValue}>
                {formation.professionalTerminalOfferPercentage || "N/A"}
              </Text>
            </View>
          </View>

          {/* Detailed information section (only shown if hasDetailedInfo is true) */}
          {formation.hasDetailedInfo && (
            <View style={styles.detailedInfoContainer}>
              <Text style={styles.sectionTitle}>Informations détaillées</Text>

              {formation.website && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Site web</Text>
                  <TouchableOpacity
                    onPress={() => {
                      // Add http:// if it doesn't already have it
                      let url = formation.website || "";
                      if (
                        !url.startsWith("http://") &&
                        !url.startsWith("https://")
                      ) {
                        url = "http://" + url;
                      }
                      // Open the URL in the browser
                      Linking.openURL(url);
                    }}
                  >
                    <Text style={styles.detailValueLink}>
                      {formation.website}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {formation.duration && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Durée</Text>
                  <Text style={styles.detailValue}>{formation.duration}</Text>
                </View>
              )}

              {formation.cost && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Coût</Text>
                  <Text style={styles.detailValue}>{formation.cost}</Text>
                </View>
              )}

              {formation.privatePublicStatus && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Statut</Text>
                  <Text style={styles.detailValue}>
                    {formation.privatePublicStatus}
                  </Text>
                </View>
              )}

              {formation.domainsOffered && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Domaines enseignés</Text>
                  <Text style={styles.detailValue}>
                    {formation.domainsOffered}
                  </Text>
                </View>
              )}

              {formation.alternanceAvailable && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Alternance</Text>
                  <Text style={styles.detailValue}>
                    {formation.alternanceAvailable}
                  </Text>
                </View>
              )}

              {formation.admissionProcess && (
                <View style={styles.infoCard}>
                  <View style={styles.infoCardHeader}>
                    <Ionicons name="school-outline" size={20} color="#3498db" />
                    <Text style={styles.infoCardTitle}>Admission</Text>
                  </View>
                  <Text style={styles.infoCardText}>
                    {formation.admissionProcess}
                  </Text>
                </View>
              )}

              {formation.studentLife && (
                <View style={styles.infoCard}>
                  <View style={styles.infoCardHeader}>
                    <Ionicons name="people-outline" size={20} color="#3498db" />
                    <Text style={styles.infoCardTitle}>Vie étudiante</Text>
                  </View>
                  <Text style={styles.infoCardText}>
                    {formation.studentLife}
                  </Text>
                </View>
              )}

              {formation.associations && (
                <View style={styles.infoCard}>
                  <View style={styles.infoCardHeader}>
                    <Ionicons name="heart-outline" size={20} color="#3498db" />
                    <Text style={styles.infoCardTitle}>Associations</Text>
                  </View>
                  <Text style={styles.infoCardText}>
                    {formation.associations}
                  </Text>
                </View>
              )}

              {formation.atmosphere && (
                <View style={styles.infoCard}>
                  <View style={styles.infoCardHeader}>
                    <Ionicons name="sunny-outline" size={20} color="#3498db" />
                    <Text style={styles.infoCardTitle}>Ambiance</Text>
                  </View>
                  <Text style={styles.infoCardText}>
                    {formation.atmosphere}
                  </Text>
                </View>
              )}

              {formation.careerProspects && (
                <View style={styles.infoCard}>
                  <View style={styles.infoCardHeader}>
                    <Ionicons
                      name="briefcase-outline"
                      size={20}
                      color="#3498db"
                    />
                    <Text style={styles.infoCardTitle}>Débouchés</Text>
                  </View>
                  <Text style={styles.infoCardText}>
                    {formation.careerProspects}
                  </Text>
                </View>
              )}

              {formation.housingInfo && (
                <View style={styles.infoCard}>
                  <View style={styles.infoCardHeader}>
                    <Ionicons name="home-outline" size={20} color="#3498db" />
                    <Text style={styles.infoCardTitle}>Logement</Text>
                  </View>
                  <Text style={styles.infoCardText}>
                    {formation.housingInfo}
                  </Text>
                </View>
              )}

              {formation.residenceOptions && (
                <View style={styles.infoCard}>
                  <View style={styles.infoCardHeader}>
                    <Ionicons name="bed-outline" size={20} color="#3498db" />
                    <Text style={styles.infoCardTitle}>
                      Résidence universitaire/internat
                    </Text>
                  </View>
                  <Text style={styles.infoCardText}>
                    {formation.residenceOptions}
                  </Text>
                </View>
              )}

              {formation.orientationAdvice && (
                <View style={styles.infoCard}>
                  <View style={styles.infoCardHeader}>
                    <Ionicons
                      name="compass-outline"
                      size={20}
                      color="#3498db"
                    />
                    <Text style={styles.infoCardTitle}>
                      Conseils d'orientation
                    </Text>
                  </View>
                  <Text style={styles.infoCardText}>
                    {formation.orientationAdvice}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Call to action */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={toggleSaveFormation}
            >
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={24}
                color="#fff"
                style={styles.ctaIcon}
              />
              <Text style={styles.ctaText}>
                {isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  detailedInfoContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#3498db",
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  detailValueLink: {
    fontSize: 14,
    color: "#3498db",
    flex: 1,
    textAlign: "right",
    textDecorationLine: "underline",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Platform.OS === "ios" ? "transparent" : "#3498db",
    zIndex: 100,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: "100%",
  },
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginHorizontal: 16,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
  },
  headerAction: {
    padding: 8,
    marginLeft: 8,
  },
  heroSection: {
    height: 280,
    width: "100%",
    position: "relative",
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    justifyContent: "space-between",
  },
  backButtonContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statusBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  heroActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  savedButton: {
    backgroundColor: "rgba(255, 107, 107, 0.6)",
  },
  mainContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 15,
    color: "#555",
    marginLeft: 8,
    flex: 1,
  },
  programContainer: {
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
  },
  programLabel: {
    fontSize: 14,
    color: "#777",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  programText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3498db",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
  admissionContainer: {
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  progressContainer: {
    height: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    height: "100%",
    borderRadius: 10,
  },
  progressText: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: "center",
    textAlignVertical: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  admissionText: {
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
  },
  detailedStatsContainer: {
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailLabel: {
    fontSize: 14,
    color: "#555",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  additionalMetricsContainer: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  metricLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3498db",
  },
  ctaContainer: {
    marginTop: 10,
  },
  ctaButton: {
    backgroundColor: "#3498db",
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaIcon: {
    marginRight: 10,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
