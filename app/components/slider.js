import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

// Images
import img1 from "../assets/images/banner1.jpeg";
import img2 from "../assets/images/banner-2.jpeg";
import img3 from "../assets/images/online-course-hero.jpeg";


const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_HEIGHT = SCREEN_WIDTH * 0.35;
const images = [img1, img3, img2];
const AUTO_PLAY_INTERVAL = 3000;

export default function Slider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // Auto-play effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % images.length;
        scrollToIndex(next);
        return next;
      });
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Scroll to index with animation
  const scrollToIndex = (index) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ animated: true, index });
    }
  };

  // Handle manual scroll end
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item} style={styles.image} resizeMode="cover" />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Slider */}
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        getItemLayout={(data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {images.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
            onPress={() => {
              setCurrentIndex(index);
              scrollToIndex(index);
            }}
            activeOpacity={0.7}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SLIDE_HEIGHT,
    position: "relative",
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SLIDE_HEIGHT,
  },
  image: {
    width: "100%",
    height: "100%",

  },
  pagination: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#fff",
    width: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  inactiveDot: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
});