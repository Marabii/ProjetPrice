import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormationScore } from '@/types/Quiz';
import { useRouter } from 'expo-router';

interface QuizResultsProps {
  scores: FormationScore[];
  onReset: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ scores, onReset }) => {
  const router = useRouter();
  
  // Sort scores by percentage in descending order
  const sortedScores = [...scores].sort((a, b) => b.percentage - a.percentage);
  
  // Format the formation type for display
  const formatFormationType = (type: string): string => {
    switch (type) {
      case 'CPGE':
        return 'Classes Préparatoires (CPGE)';
      case 'BUT':
        return 'Bachelor Universitaire de Technologie (BUT)';
      case 'BTS':
        return 'Brevet de Technicien Supérieur (BTS)';
      case 'Fac':
        return 'Université (Licence)';
      case 'EcolePostBac':
        return 'École post-bac';
      case 'Alternance':
        return 'Formation en alternance';
      default:
        return type;
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Résultats du quiz</Text>
      <Text style={styles.subtitle}>
        Voici les formations qui correspondent le mieux à votre profil
      </Text>
      
      <ScrollView style={styles.resultsContainer}>
        {sortedScores.map((score, index) => (
          <View key={score.type} style={styles.scoreCard}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.formationType}>{formatFormationType(score.type)}</Text>
              <View style={styles.percentageBarContainer}>
                <View 
                  style={[
                    styles.percentageBar, 
                    { width: `${Math.max(5, score.percentage)}%` }
                  ]} 
                />
                <Text style={styles.percentageText}>{Math.round(score.percentage)}%</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={onReset}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.buttonText}>Recommencer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.exploreButton]} 
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.buttonText}>Explorer les formations</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreInfo: {
    flex: 1,
  },
  formationType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  percentageBarContainer: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  percentageBar: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 10,
  },
  percentageText: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: '#f44336',
  },
  exploreButton: {
    backgroundColor: '#3498db',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
