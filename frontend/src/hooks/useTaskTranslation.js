import { useTranslation } from "react-i18next";
import { translateContent } from "../utils/translateContent";

export const useTaskTranslation = () => {
  const { t, i18n } = useTranslation();

  const translateTask = async (task) => {
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
    };
  };

  const translateTasks = async (tasks) => {
    if (!Array.isArray(tasks)) return [];
    return Promise.all(tasks.map(translateTask));
  };

  const translateComments = async (comments) => {
    if (!Array.isArray(comments)) return [];
    return Promise.all(
      comments.map(async (comment) => ({
        ...comment,
        content: await translateContent(comment.content, i18n.language),
        createdBy: comment.createdBy || { name: t("unassigned") },
      }))
    );
  };

  return {
    translateTask,
    translateTasks,
    translateComments,
    currentLanguage: i18n.language,
  };
};
