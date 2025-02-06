import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  sv: {
    translation: {
      // Allmänna
      loading: "Laddar...",
      error: "Ett fel uppstod",
      save: "Spara",
      cancel: "Avbryt",
      delete: "Radera",
      edit: "Redigera",
      close: "Stäng",

      // Login och användarhantering
      email: "E-postadress",
      password: "Lösenord",
      login: "Logga in",
      propertyManagement: "Fastighetsförvaltning",
      enterEmail: "Ange e-postadress",
      enterPassword: "Ange lösenord",

      // Uppgifter
      tasks: "Uppgifter",
      newTask: "Ny uppgift",
      title: "Titel",
      description: "Beskrivning",
      status: "Status",
      assignedTo: "Tilldelad till",
      deadline: "Deadline",
      actions: "Åtgärder",
      unassigned: "Ej tilldelad",
      addComment: "Lägg till kommentar",
      writeComment: "Skriv en kommentar...",
      noComments: "Inga kommentarer än",
      comments: "Kommentarer",
      noDate: "Inget datum",

      // Status
      pending: "Väntande",
      inProgress: "Pågående",
      completed: "Slutförd",
      cannotFix: "Kan ej åtgärdas",

      // Bekräftelser
      deleteConfirm: "Är du säker på att du vill radera denna uppgift?",

      // Felmeddelanden
      errorFetchingTasks: "Det gick inte att hämta uppgifterna",
      errorSavingTask: "Det gick inte att spara uppgiften",
      errorDeletingTask: "Det gick inte att radera uppgiften",
      errorAddingComment: "Det gick inte att lägga till kommentaren",
      errorFetchingUsers: "Det gick inte att hämta användarna",
      errorCreatingUser: "Det gick inte att skapa användaren",
      errorUpdatingUser: "Det gick inte att uppdatera användaren",
      errorDeletingUser: "Det gick inte att radera användaren",

      // Bekräftelser
      deleteUserConfirm: "Är du säker på att du vill radera denna användare?",

      // Navigation
      adminDashboard: "Admin Dashboard",
      dashboard: "Kontrollpanel",
      calendar: "Kalender",
      logout: "Logga ut",
      welcome: "Välkommen",

      // Användarhantering
      users: "Användare",
      newUser: "Ny användare",
      editUser: "Redigera användare",
      name: "Namn",
      email: "E-post",
      password: "Lösenord",
      role: "Roll",
      keepCurrentPassword: "Lämna tomt för att behålla nuvarande lösenord",
    },
  },
  en: {
    translation: {
      // General
      loading: "Loading...",
      error: "An error occurred",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      close: "Close",

      // Login och användarhantering
      email: "Email",
      password: "Password",
      login: "Log in",
      propertyManagement: "Property Management",
      enterEmail: "Enter email",
      enterPassword: "Enter password",

      // Tasks
      tasks: "Tasks",
      newTask: "New Task",
      title: "Title",
      description: "Description",
      status: "Status",
      assignedTo: "Assigned to",
      deadline: "Deadline",
      actions: "Actions",
      unassigned: "Unassigned",
      addComment: "Add Comment",
      writeComment: "Write a comment...",
      noComments: "No comments yet",
      comments: "Comments",
      noDate: "No date",

      // Status
      pending: "Pending",
      inProgress: "In Progress",
      completed: "Completed",
      cannotFix: "Cannot Fix",

      // Confirmations
      deleteConfirm: "Are you sure you want to delete this task?",

      // Error messages
      errorFetchingTasks: "Failed to fetch tasks",
      errorSavingTask: "Failed to save task",
      errorDeletingTask: "Failed to delete task",
      errorAddingComment: "Failed to add comment",
      errorFetchingUsers: "Failed to fetch users",
      errorCreatingUser: "Failed to create user",
      errorUpdatingUser: "Failed to update user",
      errorDeletingUser: "Failed to delete user",

      // Bekräftelser
      deleteUserConfirm: "Are you sure you want to delete this user?",

      // Navigation
      adminDashboard: "Admin Dashboard",
      dashboard: "Dashboard",
      calendar: "Calendar",
      logout: "Log out",
      welcome: "Welcome",

      // Användarhantering
      users: "Users",
      newUser: "New User",
      editUser: "Edit User",
      name: "Name",
      email: "Email",
      password: "Password",
      role: "Role",
      keepCurrentPassword: "Leave empty to keep current password",
    },
  },
  pl: {
    translation: {
      // Ogólne
      loading: "Ładowanie...",
      error: "Wystąpił błąd",
      save: "Zapisz",
      cancel: "Anuluj",
      delete: "Usuń",
      edit: "Edytuj",
      close: "Zamknij",

      // Login och användarhantering
      email: "E-mail",
      password: "Hasło",
      login: "Zaloguj się",
      propertyManagement: "Zarządzanie Nieruchomościami",
      enterEmail: "Wprowadź e-mail",
      enterPassword: "Wprowadź hasło",

      // Zadania
      tasks: "Zadania",
      newTask: "Nowe zadanie",
      title: "Tytuł",
      description: "Opis",
      status: "Status",
      assignedTo: "Przypisane do",
      deadline: "Termin",
      actions: "Akcje",
      unassigned: "Nieprzypisane",
      addComment: "Dodaj komentarz",
      writeComment: "Napisz komentarz...",
      noComments: "Brak komentarzy",
      comments: "Komentarze",
      noDate: "Brak daty",

      // Status
      pending: "Oczekujące",
      inProgress: "W trakcie",
      completed: "Zakończone",
      cannotFix: "Nie można naprawić",

      // Potwierdzenia
      deleteConfirm: "Czy na pewno chcesz usunąć to zadanie?",

      // Komunikaty błędów
      errorFetchingTasks: "Nie udało się pobrać zadań",
      errorSavingTask: "Nie udało się zapisać zadania",
      errorDeletingTask: "Nie udało się usunąć zadania",
      errorAddingComment: "Nie udało się dodać komentarza",
      errorFetchingUsers: "Nie udało się pobrać użytkowników",
      errorCreatingUser: "Nie udało się utworzyć użytkownika",
      errorUpdatingUser: "Nie udało się zaktualizować użytkownika",
      errorDeletingUser: "Nie udało się usunąć użytkownika",

      // Bekräftelser
      deleteUserConfirm: "Czy na pewno chcesz usunąć tego użytkownika?",

      // Navigation
      adminDashboard: "Panel administratora",
      dashboard: "Panel",
      calendar: "Kalendarz",
      logout: "Wyloguj",
      welcome: "Witamy",

      // Användarhantering
      users: "Użytkownicy",
      newUser: "Nowy użytkownik",
      editUser: "Edytuj użytkownika",
      name: "Nazwa",
      email: "E-mail",
      password: "Hasło",
      role: "Rola",
      keepCurrentPassword: "Pozostaw puste, aby zachować aktualne hasło",
    },
  },
  uk: {
    translation: {
      // Загальне
      loading: "Завантаження...",
      error: "Сталася помилка",
      save: "Зберегти",
      cancel: "Скасувати",
      delete: "Видалити",
      edit: "Редагувати",
      close: "Закрити",

      // Login och användarhantering
      email: "Електронна пошта",
      password: "Пароль",
      login: "Увійти",
      propertyManagement: "Управління Нерухомістю",
      enterEmail: "Введіть електронну пошту",
      enterPassword: "Введіть пароль",

      // Завдання
      tasks: "Завдання",
      newTask: "Нове завдання",
      title: "Назва",
      description: "Опис",
      status: "Статус",
      assignedTo: "Призначено",
      deadline: "Термін",
      actions: "Дії",
      unassigned: "Не призначено",
      addComment: "Додати коментар",
      writeComment: "Напишіть коментар...",
      noComments: "Коментарів ще немає",
      comments: "Коментарі",
      noDate: "Немає дати",

      // Статус
      pending: "Очікує",
      inProgress: "В процесі",
      completed: "Завершено",
      cannotFix: "Неможливо виправити",

      // Підтвердження
      deleteConfirm: "Ви впевнені, що хочете видалити це завдання?",

      // Повідомлення про помилки
      errorFetchingTasks: "Не вдалося отримати завдання",
      errorSavingTask: "Не вдалося зберегти завдання",
      errorDeletingTask: "Не вдалося видалити завдання",
      errorAddingComment: "Не вдалося додати коментар",
      errorFetchingUsers: "Не вдалося отримати користувачів",
      errorCreatingUser: "Не вдалося створити користувача",
      errorUpdatingUser: "Не вдалося оновити користувача",
      errorDeletingUser: "Не вдалося видалити користувача",

      // Bekräftelser
      deleteUserConfirm: "Ви впевнені, що хочете видалити цього користувача?",

      // Navigation
      adminDashboard: "Панель адміністратора",
      dashboard: "Панель",
      calendar: "Календар",
      logout: "Вийти",
      welcome: "Ласкаво просимо",

      // Användarhantering
      users: "Користувачі",
      newUser: "Новий користувач",
      editUser: "Редагувати користувача",
      name: "Ім'я",
      email: "Електронна пошта",
      password: "Пароль",
      role: "Роль",
      keepCurrentPassword: "Порожнім, щоб зберегти поточний пароль",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
