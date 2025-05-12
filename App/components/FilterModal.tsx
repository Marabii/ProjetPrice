import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { SuggestionInput } from "./SuggestionInput";
import { BlurView } from "expo-blur";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;

  // Filter states & setters
  regionFilter: string;
  setRegionFilter: (val: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  programFilter: string;
  setProgramFilter: (val: string) => void;
  bacTypeFilter: string;
  setBacTypeFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  sortDirection: "ASC" | "DESC";
  setSortDirection: (val: "ASC" | "DESC") => void;

  // New filters for detailed info
  hasDetailedInfoFilter: boolean;
  setHasDetailedInfoFilter: (val: boolean) => void;
  alternanceFilter: string;
  setAlternanceFilter: (val: string) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  onClear,
  regionFilter,
  setRegionFilter,
  departmentFilter,
  setDepartmentFilter,
  statusFilter,
  setStatusFilter,
  programFilter,
  setProgramFilter,
  bacTypeFilter,
  setBacTypeFilter,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  hasDetailedInfoFilter,
  setHasDetailedInfoFilter,
  alternanceFilter,
  setAlternanceFilter,
}) => {
  // Animation values
  const [animation] = useState(new Animated.Value(0));

  // Animate modal when visibility changes
  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const slideY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [Dimensions.get("window").height, 0],
  });

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });
  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "flex-end" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideY }] },
          ]}
        >
          {Platform.OS === "ios" && (
            <BlurView
              tint="light"
              intensity={90}
              style={StyleSheet.absoluteFill}
            />
          )}

          <View style={styles.modalHeader}>
            <View style={styles.dragIndicator} />
            <Text style={styles.modalTitle}>Filtres & Options</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#555" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Localisation</Text>

              {/* Region with suggestions */}
              <SuggestionInput
                label="Région"
                fieldName="region"
                value={regionFilter}
                onChangeText={setRegionFilter}
                onSelectSuggestion={(val) => setRegionFilter(val)}
                placeholder="Ex: Île-de-France"
                icon="location-outline"
              />

              {/* Department with suggestions */}
              <SuggestionInput
                label="Département"
                fieldName="department"
                value={departmentFilter}
                onChangeText={setDepartmentFilter}
                onSelectSuggestion={(val) => setDepartmentFilter(val)}
                placeholder="Ex: 75"
                icon="map-outline"
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Formation</Text>

              {/* Program with suggestions */}
              <SuggestionInput
                label="Filière / Programme"
                fieldName="program"
                value={programFilter}
                onChangeText={setProgramFilter}
                onSelectSuggestion={(val) => setProgramFilter(val)}
                placeholder="Ex: CPGE"
                icon="school-outline"
              />

              {/* Establishment status (picker) */}
              <Text style={styles.inputLabel}>Statut de l'établissement</Text>
              <View style={styles.pickerContainer}>
                <Ionicons
                  name="business-outline"
                  size={20}
                  color="#777"
                  style={styles.pickerIcon}
                />
                <Picker
                  selectedValue={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="(Non filtré)" value="" />
                  <Picker.Item label="Public" value="Public" />
                  <Picker.Item
                    label="Privé enseignement supérieur"
                    value="Privé enseignement supérieur"
                  />
                  <Picker.Item
                    label="Privé hors contrat"
                    value="Privé hors contrat"
                  />
                  <Picker.Item
                    label="Privé sous contrat d'association"
                    value="Privé sous contrat d'association"
                  />
                </Picker>
              </View>

              {/* Baccalaureate type (picker) */}
              <Text style={styles.inputLabel}>Type de baccalauréat</Text>
              <View style={styles.pickerContainer}>
                <Ionicons
                  name="school-outline"
                  size={20}
                  color="#777"
                  style={styles.pickerIcon}
                />
                <Picker
                  selectedValue={bacTypeFilter}
                  onValueChange={(value) => setBacTypeFilter(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="(Non filtré)" value="" />
                  <Picker.Item label="Bac Général" value="general" />
                  <Picker.Item label="Bac Technologique" value="techno" />
                  <Picker.Item label="Bac Professionnel" value="pro" />
                </Picker>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Informations détaillées</Text>

              {/* Has Detailed Info Switch */}
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>
                  Afficher uniquement les établissements avec informations
                  détaillées
                </Text>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    hasDetailedInfoFilter && styles.switchButtonActive,
                  ]}
                  onPress={() =>
                    setHasDetailedInfoFilter(!hasDetailedInfoFilter)
                  }
                >
                  <View
                    style={[
                      styles.switchThumb,
                      hasDetailedInfoFilter && styles.switchThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>

              {/* Alternance Filter */}
              <Text style={styles.inputLabel}>Alternance disponible</Text>
              <View style={styles.pickerContainer}>
                <Ionicons
                  name="briefcase-outline"
                  size={20}
                  color="#777"
                  style={styles.pickerIcon}
                />
                <Picker
                  selectedValue={alternanceFilter}
                  onValueChange={(value) => setAlternanceFilter(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="(Non filtré)" value="" />
                  <Picker.Item label="Oui" value="Oui" />
                  <Picker.Item label="Non" value="Non" />
                </Picker>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Tri</Text>

              {/* Sort By */}
              <Text style={styles.inputLabel}>Trier par</Text>
              <View style={styles.pickerContainer}>
                <Ionicons
                  name="options-outline"
                  size={20}
                  color="#777"
                  style={styles.pickerIcon}
                />
                <Picker
                  selectedValue={sortBy}
                  onValueChange={(value) => setSortBy(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Identifiant (par défaut)" value="id" />
                  <Picker.Item label="Sélectivité" value="selectivity" />
                  <Picker.Item label="Candidats" value="candidateCount" />
                  <Picker.Item
                    label="Admis bac général"
                    value="admittedBacGeneral"
                  />
                  <Picker.Item
                    label="Admis bac techno"
                    value="admittedBacTechno"
                  />
                  <Picker.Item label="Admis bac pro" value="admittedBacPro" />
                  <Picker.Item
                    label="Nom de l'établissement"
                    value="establishmentName"
                  />
                  <Picker.Item label="Région" value="region" />
                </Picker>
              </View>

              {/* Sort Direction */}
              <Text style={styles.inputLabel}>Ordre</Text>
              <View style={styles.pickerContainer}>
                <Ionicons
                  name="swap-vertical-outline"
                  size={20}
                  color="#777"
                  style={styles.pickerIcon}
                />
                <Picker
                  selectedValue={sortDirection}
                  onValueChange={(value) => setSortDirection(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Ascendant (A-Z)" value="ASC" />
                  <Picker.Item label="Descendant (Z-A)" value="DESC" />
                </Picker>
              </View>
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={onClear}
            >
              <Ionicons name="refresh-outline" size={18} color="#555" />
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.applyButton]}
              onPress={onApply}
            >
              <Text style={styles.applyButtonText}>Appliquer les filtres</Text>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    marginTop: 5,
  },
  switchLabel: {
    fontSize: 14,
    color: "#555",
    flex: 1,
    paddingRight: 10,
  },
  switchButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ddd",
    padding: 2,
  },
  switchButtonActive: {
    backgroundColor: "#3498db",
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  switchThumbActive: {
    transform: [{ translateX: 22 }],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  modalContainer: {
    maxHeight: "90%",
    backgroundColor: Platform.OS === "ios" ? "transparent" : "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor:
      Platform.OS === "ios" ? "rgba(255, 255, 255, 0.8)" : "#fff",
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
    position: "absolute",
    top: 8,
    alignSelf: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    padding: 5,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 10,
  },
  filterSection: {
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    marginTop: 15,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  pickerIcon: {
    marginLeft: 12,
  },
  picker: {
    flex: 1,
    marginLeft: -10,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor:
      Platform.OS === "ios" ? "rgba(255, 255, 255, 0.8)" : "#fff",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  resetButton: {
    backgroundColor: "#f5f5f5",
    marginRight: 10,
  },
  resetButtonText: {
    color: "#555",
    fontWeight: "500",
    marginLeft: 5,
  },
  applyButton: {
    backgroundColor: "#3498db",
    marginLeft: 10,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginRight: 5,
  },
});
