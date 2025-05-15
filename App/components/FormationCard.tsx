import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Formation } from "@/types/Formation";
// Remove unused import

interface Props {
  formation: Formation;
  isSaved: boolean;
  onToggleSave: (formation: Formation) => void;
}

export const FormationCard: React.FC<Props> = ({
  formation,
  isSaved,
  onToggleSave,
}) => {
  // Calculate admission rate for the progress bar
  const totalAdmitted =
    (formation.admittedBacGeneral || 0) +
    (formation.admittedBacTechno || 0) +
    (formation.admittedBacPro || 0);
  const admissionRate =
    formation.candidateCount > 0 ? totalAdmitted / formation.candidateCount : 0;

  // Navigate to formation details
  const handlePress = () => {
    // Use the correct path format for expo-router
    router.push({
      pathname: "/(details)/[id]",
      params: { id: formation.id.toString() },
    } as any);
  };

  return (
    <Animated.View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.9}
        onPress={handlePress}
      >
        <View style={styles.headerSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {formation.establishmentName}
            </Text>
            <View style={styles.badgeContainer}>
              {formation.establishmentStatus && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {formation.establishmentStatus}
                  </Text>
                </View>
              )}
              {formation.hasDetailedInfo && (
                <View style={styles.detailedInfoBadge}>
                  <Ionicons
                    name="information-circle"
                    size={12}
                    color="#fff"
                    style={styles.badgeIcon}
                  />
                  <Text style={styles.detailedInfoText}>Infos détaillées</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.programContainer}>
            <Text style={styles.programLabel}>Programme</Text>
            <Text style={styles.programText} numberOfLines={2}>
              {formation.program ? formation.program : "Programme Inconnu"}
            </Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formation.candidateCount || "-"}
            </Text>
            <Text style={styles.statLabel}>Candidats</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalAdmitted || "-"}</Text>
            <Text style={styles.statLabel}>Admis</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(admissionRate * 100) + "%"}
            </Text>
            <Text style={styles.statLabel}>Taux d'admission</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(admissionRate * 100, 100)}%`,
                  backgroundColor:
                    admissionRate < 0.3
                      ? "#e74c3c"
                      : admissionRate < 0.5
                      ? "#f39c12"
                      : admissionRate < 0.7
                      ? "#3498db"
                      : "#2ecc71",
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Taux d'admission: {Math.round(admissionRate * 100)}%
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>Voir les détails</Text>
            <Ionicons name="chevron-forward" size={16} color="#3498db" />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={(e) => {
              e.stopPropagation();
              onToggleSave(formation);
            }}
          >
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={22}
              color={isSaved ? "#e74c3c" : "#777"}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: "#fff",
  },
  cardContent: {
    borderRadius: 16,
    overflow: "hidden",
  },
  headerSection: {
    padding: 16,
    backgroundColor: "#fff",
  },
  titleContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    gap: 8,
  },
  statusBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#1976d2",
    fontWeight: "600",
  },
  detailedInfoBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  detailedInfoText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  badgeIcon: {
    marginRight: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: "#555",
    marginLeft: 6,
    flex: 1,
  },
  programContainer: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  programLabel: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  programText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  statsSection: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3498db",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#777",
  },
  progressContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  progressBackground: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#777",
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#3498db",
    fontWeight: "600",
    marginRight: 4,
  },
  saveButton: {
    padding: 8,
  },
});
