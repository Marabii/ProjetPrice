import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  QuizQuestion,
  QuizAnswer,
  FormationScore,
  QuizState,
} from "@/types/Quiz";

// Define the context type
interface QuizContextType {
  quizState: QuizState;
  answerQuestion: (answer: boolean) => void;
  resetQuiz: () => void;
  loadQuiz: () => Promise<void>;
}

// Create the context with a default value
const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Initial state for the quiz
const initialQuizState: QuizState = {
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  scores: [],
  isCompleted: false,
  isLoading: true,
};

// Formation types
const FORMATION_TYPES = [
  "CPGE",
  "BUT",
  "BTS",
  "Fac",
  "EcolePostBac",
  "Alternance",
];

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [quizState, setQuizState] = useState<QuizState>(initialQuizState);

  // Load quiz questions from Excel file
  const loadQuiz = async () => {
    try {
      // Check if we have saved quiz state
      const savedQuizState = await AsyncStorage.getItem("quizState");
      if (savedQuizState) {
        setQuizState(JSON.parse(savedQuizState));
        return;
      }

      // Load questions from Excel file
      setQuizState((prev) => ({ ...prev, isLoading: true }));

      // Mock data for testing - we'll replace this with actual Excel reading later
      const mockData = [
        {
          Question: "Veux-tu partir à l'étranger durant tes études ?",
          CPGE: 2,
          BUT: 2,
          BTS: 1,
          Fac: 3,
          "École post-bac": 3,
          Alternance: 1,
        },
        {
          Question:
            "Souhaites-tu suivre une formation avec une grande autonomie ?",
          CPGE: 1,
          BUT: 2,
          BTS: 1,
          Fac: 3,
          "École post-bac": 2,
          Alternance: 2,
        },
        {
          Question:
            "Es-tu prêt à donner le meilleur de toi-même sous pression (charge de travail élevée) ?",
          CPGE: 3,
          BUT: 2,
          BTS: 1,
          Fac: 1,
          "École post-bac": 2,
          Alternance: 1,
        },
        {
          Question:
            "Veux-tu te spécialiser tôt dans un métier précis pendant ta formation ?",
          CPGE: 1,
          BUT: 3,
          BTS: 3,
          Fac: 2,
          "École post-bac": 2,
          Alternance: 3,
        },
        {
          Question: "Es-tu attiré(e) par l'excellence académique ?",
          CPGE: 3,
          BUT: 2,
          BTS: 1,
          Fac: 2,
          "École post-bac": 3,
          Alternance: 1,
        },
        {
          Question: "Es-tu autonome ?",
          CPGE: 3,
          BUT: 3,
          BTS: 2,
          Fac: 3,
          "École post-bac": 3,
          Alternance: 2,
        },
        {
          Question: "Préfères-tu une formation théorique plutôt que pratique ?",
          CPGE: 3,
          BUT: 2,
          BTS: 1,
          Fac: 3,
          "École post-bac": 2,
          Alternance: 1,
        },
        {
          Question: "Souhaites-tu avoir un diplôme reconnu à l'international ?",
          CPGE: 2,
          BUT: 1,
          BTS: 1,
          Fac: 3,
          "École post-bac": 3,
          Alternance: 1,
        },
        {
          Question:
            "Es-tu prêt(e) à faire des études longues (5 ans ou plus) ?",
          CPGE: 3,
          BUT: 2,
          BTS: 1,
          Fac: 3,
          "École post-bac": 3,
          Alternance: 1,
        },
        {
          Question: "Préfères-tu un encadrement important dans tes études ?",
          CPGE: 3,
          BUT: 2,
          BTS: 3,
          Fac: 1,
          "École post-bac": 2,
          Alternance: 3,
        },
      ];

      const data = mockData;

      // Transform the data into our question format
      const questions: QuizQuestion[] = data.map((row, index) => ({
        id: index,
        text: row.Question,
        coefficients: {
          CPGE: row.CPGE || 0,
          BUT: row.BUT || 0,
          BTS: row.BTS || 0,
          Fac: row.Fac || 0,
          EcolePostBac: row["École post-bac"] || 0,
          Alternance: row.Alternance || 0,
        },
      }));

      // Calculate max scores for each formation type
      const maxScores = FORMATION_TYPES.map((type) => {
        const maxScore = questions.reduce((sum, q) => {
          const coefficient =
            type === "EcolePostBac"
              ? q.coefficients["EcolePostBac"]
              : q.coefficients[type as keyof typeof q.coefficients] || 0;
          return sum + coefficient;
        }, 0);

        return {
          type,
          score: 0,
          maxScore,
          percentage: 0,
        };
      });

      setQuizState({
        ...initialQuizState,
        questions,
        scores: maxScores,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading quiz:", error);
      setQuizState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Calculate scores based on answers
  const calculateScores = (
    questions: QuizQuestion[],
    answers: QuizAnswer[]
  ): FormationScore[] => {
    return FORMATION_TYPES.map((type) => {
      // Calculate the score for this formation type
      const score = answers.reduce((sum, answer) => {
        if (!answer.answer) return sum; // If answer is "No", don't add points

        const question = questions.find((q) => q.id === answer.questionId);
        if (!question) return sum;

        const coefficient =
          type === "EcolePostBac"
            ? question.coefficients["EcolePostBac"]
            : question.coefficients[
                type as keyof typeof question.coefficients
              ] || 0;

        return sum + coefficient;
      }, 0);

      // Calculate the max score for this formation type
      const maxScore = questions.reduce((sum, q) => {
        const coefficient =
          type === "EcolePostBac"
            ? q.coefficients["EcolePostBac"]
            : q.coefficients[type as keyof typeof q.coefficients] || 0;
        return sum + coefficient;
      }, 0);

      // Calculate the percentage
      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

      return {
        type,
        score,
        maxScore,
        percentage,
      };
    });
  };

  // Answer a question
  const answerQuestion = (answer: boolean) => {
    setQuizState((prev) => {
      // Create a new answer
      const newAnswer: QuizAnswer = {
        questionId: prev.questions[prev.currentQuestionIndex].id,
        answer,
      };

      // Add the answer to the list
      const updatedAnswers = [...prev.answers, newAnswer];

      // Calculate new scores
      const updatedScores = calculateScores(prev.questions, updatedAnswers);

      // Check if this is the last question
      const isLastQuestion =
        prev.currentQuestionIndex === prev.questions.length - 1;

      // Create the updated state
      const updatedState = {
        ...prev,
        currentQuestionIndex: isLastQuestion
          ? prev.currentQuestionIndex
          : prev.currentQuestionIndex + 1,
        answers: updatedAnswers,
        scores: updatedScores,
        isCompleted: isLastQuestion,
      };

      // Save the state to AsyncStorage
      AsyncStorage.setItem("quizState", JSON.stringify(updatedState));

      return updatedState;
    });
  };

  // Reset the quiz
  const resetQuiz = () => {
    setQuizState((prev) => {
      const resetState = {
        ...initialQuizState,
        questions: prev.questions,
        scores: prev.scores.map((score) => ({
          ...score,
          score: 0,
          percentage: 0,
        })),
        isLoading: false,
      };

      // Remove the saved state from AsyncStorage
      AsyncStorage.removeItem("quizState");

      return resetState;
    });
  };

  // Load the quiz on mount
  useEffect(() => {
    loadQuiz();
  }, []);

  return (
    <QuizContext.Provider
      value={{ quizState, answerQuestion, resetQuiz, loadQuiz }}
    >
      {children}
    </QuizContext.Provider>
  );
};

// Custom hook to use the quiz context
export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
};
