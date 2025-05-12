import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useQuiz } from "@/context/QuizContext";
import { QuizCard } from "@/components/QuizCard";
import { QuizResults } from "@/components/QuizResults";
import { StatusBar } from "expo-status-bar";

export default function QuizScreen() {
  const { quizState, answerQuestion, resetQuiz, loadQuiz } = useQuiz();

  useEffect(() => {
    // Load the quiz if it's not already loaded
    if (quizState.questions.length === 0) {
      loadQuiz();
    }
  }, []);

  // Show loading indicator while the quiz is loading
  if (quizState.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Chargement du quiz...</Text>
      </View>
    );
  }

  // Show the quiz results if the quiz is completed
  if (quizState.isCompleted) {
    return <QuizResults scores={quizState.scores} onReset={resetQuiz} />;
  }

  // Show the current question
  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];

  // Handle case where there are no questions
  if (quizState.questions.length === 0 && !quizState.isLoading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Impossible de charger les questions du quiz.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadQuiz}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Quizz d'orientation</Text>
        <Text style={styles.subtitle}>
          Réponds aux questions pour découvrir les formations qui te
          correspondent le mieux
        </Text>
      </View>

      {currentQuestion && (
        <QuizCard
          question={currentQuestion}
          currentIndex={quizState.currentQuestionIndex}
          totalQuestions={quizState.questions.length}
          onAnswer={answerQuestion}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
});
