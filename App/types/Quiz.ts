export interface QuizQuestion {
  id: number;
  text: string;
  coefficients: {
    CPGE: number;
    BUT: number;
    BTS: number;
    Fac: number;
    EcolePostBac: number;
    Alternance: number;
  };
}

export interface QuizAnswer {
  questionId: number;
  answer: boolean; // true for "Yes", false for "No"
}

export interface FormationScore {
  type: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  scores: FormationScore[];
  isCompleted: boolean;
  isLoading: boolean;
}
