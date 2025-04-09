import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "@/constants";

interface SuggestionInputProps {
  label: string;
  fieldName: string; // e.g. "region", "department", etc.
  value: string;
  onChangeText: (text: string) => void;
  onSelectSuggestion: (suggestion: string) => void;
  placeholder?: string;
  icon?: string; // Ionicons name
}

// A small dropdown item
const SuggestionItem = ({
  item,
  onPress,
}: {
  item: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.suggestionItem} onPress={onPress}>
    <Text style={styles.suggestionItemText}>{item}</Text>
  </TouchableOpacity>
);

export const SuggestionInput: React.FC<SuggestionInputProps> = ({
  label,
  fieldName,
  value,
  onChangeText,
  onSelectSuggestion,
  placeholder = "",
  icon,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  useEffect(() => {
    // Whenever "value" changes, fetch new suggestions:
    fetchSuggestions(value);
  }, [value]);

  const fetchSuggestions = async (query: string) => {
    try {
      const params = new URLSearchParams({
        field: fieldName,
      });
      if (query) {
        params.append("query", query);
      }

      const url = `${BASE_URL}/api/formations/suggestions?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch suggestions.");
      }
      const data: string[] = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setSuggestions([]);
    }
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Optionally hide suggestions on blur.
    // setShowSuggestions(false);
  };

  const handleSelect = (suggestion: string) => {
    onSelectSuggestion(suggestion);
    setShowSuggestions(false);
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon as keyof typeof Ionicons.glyphMap}
              size={18}
              color="#777"
            />
          </View>
        )}
        <TextInput
          style={[styles.textInput, icon ? styles.textInputWithIcon : null]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={onChangeText}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#888"
        />
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onChangeText("")}
          >
            <Ionicons name="close-circle" size={20} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            scrollEnabled={false} // <-- Prevent nested scrolling issues
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => (
              <SuggestionItem item={item} onPress={() => handleSelect(item)} />
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#333",
    backgroundColor: "#fff",
    fontSize: 15,
  },
  textInputWithIcon: {
    paddingLeft: 40,
  },
  clearButton: {
    position: "absolute",
    right: 10,
  },
  suggestionsContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    marginTop: 4,
    maxHeight: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionItemText: {
    fontSize: 14,
    color: "#333",
  },
});
