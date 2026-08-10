import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { predictionAPI, recommendationAPI } from '../services/api';
import RiskMeter from '../components/RiskMeter';
import SleepGraph from '../components/SleepGraph';
import { COLORS } from '../utils/constants';

export default function DashboardScreen({ navigation }) {
  const [prediction, setPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when screen comes into focus (e.g., after generating prediction)
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [predictionRes, recRes] = await Promise.all([
        predictionAPI.getLatest(),
        recommendationAPI.getAll(true), // Only unread
      ]);

      if (predictionRes.data?.prediction) {
        setPrediction(predictionRes.data.prediction);
      }

      if (recRes.data?.recommendations) {
        setRecommendations(recRes.data.recommendations.slice(0, 3)); // Top 3
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRunPrediction = async () => {
    setLoading(true);
    try {
      const response = await predictionAPI.run(7);
      if (response.data?.prediction) {
        setPrediction(response.data.prediction);
        Alert.alert('Success', 'Prediction generated successfully');
        await loadData(); // Reload to get recommendations
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>

        {prediction ? (
          <>
            <RiskMeter
              prediction={prediction.type}
              probability={prediction.probability}
            />

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sleep Estimates</Text>
              {prediction.sleepStartEstimate && (
                <Text style={styles.cardText}>
                  Sleep Start: {new Date(prediction.sleepStartEstimate).toLocaleTimeString()}
                </Text>
              )}
              {prediction.wakeEstimate && (
                <Text style={styles.cardText}>
                  Wake Time: {new Date(prediction.wakeEstimate).toLocaleTimeString()}
                </Text>
              )}
            </View>
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardText}>No prediction available</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handleRunPrediction}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Generating...' : 'Generate Prediction'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {recommendations.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Recommendations</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Recommendations')}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {recommendations.map((rec) => (
              <View key={rec.id} style={styles.recommendationItem}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <Text style={styles.recDescription} numberOfLines={2}>
                  {rec.description}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginVertical: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  recTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  recDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

