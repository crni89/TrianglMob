import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Uvoz ekrana za profesora
import TeacherHome from '../screens/Teacher/TeacherHomeScreen.js';
import ProfessorSchedule from '../screens/Teacher/TeacherScheduleScreen.js';
import ProfessorAttendance from '../screens/Teacher/ProffesorAttendance.js';
import ProfessorReviews from '../screens/Teacher/ProfessorReviews.js';
import ProfessorMaterials from '../screens/Teacher/ProfessorMaterials.js';

const Tab = createBottomTabNavigator();

export default function ProfessorTabNavigator({route}) {

    const user = route.params.user;
    const teacher = route.params.teacher;


  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#e87a25',
        tabBarInactiveTintColor: '#050404',
        tabBarStyle: { backgroundColor: '#ffffff' },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Schedule':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Attendance':
              iconName = focused ? 'qr-code' : 'qr-code-outline';
              break;
            case 'Reviews':
              iconName = focused ? 'star' : 'star-outline';
              break;
            case 'Materials':
              iconName = focused ? 'book' : 'book-outline';
              break;
            default:
              iconName = 'help-circle';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={TeacherHome} initialParams={{ user, teacher }}/>
      <Tab.Screen name="Schedule" component={ProfessorSchedule} />
      <Tab.Screen name="Attendance" component={ProfessorAttendance} />
      <Tab.Screen name="Reviews" component={ProfessorReviews} />
      <Tab.Screen name="Materials" component={ProfessorMaterials} />
    </Tab.Navigator>
  );
}
