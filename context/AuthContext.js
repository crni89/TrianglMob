// front/context/AuthContext.js

import React, { createContext, useState } from 'react';

export const AuthContext = createContext({
    user: null,
    profile: null,
    setUser: () => {},
    setProfile: () => {},
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);

    return (
        <AuthContext.Provider value={{ user, profile, setUser, setProfile }}>
            {children}
        </AuthContext.Provider>
    );
}
