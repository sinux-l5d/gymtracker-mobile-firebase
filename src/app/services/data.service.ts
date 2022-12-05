import { Injectable } from "@angular/core";
import {
  addDoc,
  arrayUnion,
  collection,
  collectionData,
  CollectionReference,
  deleteDoc,
  doc,
  docData,
  DocumentReference,
  Firestore,
  Timestamp,
  updateDoc,
} from "@angular/fire/firestore";
import { firstValueFrom, map, Observable } from "rxjs";
import {
  Exercise,
  NewExercise,
  NewSession,
  Session,
  SessionWithDuration,
} from "src/types/db";

@Injectable({
  providedIn: "root",
})
export class DataService {
  constructor(private firestore: Firestore) {
    // this.addSession({
    //   name: "Work legs with John",
    //   startAt: Timestamp.now(),
    //   // end in 1 hour
    //   endAt: Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60)),
    //   location: "Dkit Sport",
    //   exercises: [
    //     {
    //       name: "Squat",
    //       note: "Medium difficulty",
    //       repetitions: 30,
    //       weight: 60,
    //     },
    //     {
    //       name: "Deadlift",
    //       note: "Hard difficulty",
    //       repetitions: 20,
    //       weight: 80,
    //     },
    //     {
    //       name: "Leg press",
    //       note: "Easy difficulty",
    //       repetitions: 40,
    //       weight: 40,
    //     },
    //   ],
    // });
  }

  getSessions(): Observable<SessionWithDuration[]> {
    const sessionsRef = collection(
      this.firestore,
      "sessions",
    ) as CollectionReference<Session>;
    return collectionData(sessionsRef, { idField: "id" }).pipe(
      map((sessions) => sessions.map(this.addDurationToSession)),
    );
  }

  getSessionById(id: string): Observable<SessionWithDuration | undefined> {
    const sessionRef = doc(this.firestore, "sessions", id) as DocumentReference<
      Session
    >;
    return docData(sessionRef, { idField: "id" }).pipe(
      map((session) => this.addDurationToSession(session)),
    );
  }

  addDurationToSession(session: Session): SessionWithDuration {
    return {
      ...session,
      duration: session.endAt.toDate().getTime() -
        session.startAt.toDate().getTime(),
    };
  }

  addSession(session: NewSession) {
    const realSession = {
      ...session,
      // If exercices is undefined, set it to an empty array
      exercises: session.exercises ?? [],
    } as Session; // thought it still doesn't have an id

    realSession.exercises.forEach((exercise, index, array) => {
      array[index] = {
        ...exercise,
        id: this.newId(), // generate a new id
      };
    });

    const sessionsRef = collection(
      this.firestore,
      "sessions",
    ) as CollectionReference<Session>;
    return addDoc(sessionsRef, realSession);
  }

  deleteSession(id: string) {
    const sessionRef = doc(this.firestore, "sessions", id) as DocumentReference<
      Session
    >;
    return deleteDoc(sessionRef);
  }

  updateSession(id: string, session: Partial<NewSession>): Promise<void> {
    const sessionRef = doc(this.firestore, "sessions", id) as DocumentReference<
      Session
    >;
    return updateDoc(sessionRef, session);
  }

  async addExercise(id: string, exercise: NewExercise): Promise<void> {
    const sessionRef = doc(this.firestore, "sessions", id) as DocumentReference<
      Session
    >;

    // retriving the exercises because arrayUnion() is not adding duplicates
    // And we might have duplicates if the user does 2 times the same exercise in one session, with same reps
    let { exercises: oldExercises } = await firstValueFrom(
      docData(sessionRef, { idField: "id" }),
    );
    oldExercises = oldExercises ?? [];
    return updateDoc(sessionRef, {
      exercises: [...oldExercises, {
        ...exercise,
        id: this.newId(), // generate a new id
      }],
    });
  }

  async updateExercise(
    idSession: string,
    exercise: Partial<Exercise>,
  ): Promise<void> {
    const sessionRef = doc(
      this.firestore,
      "sessions",
      idSession,
    ) as DocumentReference<
      Session
    >;

    let { exercises: oldExercises } = await firstValueFrom(
      docData(sessionRef, { idField: "id" }),
    );

    return updateDoc(sessionRef, {
      exercises: oldExercises.map((oldExercise) => {
        if (oldExercise.id === exercise.id) {
          return {
            ...oldExercise,
            ...exercise,
          };
        }
        return oldExercise;
      }),
    });
  }

  newId() {
    const sessionsRef = collection(
      this.firestore,
      "sessions",
    ) as CollectionReference<Session>;

    return doc(sessionsRef).id;
  }
}
