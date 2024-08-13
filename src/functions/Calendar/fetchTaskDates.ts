import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Timestamp } from 'firebase/firestore';

interface Task {
  deliveryDay: Timestamp;
  description: string;
  status: string;
  subjectId: string;
  taskId: string;
  taskName: string;
}

interface Subject {
  codeSubject: string;
  tasks: Map<string, Task>;
}

interface UserData {
  subjects: Record<
    string,
    { codeSubject: string; tasks: Record<string, Task> }
  >;
}

export const fetchTaskDates = async (): Promise<
  { deliveryDay: Date; description: string }[]
> => {
  const auth = getAuth();
  const taskDates: { deliveryDay: Date; description: string }[] = [];

  return new Promise((resolve, reject) => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, 'Users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data() as UserData;
            if (userData && userData.subjects) {
              Object.values(userData.subjects).forEach((subject) => {
                Object.values(subject.tasks).forEach((task) => {
                  const deliveryDay =
                    task.deliveryDay instanceof Timestamp
                      ? task.deliveryDay.toDate()
                      : new Date(task.deliveryDay.seconds * 1000); // Conversão alternativa
                  taskDates.push({
                    deliveryDay: deliveryDay,
                    description: task.description,
                  });
                });
              });
              resolve(taskDates);
            } else {
              resolve(taskDates);
            }
          } else {
            resolve(taskDates);
          }
        });

        // Cleanup listener on unmount
        return () => unsubscribeSnapshot();
      } else {
        resolve(taskDates);
      }
    });

    // Cleanup auth listener on unmount
    return () => unsubscribeAuth();
  });
};
