import { Timestamp } from "@angular/fire/firestore";

export type NewExercise = {
  name: string;
  note: string;
  repetitions: number;
  weight: number; // kg
};

export type Exercise = NewExercise & {
  id: string;
};

export type NewSession = {
  name: string;
  startAt: Timestamp;
  endAt: Timestamp;
  location: string;
  exercises?: NewExercise[];
};

export type Session = Omit<NewSession, "exercises"> & {
  id: string;
  exercises: Exercise[];
};

export type SessionWithDuration = Session & {
  duration: number;
};
