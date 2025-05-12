import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useAuth } from "@/context/AuthContext";
import { LoadingOverlay } from "@/components/LoadingOverlay";

const { width } = Dimensions.get("window");

export default function AuthScreen() {
  // State for form fields
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const formPosition = useRef(new Animated.Value(0)).current;

  // Get auth context for checking authentication
  const { isAuthenticated } = useAuth();

  // Handle animations and redirects
  useEffect(() => {
    if (isAuthenticated) {
      // User is already authenticated, will be redirected by the navigation guard
    } else {
      // Fade in animation when component mounts
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isAuthenticated]);

  // Toggle between login and signup
  const toggleAuthMode = () => {
    // Clear form fields and errors
    setErrors({});

    // Animate the form switch
    Animated.timing(formPosition, {
      toValue: isLogin ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsLogin(!isLogin);
      // Reset form position for the next animation
      formPosition.setValue(0);
    });
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
      newErrors.password =
        "Le mot de passe doit contenir des majuscules, des minuscules et des chiffres";
    }

    // Name validation (only for signup)
    if (!isLogin && !name) {
      newErrors.name = "Le nom est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get auth context
  const { login, register, isLoading: authLoading } = useAuth();

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let response;

      if (isLogin) {
        response = await login(email, password);
      } else {
        response = await register(name, email, password);
      }

      if (response.status === "SUCCESS") {
        // Navigation will be handled automatically by the auth context
        // through the _layout.tsx navigation guard
      } else {
        // Show error message
        Alert.alert(
          "Erreur d'authentification",
          response.message ||
            response.errors?.join("\n") ||
            "Une erreur inconnue s'est produite"
        );
      }
    } catch (error) {
      console.error("Auth error:", error);
      Alert.alert(
        "Erreur",
        "Une erreur inattendue s'est produite. Veuillez réessayer plus tard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.background}
      />

      <LoadingOverlay visible={isLoading || authLoading} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>
              {isLogin ? "Bienvenue" : "Créer un compte"}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? "Connectez-vous pour continuer votre parcours"
                : "Rejoignez-nous et découvrez le meilleur chemin pour votre avenir"}
            </Text>
          </View>

          {/* Form Fields */}
          <Animated.View
            style={[
              styles.formFields,
              {
                transform: [
                  {
                    translateX: formPosition.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, isLogin ? -width : width],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Name Field (Signup only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={22}
                  color="#7f8c8d"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nom complet"
                  placeholderTextColor="#7f8c8d"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>
            )}

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={22}
                color="#7f8c8d"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Adresse email"
                placeholderTextColor="#7f8c8d"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color="#7f8c8d"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#7f8c8d"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#7f8c8d"
                />
              </TouchableOpacity>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLogin ? "Se connecter" : "S'inscrire"}
              </Text>
            </TouchableOpacity>

            {/* Toggle Auth Mode */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isLogin
                  ? "Vous n'avez pas de compte ?"
                  : "Vous avez déjà un compte ?"}
              </Text>
              <TouchableOpacity onPress={toggleAuthMode}>
                <Text style={styles.toggleButton}>
                  {isLogin ? "S'inscrire" : "Se connecter"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
  },
  formFields: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputIcon: {
    position: "absolute",
    left: 15,
    top: 15,
    zIndex: 1,
  },
  input: {
    backgroundColor: "#f5f6fa",
    borderRadius: 10,
    padding: 15,
    paddingLeft: 45,
    fontSize: 16,
    color: "#2c3e50",
    borderWidth: 1,
    borderColor: "#dcdde1",
  },
  passwordToggle: {
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 1,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: "#3498db",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  toggleText: {
    color: "#7f8c8d",
    fontSize: 14,
  },
  toggleButton: {
    color: "#3498db",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
});
