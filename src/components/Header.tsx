import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Dialog } from 'primereact/dialog';
import { auth, db } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import formatDate from '../functions/FormatDate';
import { useNavigate } from 'react-router-dom';



interface ICreateBook {
  id: string;
  author: string;
  bookName: string;
  deliveryDay: Timestamp;
  status: string;
}

interface Task {
  id: string;
  codeSubject: string;
  taskName: string;
  deliveryDay: Timestamp;
  status: string;
  description: string;
}

interface Exam {
  id: string;
  code: string;
  date: Timestamp;
  room: string;
  status: string;
}

export default function GeneralHeader() {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [overdueBooks, setOverdueBooks] = useState<ICreateBook[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = doc(db, 'Users', user.uid);

        // Recuperar dados do usuário
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const data = userSnapshot.data();
          setProfileImageUrl(data.UserInfo?.profileImageUrl || null);

          // Recuperar livros atrasados
          if (data.books) {
            const overdue = Object.values(data.books).filter((bookData: ICreateBook) => {
              return bookData.status === 'Late';
            });
            setOverdueBooks(overdue);
          }

          // Recuperar tarefas atrasadas
          if (data.subjects) {
            const subjectsData = Object.values(data.subjects) as Task[];
            const today = new Date();

            const tasks = subjectsData.flatMap((item) => {
              return Object.keys(item.tasks).map((key) => {
                const task = item.tasks[key];
                const deliveryDay = task.deliveryDay.toDate();
                const delayDay = deliveryDay.setDate(
                  deliveryDay.getDate() + 1
                );
                let status = '';
                if (
                  delayDay < today &&
                  task.status != 'Finalized' &&
                  task.status != 'Deleted'
                ) {
                  status = 'Late';
                }
                if (
                  delayDay >= today &&
                  task.status != 'Finalized' &&
                  task.status != 'Deleted'
                ) {
                  status = 'Active';
                }
                if (task.status == 'Finalized') {
                  status = 'Finalized';
                }
                if (task.status == 'Deleted') {
                  status = 'Deleted';
                }

                return {
                  ...task,
                  id: key,
                  codeSubject: item.codeSubject,
                  status,
                } as Task;
              });
            });

            const overdueTasks = tasks.filter(task => task.status === 'Late');
            setOverdueTasks(overdueTasks);
          }

          // Recuperar provas
          if (data.subjects) {
            const subjectsData = Object.values(data.subjects);
            const today = new Date();
            const upcomingExams = subjectsData.flatMap((item: any) => {
              return Object.keys(item.exams).map((key: string) => {
                const exam = item.exams[key];
                const examDate = exam.date.toDate();
                const diffDays = Math.floor((examDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

                return {
                  ...exam,
                  id: key,
                  isUpcoming: diffDays >= 0 && diffDays <= 7,
                } as Exam;
              });
            }).filter(exam => exam.isUpcoming && exam.status !== 'Deleted');

            setUpcomingExams(upcomingExams);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleProfileClick = () => {
    navigate('/Profile');
  };

  const handleNotificationClick = () => {
    setShowNotification(true);
  };

  const hideNotificationDialog = () => {
    setShowNotification(false);
  };

  return (
    <div className="flex align-items-center justify-content-between border-round-lg p-2" style={{ height: '60px', width: '100%' }}>
      <div className="flex justify-content-between px-6">
      </div>
      <div className="flex align-items-center" style={{ marginLeft: 'auto' }}>
        <Button
          icon="pi pi-bell p-overlay-badge"
          rounded
          text
          size="small"
          badge={overdueBooks.length + overdueTasks.length + upcomingExams.length > 0 ? `${overdueBooks.length + overdueTasks.length + upcomingExams.length}` : ''}
          badgeClassName="p-badge-danger"
          link
          onClick={handleNotificationClick}
        />
        <Button
          icon="pi pi-inbox p-overlay-badge"
          rounded
          text
          size="small"
          link
        />
        <Button className="" rounded text onClick={handleProfileClick}>
          <Avatar
            image={profileImageUrl || undefined}
            icon={!profileImageUrl ? 'pi pi-user' : undefined}
            size="small"
            className="mr-2"
            shape="circle"
          />
        </Button>
      </div>

      <Dialog header="Notificações" visible={showNotification} onHide={hideNotificationDialog} style={{ width: '350px' }}>
        {overdueBooks.length > 0 && (
          <>
            <h4 className='mt-2'>Livros Atrasados</h4>
            <ul>
              {overdueBooks.map((book) => (
                <li key={book.id}>
                  {book.bookName} - {book.author}
                </li>
              ))}
            </ul>
          </>
        )}
        {overdueTasks.length > 0 && (
          <>
            <h4>Tarefas Atrasadas</h4>
            <ul>
              {overdueTasks.map((task) => (
                <li key={task.id}>
                  {task.codeSubject} - {task.taskName}
                </li>
              ))}
            </ul>
          </>
        )}
        {upcomingExams.length > 0 && (
          <>
            <h4>Provas se Aproximando</h4>
            <ul>
              {upcomingExams.map((exam) => (
                <li key={exam.id}>
                  {exam.code} - {formatDate(exam.date)}
                </li>
              ))}
            </ul>
          </>
        )}
        {overdueBooks.length === 0 && overdueTasks.length === 0 && upcomingExams.length === 0 && (
          <p>Nenhum item atrasado ou prova próxima</p>
        )}
      </Dialog>
    </div>
  );
}
