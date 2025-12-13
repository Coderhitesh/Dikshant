import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Layout from '../../components/layout';

export default function AllScholarship() {

      const navigation = useNavigation()
    


  const scholarshipOptions = [
    {
      id: 1,
      percentage: '70%',
      title: 'Scholarship Programme',
      subtitle: 'For EWS Students',
      description: 'Income Below 6 Lacs',
    },
    {
      id: 2,
      percentage: '60%',
      title: 'Scholarship Programme',
      subtitle: 'For EWS Students',
      description: 'Income Between 6 Lacs and 8 Lacs',
    },
    {
      id: 3,
      percentage: '50%',
      title: 'Scholarship Programme',
      subtitle: 'For MERITORIOUS Students',
      description: 'All Categories...All Income Groups',
    },
  ];

  return (
    <Layout>
  <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
   
        {/* Welcome Section */}
        <Text style={styles.welcomeText}>WELCOME</Text>
        
        <View style={styles.titleContainer}>
          <Text style={styles.titleLine1}>
            Dikshant <Text style={styles.freeText}>FREE</Text> Coaching
          </Text>
          <Text style={styles.titleLine2}>& Scholarship Programme</Text>
        </View>


        {/* Registration Info */}
        <View style={styles.registrationInfo}>
          <Text style={styles.registrationText}>
            <Text style={styles.scholarshipLabel}>Scholarship Programme</Text>
            <Text style={styles.normalText}> का लाभ लेने के लिये,</Text>
          </Text>
          <Text style={styles.registrationText}>
            <Text style={styles.normalText}>नीचे दिये गये बटन पर क्लिक करें और </Text>
            <Text style={styles.registrationLabel}>Registration</Text>
          </Text>
          <Text style={styles.registrationTextLast}>
            <Text style={styles.normalText}>की प्रक्रिया पूरी करें</Text>
          </Text>
        </View>

        {/* Scholarship Cards */}
        <View style={styles.cardsContainer}>
          {scholarshipOptions.map((option) => (
            <TouchableOpacity onPress={()=>navigation.navigate("ApplyScholarship")} key={option.id} style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.percentageText}>{option.percentage} {option.title}</Text>
                <Text style={styles.subtitleText}>
                  {option.subtitle.includes('EWS') ? (
                    <>
                      For <Text style={styles.ewsText}>EWS</Text> Students
                    </>
                  ) : (
                    <>
                      For <Text style={styles.meritText}>MERITORIOUS</Text> Students
                    </>
                  )}
                </Text>
                <Text style={styles.descriptionText}>{option.description}</Text>
              </View>
              <View style={styles.enterButton}>
                <Text style={styles.enterText}>Enter</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
    </Layout>
  
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 2,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  titleLine1: {
    fontSize: 20,
    textAlign: 'center',
    color: '#1F2937',
    fontWeight: '600',
  },
  freeText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  titleLine2: {
    fontSize: 20,
    textAlign: 'center',
    color: '#1F2937',
    fontWeight: '600',
  },
  hindiText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#EF4444',
    fontWeight: 'bold',
    marginTop: 20,
  },
  hindiSubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#1F2937',
    marginTop: 5,
  },
  registrationInfo: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  registrationText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
  },
  registrationTextLast: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
  },
  scholarshipLabel: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  registrationLabel: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  normalText: {
    color: '#1F2937',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 5,
  },
  ewsText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  meritText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 13,
    color: '#4B5563',
  },
  enterButton: {
    backgroundColor: '#EF4444',
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 5,
  },
  enterText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});