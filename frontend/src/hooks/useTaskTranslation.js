import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export const useTaskTranslation = () => {
  const { t, i18n } = useTranslation();

  const translateTask = useMemo(
    () => async (task) => {
      if (!task) return null;

      // Använd lagrade översättningar för titel och beskrivning om de finns
      const translatedTitle =
        task.translations?.[i18n.language]?.title || task.title;
      const translatedDesc =
        task.translations?.[i18n.language]?.description || task.description;

      // Översätt kommentarer med lagrade översättningar
      const translatedComments = (task.comments || []).map((comment) => ({
        ...comment,
        content: comment.translations?.[i18n.language] || comment.content,
        createdBy: comment.createdBy || { name: t("unassigned") },
      }));

      return {
        ...task,
        title: translatedTitle,
        description: translatedDesc,
        comments: translatedComments,
        _translated: true,
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
