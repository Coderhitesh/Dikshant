import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from '../../components/Button'
import { useAuthStore } from '../../stores/auth.store'
import { useNavigation } from '@react-navigation/native';
import Layout from '../../components/layout'
import Greet from '../../components/Greet'
import Slider from '../../components/slider'
import Categories from '../../components/Categories'
import Course from '../../screens/courses/Courses'
export default function Home() {
  const navigation = useNavigation()
  return (
    <Layout>
      <Greet />
      <Slider />

      <Categories />
      <Course/>
    </Layout>

  )
}