export class TaskModel {
  constructor(data) {
    this.id = data._id || data.id;
    this.title = data.title;
    this.description = data.description;
    this.status = data.status;
    this.assignedTo = data.assignedTo;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.comments = data.comments || [];
  }
} 