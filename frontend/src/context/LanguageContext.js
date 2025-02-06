import React, { createContext, useContext, useState } from "react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Definiera översättningar för alla språk
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
      logout: "Logga ut",
      login: "Logga in",
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
      logout: "Log out",
      login: "Log in",
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
      logout: "Wyloguj",
      login: "Zaloguj",
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
      logout: "Вийти",
      login: "Увійти",
      welcome: "Ласкаво просимо",
    },
  },
};

// Initiera i18next
i18n.use(initReactI18next).init({
  resources,
  lng: "sv", // standardspråk
  interpolation: {
    escapeValue: false,
  },
});

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState("sv");

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export default i18n;
