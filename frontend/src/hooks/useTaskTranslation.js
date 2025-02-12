import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export const useTaskTranslation = () => {
  const { t, i18n } = useTranslation();

  const translateTask = useMemo(
    () => async (task) => {
      if (!task) return null;

      let translatedTitle = task.title;
      let translatedDesc = task.description;

      if (task.translations && task.translations[i18n.language]) {
        translatedTitle = task.translations[i18n.language].title || task.title;
        translatedDesc =
          task.translations[i18n.language].description || task.description;
      }

      const translatedComments = (task.comments || []).map((comment) => {
        let commentContent = comment.content;
        if (comment.translations && comment.translations[i18n.language]) {
          commentContent = comment.translations[i18n.language];
        }
        return {
          ...comment,
          content: commentContent,
          createdBy: comment.createdBy || { name: t("unassigned") },
        };
      });

      return {
        ...task,
        title: translatedTitle,
        description: translatedDesc,
        comments: translatedComments,
        _translatedLang: i18n.language,
      };
    },
    [i18n.language, t]
  );

  const translateTasks = useMemo(
    () => async (tasks) => {
      if (!Array.isArray(tasks)) return [];
      return Promise.all(tasks.map(translateTask));
    },
    [translateTask]
  );

  const translateComments = useMemo(
    () => async (comments) => {
      if (!Array.isArray(comments)) return [];

      return comments.map((comment) => ({
        ...comment,
        content: comment.translations?.[i18n.language] || comment.content,
        createdBy: comment.createdBy || { name: t("unassigned") },
        _translated: true,
        _translatedLang: comment.translations?.[i18n.language]
          ? i18n.language
          : "en",
      }));
    },
    [i18n.language, t]
  );

  return {
    translateTask,
    translateTasks,
    translateComments,
    currentLanguage: i18n.language,
  };
};
