import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SuggestionInput } from "./SuggestionInput";

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
  sortBy: string;
  setSortBy: (val: string) => void;
  sortDirection: "ASC" | "DESC";
  setSortDirection: (val: "ASC" | "DESC") => void;
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
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* KeyboardAvoidingView helps prevent keyboard from covering fields */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ScrollView allows content to be scrollable when the keyboard is open */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filtres &amp; Options</Text>

              {/* Region with suggestions */}
              <SuggestionInput
                label="Région"
                fieldName="region"
                value={regionFilter}
                onChangeText={setRegionFilter}
                onSelectSuggestion={(val) => setRegionFilter(val)}
                placeholder="Ex: Île-de-France"
              />

              {/* Department with suggestions */}
              <SuggestionInput
                label="Département"
                fieldName="department"
                value={departmentFilter}
                onChangeText={setDepartmentFilter}
                onSelectSuggestion={(val) => setDepartmentFilter(val)}
                placeholder="Ex: 75"
              />

              {/* Program with suggestions */}
              <SuggestionInput
                label="Filière / Programme"
                fieldName="program"
                value={programFilter}
                onChangeText={setProgramFilter}
                onSelectSuggestion={(val) => setProgramFilter(val)}
                placeholder="Ex: CPGE"
              />

              {/* Establishment status (picker) */}
              <Text style={styles.inputLabel}>Statut de l'établissement</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
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

              {/* Sort By */}
              <Text style={styles.inputLabel}>Trier par</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={sortBy}
                  onValueChange={(value) => setSortBy(value)}
                >
                  <Picker.Item label="Identifiant (par défaut)" value="id" />
                  <Picker.Item label="Capacité" value="capacity" />
                  <Picker.Item label="Sélectivité" value="selectivity" />
                  <Picker.Item label="Candidats" value="candidateCount" />
                  <Picker.Item label="Admis" value="admittedCount" />
                  <Picker.Item
                    label="Propositions d'admission"
                    value="admissionOfferCount"
                  />
                </Picker>
              </View>

              {/* Sort Direction */}
              <Text style={styles.inputLabel}>Ordre</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={sortDirection}
                  onValueChange={(value) => setSortDirection(value)}
                >
                  <Picker.Item label="Ascendant (A-Z)" value="ASC" />
                  <Picker.Item label="Descendant (Z-A)" value="DESC" />
                </Picker>
              </View>

              {/* Action buttons */}
              <View style={styles.modalActionsRow}>
                <Pressable style={styles.modalButton} onPress={onClear}>
                  <Text style={styles.modalButtonText}>Réinitialiser</Text>
                </Pressable>
                <Pressable style={styles.modalButton} onPress={onClose}>
                  <Text style={styles.modalButtonText}>Annuler</Text>
                </Pressable>
                <Pressable style={styles.modalButton} onPress={onApply}>
                  <Text style={styles.modalButtonText}>Appliquer</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  /* This ensures any taps outside the text field cause the scroll to adjust. */
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    // By default, we center the modal in the screen
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    alignSelf: "center",
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    marginTop: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
  },
  modalActionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  modalButton: {
    backgroundColor: "#EAC42ED4",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
  },
});
