import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  getDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { CheckIn, DailySpoons, Activity } from "../types";

// --- CheckIns ---

export const subscribeToCheckIns = (userId: string, callback: (data: CheckIn[]) => void) => {
  const q = query(
    collection(db, "users", userId, "checkins"),
    orderBy("timestamp", "desc"),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const checkIns: CheckIn[] = [];
    snapshot.forEach((doc) => {
      checkIns.push({ ...doc.data(), id: doc.id } as CheckIn);
    });
    callback(checkIns);
  });
};

export const addCheckInToDb = async (userId: string, checkIn: Omit<CheckIn, 'id'>) => {
  await addDoc(collection(db, "users", userId, "checkins"), checkIn);
};

// --- Spoons ---

export const subscribeToSpoons = (userId: string, callback: (data: DailySpoons | null) => void) => {
  const docRef = doc(db, "users", userId, "settings", "spoons");
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as DailySpoons);
    } else {
      callback(null);
    }
  });
};

export const saveSpoonsToDb = async (userId: string, spoons: DailySpoons) => {
  const docRef = doc(db, "users", userId, "settings", "spoons");
  await setDoc(docRef, spoons);
};

// --- Activities ---

export const subscribeToActivities = (userId: string, callback: (data: Activity[]) => void) => {
  const q = collection(db, "users", userId, "activities");
  return onSnapshot(q, (snapshot) => {
    const acts: Activity[] = [];
    snapshot.forEach((doc) => {
      acts.push({ ...doc.data(), id: doc.id } as Activity);
    });
    callback(acts);
  });
};

export const addActivityToDb = async (userId: string, activity: Activity) => {
  // We use activity.id as the doc ID to ensure consistency if we generate it client side
  await setDoc(doc(db, "users", userId, "activities", activity.id), activity);
};

export const updateActivityInDb = async (userId: string, activity: Activity) => {
  await setDoc(doc(db, "users", userId, "activities", activity.id), activity, { merge: true });
};

export const deleteActivityFromDb = async (userId: string, activityId: string) => {
  await deleteDoc(doc(db, "users", userId, "activities", activityId));
};

// --- Onboarding Status ---
export const setOnboardingSeen = async (userId: string) => {
  await setDoc(doc(db, "users", userId, "settings", "onboarding"), { seen: true }, { merge: true });
};

export const checkOnboardingStatus = async (userId: string): Promise<boolean> => {
  const docRef = doc(db, "users", userId, "settings", "onboarding");
  const snap = await getDoc(docRef);
  return snap.exists() && snap.data().seen === true;
};