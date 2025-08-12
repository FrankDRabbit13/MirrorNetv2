
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, Unsubscribe, updateDoc } from "firebase/firestore";
import { type User, checkAndResetTokens } from '@/lib/data';

interface UserContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  updateUser: (user: Partial<Omit<User, 'id' | 'email'>>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Hardcoded IDs for admin users
const ADMIN_USER_IDS = ["DEthL2hZ7tg45xIbq72qZGkVF7B3", "z6vurwBbkchxhMrZtifnUvKYWoD3"];

const guestUser: User = {
  id: 'guest',
  displayName: 'Guest User',
  email: 'guest@example.com',
  photoUrl: `https://placehold.co/100x100.png?text=G`,
  isPremium: true, // Provide premium access for guest mode
};


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(guestUser);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(false);

  // The original authentication logic is no longer needed for a public app.
  // We can keep the updateUser function in case you want to add user-specific features later.

  const updateUser = async (updatedFields: Partial<Omit<User, 'id' | 'email'>>) => {
    if (!user) {
        // In a real app, you might want to prompt the user to sign up here.
        console.log("Guest user cannot be updated.");
        return;
    }
    // This function would need to be adapted if you want guests to save preferences,
    // for example, by using localStorage.
    setUser(prevUser => ({...prevUser!, ...updatedFields}));
    return Promise.resolve();
  };

  const value = { user, firebaseUser, updateUser, loading };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
