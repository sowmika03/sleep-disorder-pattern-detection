import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { predictionAPI } from '../services/api';
import RiskMeter from '../components/RiskMeter';
import { COLORS } from '../utils/constants';

export default function PredictionScreen() {
  const navigation = useNavigation();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPrediction();
  }, []);

  const loadPrediction = async () => {
    try {
      const response = await predictionAPI.getLatest();
      if (response.data?.prediction) {
        setPrediction(response.data.prediction);
      }
    } catch (error) {
      console.error('Error loading prediction:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrediction();
    setRefreshing(false);
  };

  const handleRunPrediction = async () => {
    setLoading(true);
    try {
      const response = await predictionAPI.run(7);
      if (response.data?.prediction) {
        setPrediction(response.data.prediction);
        Alert.alert('Success', 'Prediction generated successfully! Dashboard will update automatically.');

        // Navigate to Dashboard to show the new prediction
        // The dashboard will auto-refresh when focused
        setTimeout(() => {
          navigation.navigate('Dashboard');
        }, 500);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to generate prediction');
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
        <Text style={styles.title}>Sleep Disorder Prediction</Text>

        {prediction ? (
          <>
            <RiskMeter
              prediction={prediction.type}
              probability={prediction.probability}
            />

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Prediction Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{prediction.type.toUpperCase()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Probability:</Text>
                <Text style={styles.detailValue}>
                  {(prediction.probability * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Confidence:</Text>
                <Text style={styles.detailValue}>
                  {(prediction.confidenceScore * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Model Accuracy:</Text>
                <Text style={styles.detailValue}>
                  {(prediction.modelAccuracy * 100).toFixed(1)}%
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sleep Timeline</Text>
              {prediction.sleepStartEstimate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Sleep Start:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(prediction.sleepStartEstimate).toLocaleString()}
                  </Text>
                </View>
              )}
              {prediction.wakeEstimate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Wake Time:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(prediction.wakeEstimate).toLocaleString()}
                  </Text>
                </View>
              )}
              {prediction.createdAt && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Generated:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(prediction.createdAt).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.noDataText}>
              No prediction available. Generate a new prediction to see your sleep disorder risk assessment.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRunPrediction}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Generating Prediction...' : 'Generate New Prediction'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            The prediction analyzes your smartphone activity patterns over the last 7 days,
            including screen usage, app categories, and timing patterns to assess your risk
            of sleep disorders.
          </Text>
        </View>
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: COLORS.info + '20',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.info,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

