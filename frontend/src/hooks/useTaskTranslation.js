import { useTranslation } from "react-i18next";
import { translateContent } from "../utils/translateContent";
import { useMemo } from "react";

export const useTaskTranslation = () => {
  const { t, i18n } = useTranslation();

  const translateTask = useMemo(
    () => async (task) => {
      if (!task) return null;

      const translatedTitle = await translateContent(task.title, i18n.language);
      const translatedDesc = await translateContent(
        task.description,
        i18n.language
      );

      const translatedComments = await Promise.all(
        (task.comments || []).map(async (comment) => ({
          ...comment,
          content: await translateContent(comment.content, i18n.language),
          createdBy: comment.createdBy || { name: t("unassigned") },
        }))
      );

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

      return Promise.all(
        tasks.map(async (task) => {
          // Skippa översättning om uppgiften redan är översatt till rätt språk
          if (task._translated && task._translatedLang === i18n.language) {
            return task;
          }
          return translateTask(task);
        })
      );
    },
    [translateTask, i18n.language]
  );

  const translateComments = useMemo(
    () => async (comments) => {
      if (!Array.isArray(comments)) return [];

      return Promise.all(
        comments.map(async (comment) => {
          // Skippa översättning om kommentaren redan är översatt till rätt språk
          if (
            comment._translated &&
            comment._translatedLang === i18n.language
          ) {
            return comment;
          }
          return {
            ...comment,
            content: await translateContent(comment.content, i18n.language),
            createdBy: comment.createdBy || { name: t("unassigned") },
            _translated: true,
            _translatedLang: i18n.language,
          };
        })
      );
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
