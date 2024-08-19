import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface Task {
  deliveryDay: {
    seconds: number;
    nanoseconds: number;
  };
  description: string;
  status: string; // Adiciona o campo de status
  subjectId: string;
  taskId: string;
  taskName: string;
}

interface Subject {
  codeSubject: string;
  tasks: Map<string, Task>;
  status: string; // Novo campo adicionado
}

interface UserData {
  subjects: Record<
    string,
    { codeSubject: string; tasks: Record<string, Task>; status: string }
  >;
}

export default function DataTarefas() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Map<string, Subject>>(new Map());

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);

        const userDocRef = doc(db, 'Users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data() as UserData;
            if (userData && userData.subjects) {
              const subjectsMap = new Map(
                Object.entries(userData.subjects).map(
                  ([subjectId, subjectData]) => {
                    const tasksMap = new Map(Object.entries(subjectData.tasks));
                    return [
                      subjectId,
                      {
                        codeSubject: subjectData.codeSubject,
                        tasks: tasksMap,
                        status: subjectData.status, // Captura o status aqui
                      },
                    ];
                  }
                )
              );
              setSubjects(subjectsMap);
            }
          }
        });

        // Cleanup listener on unmount
        return () => unsubscribeSnapshot();
      } else {
        setCurrentUserId(null);
      }
    });

    // Cleanup auth listener on unmount
    return () => unsubscribeAuth();
  }, []);

  if (!currentUserId) {
    return <p>Loading...</p>;
  }

  const renderTasks = (tasks: Map<string, Task>) => {
    return Array.from(tasks.values())
      .filter((task) => task.status !== 'Deleted') // Filtra tarefas com status "Deleted"
      .map((task, index) => (
        <li key={index} className="flex align-items-center mb-3">
          <i className="pi pi-angle-right mr-2 text-green-500" />
          {new Date(
            task.deliveryDay.seconds * 1000
          ).toLocaleDateString()} : {task.description}
        </li>
      ));
  };

  const filteredSubjects = Array.from(subjects.entries())
    .filter(
      ([, subject]) => subject.tasks.size > 0 && subject.status !== 'Deleted'
    ) // Filtra matérias com status "Deleted"
    .filter(([, subject]) =>
      Array.from(subject.tasks.values()).some(
        (task) => task.status !== 'Deleted'
      )
    ); // Filtra matérias onde todas as tarefas estão "Deleted"

  return (
    <div className="col-12 lg:col-4">
      <div className="p-3 h-full">
        <div className="shadow-2 p-3 h-full flex flex-column surface-card">
          <div className="text-900 font-medium text-xl mb-2">
            🔵 Datas de Tarefas
          </div>

          <hr className="my-3 mx-0 border-top-1 border-bottom-none surface-border" />
          <div className="flex align-items-center"></div>

          <ul className="list-none p-0 m-0 flex-grow-1">
            {filteredSubjects.map(([subjectId, subject]) => (
              <li key={subjectId} className="flex flex-column mb-3">
                <div className="font-bold mb-2">
                  Código da Matéria: {subject.codeSubject}
                </div>
                <ul>{renderTasks(subject.tasks)}</ul>
              </li>
            ))}
          </ul>

          <hr className="mb-3 mx-0 border-top-1 border-bottom-none surface-border mt-auto" />
        </div>
      </div>
    </div>
  );
}
