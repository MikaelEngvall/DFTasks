import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axios";

export default function TaskDetailScreen({ route, navigation }) {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();

  const fetchTask = async () => {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}`);
      setTask(response.data.task);
    } catch (error) {
      console.error("Error fetching task:", error);
      Alert.alert(t("error"), t("errorFetchingTask"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axiosInstance.patch(`/tasks/${taskId}/status`, {
        status: newStatus,
      });
      fetchTask();
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert(t("error"), t("errorUpdatingStatus"));
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await axiosInstance.post(`/tasks/${taskId}/comments`, {
        content: comment.trim(),
      });
      setComment("");
      fetchTask();
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert(t("error"), t("errorAddingComment"));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return styles.statusPending;
      case "in progress":
        return styles.statusInProgress;
      case "completed":
        return styles.statusCompleted;
      case "cannot fix":
        return styles.statusCannotFix;
      default:
        return styles.statusDefault;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B365D" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("taskNotFound")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{task.title}</Text>
          <View style={[styles.statusBadge, getStatusStyle(task.status)]}>
            <Text style={styles.statusText}>{t(task.status)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("description")}</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("details")}</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t("assignedTo")}</Text>
              <Text style={styles.detailValue}>
                {task.assignedTo?.name || t("unassigned")}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t("dueDate")}</Text>
              <Text style={styles.detailValue}>
                {format(new Date(task.dueDate), "yyyy-MM-dd")}
              </Text>
            </View>
          </View>
        </View>

        {(user?.role === "ADMIN" || task.assignedTo?._id === user?._id) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("updateStatus")}</Text>
            <View style={styles.statusButtons}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {["pending", "in progress", "completed", "cannot fix"].map(
                  (status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusButton,
                        task.status === status && styles.statusButtonActive,
                      ]}
                      onPress={() => handleStatusUpdate(status)}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          task.status === status &&
                            styles.statusButtonTextActive,
                        ]}
                      >
                        {t(status)}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("comments")}</Text>
          <View style={styles.commentsList}>
            {task.comments?.map((comment) => (
              <View key={comment._id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>
                    {comment.createdBy?.name}
                  </Text>
                  <Text style={styles.commentDate}>
                    {format(new Date(comment.createdAt), "yyyy-MM-dd HH:mm")}
                  </Text>
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            ))}
          </View>

          <View style={styles.addComment}>
            <TextInput
              style={styles.commentInput}
              placeholder={t("writeComment")}
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity
              style={styles.commentButton}
              onPress={handleAddComment}
              disabled={submitting || !comment.trim()}
            >
              <Text style={styles.commentButtonText}>
                {submitting ? t("sending") : t("send")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#E53E3E",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B365D",
    flex: 1,
    marginRight: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B365D",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  detailItem: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#2D3748",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
  },
  statusInProgress: {
    backgroundColor: "#DBEAFE",
  },
  statusCompleted: {
    backgroundColor: "#D1FAE5",
  },
  statusCannotFix: {
    backgroundColor: "#FEE2E2",
  },
  statusDefault: {
    backgroundColor: "#E5E7EB",
  },
  statusButtons: {
    flexDirection: "row",
    marginHorizontal: -4,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: "#EDF2F7",
    marginHorizontal: 4,
  },
  statusButtonActive: {
    backgroundColor: "#1B365D",
  },
  statusButtonText: {
    color: "#4A5568",
    fontSize: 14,
    fontWeight: "500",
  },
  statusButtonTextActive: {
    color: "white",
  },
  commentsList: {
    marginBottom: 16,
  },
  commentItem: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2D3748",
  },
  commentDate: {
    fontSize: 12,
    color: "#718096",
  },
  commentContent: {
    fontSize: 14,
    color: "#4A5568",
  },
  addComment: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
  },
  commentInput: {
    backgroundColor: "#EDF2F7",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    minHeight: 80,
    textAlignVertical: "top",
  },
  commentButton: {
    backgroundColor: "#1B365D",
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
  },
  commentButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
