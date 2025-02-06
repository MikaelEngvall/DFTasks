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

      // Login
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

      // Navigation
      adminDashboard: "Admin Dashboard",
      dashboard: "Dashboard",
      calendar: "Kalender",
      logout: "Logga ut",
      welcome: "Välkommen",
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

      // Login
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

      // Navigation
      adminDashboard: "Admin Dashboard",
      dashboard: "Dashboard",
      calendar: "Calendar",
      logout: "Log out",
      welcome: "Welcome",
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

      // Login
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

      // Navigation
      adminDashboard: "Panel administratora",
      dashboard: "Panel",
      calendar: "Kalendarz",
      logout: "Wyloguj",
      welcome: "Witamy",
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

      // Login
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

      // Navigation
      adminDashboard: "Панель адміністратора",
      dashboard: "Панель",
      calendar: "Календар",
      logout: "Вийти",
      welcome: "Ласкаво просимо",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "sv",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
