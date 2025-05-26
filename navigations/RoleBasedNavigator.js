// src/navigation/RoleBasedNavigator.js
import React, { useContext } from 'react';
import StudentDrawerNavigator from './StudentDrawerNavigator';
import TeacherDrawerNavigator from './TeacherDrawerNavigator';
import AdminHome from '../screens/Admin/AdminHome';
import { AuthContext } from '../context/AuthContext';

export default function RoleBasedNavigator({navigation}) {
    const { user, profile } = useContext(AuthContext);

    if (!user) return null;

    switch (user.role) {
        case 'student':
            return <StudentDrawerNavigator user={user} profile={profile} navigation={navigation} />;
        case 'teacher':
            return <TeacherDrawerNavigator user={user} teacher={profile} navigation={navigation} />;
        default:
            return <AdminHome user={user} teacher={profile} navigation={navigation} />;
    }
}
