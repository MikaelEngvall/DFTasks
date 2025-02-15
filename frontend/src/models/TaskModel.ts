export class TaskModel {
  id: string;
  title: string;
  description: string;
  status: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  comments: any[];

  constructor(data: any) {
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