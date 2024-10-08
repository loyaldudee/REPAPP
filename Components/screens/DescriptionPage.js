import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, BackHandler } from 'react-native';
import DatePicker from './DatePicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const DescriptionPage = ({ property, setSelectedProperty }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [username, setUsername] = useState('');
  const [showMeeting, setShowMeeting] = useState(false);

  useEffect(() => {
    // Fetch username from AsyncStorage
    const fetchUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error('Failed to fetch username:', error);
      }
    };
    fetchUsername();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const saveToWatchlist = async (bookingDetails) => {
    try {
      const watchlist = await AsyncStorage.getItem('watchlist');
      const watchlistArray = watchlist ? JSON.parse(watchlist) : [];
      watchlistArray.push(bookingDetails);
      await AsyncStorage.setItem('watchlist', JSON.stringify(watchlistArray));
      setBookingMessage('Booking saved to watchlist successfully!');
    } catch (error) {
      console.error('Error saving to watchlist:', error);
      setBookingMessage('Error saving to watchlist: ' + error.message);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      setBookingMessage('Please select a date and time');
      return;
    }

    const bookingDetails = {
      propertyName: property.ChildPropertyName,
      parentPropertyName: property.ParentPropertyName,
      date: selectedDate.toISOString().split('T')[0], // Just the date part
      time: selectedTime,
      username,
      organisationName: property.OrganisationName,
      ApprovalStatus: 'Pending',
    };

    saveToWatchlist(bookingDetails);
  };

  const handleStartMeeting = () => {
    setShowMeeting(true);
  };

  // Handle hardware back button press
  useEffect(() => {
    const onBackPress = () => {
      setSelectedProperty(null); // Navigate back to HomeScreen or previous component
      return true; // Prevent default back button behavior
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {showMeeting ? (
        <WebView
          source={{ uri: `https://meet.jit.si/your-meeting-room-${property.ChildPropertyName}` }}
          style={styles.webview}
        />
      ) : (
        <>
          <Image source={{ uri: property.imageUrl }} style={styles.image} />
          <Text style={styles.propertyName}>{property.ChildPropertyName}</Text>
          <Text style={styles.propertyPrice}>{property.Price}</Text>
          <Text style={styles.propertyDetail}>Area: {property.Area}</Text>
          <Text style={styles.propertyDescription}>{property.Description}</Text>
          <View style={styles.propertyStats}>
            <Text style={styles.stat}>Bath: {property.Bath}</Text>
            <Text style={styles.stat}>Bed: {property.Bedroom}</Text>
            <Text style={styles.stat}>Room: {property.Room}</Text>
          </View>

          <DatePicker
            date={selectedDate || new Date()}
            onDateChange={handleDateChange}
          />

          <Picker
            selectedValue={selectedTime}
            onValueChange={(itemValue) => setSelectedTime(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Time" value={null} />
            {[...Array(24).keys()].map((hour) => (
              <Picker.Item key={hour} label={`${hour}:00`} value={`${hour}:00`} />
            ))}
          </Picker>

          {selectedDate && selectedTime && (
            <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          )}

          {bookingMessage ? <Text style={styles.bookingMessage}>{bookingMessage}</Text> : null}

          <TouchableOpacity style={styles.meetingButton} onPress={handleStartMeeting}>
            <Text style={styles.meetingButtonText}>Start Video Call</Text>
          </TouchableOpacity>

          {/* Back button */}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
  },
  propertyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  propertyPrice: {
    fontSize: 18,
    color: '#888',
    marginTop: 10,
  },
  propertyDetail: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
  propertyDescription: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
  propertyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  stat: {
    fontSize: 14,
    color: '#888',
  },
  picker: {
    height: 50,
    width: '100%',
    marginTop: 20,
  },
  bookButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  bookingMessage: {
    marginTop: 20,
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
  },
  meetingButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#28a745',
    borderRadius: 5,
  },
  meetingButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  webview: {
    width: width,
    height: height - 40, // Adjust height to fit the screen
  },
});

export default DescriptionPage;
