// screens/Home/Home.js (या जहां आपका Home component है)

import { View, Text } from 'react-native';
import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import Layout from '../../components/layout';
import Greet from '../../components/Greet';
import Slider from '../../components/slider';
import Categories from '../../components/Categories';
import Course from '../../screens/courses/Courses';
import Scholarship from '../../components/Scholarship';
import Announcement from '../../components/Announcement';

export default function Home() {
  const navigation = useNavigation();

  const [refreshing, setRefreshing] = useState(false);

  // Refresh handler – आप यहाँ सभी APIs को फिर से call कर सकते हैं
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
    
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <Layout isRefreshing={refreshing} onRefresh={onRefresh}>
     <Greet refreshing={refreshing} />
      <Slider refreshing={refreshing} />
      <Announcement refreshing={refreshing} />
      <Categories refreshing={refreshing} />
      <Scholarship refreshing={refreshing} />
      <Course refreshing={refreshing} />
    </Layout>
  );
}