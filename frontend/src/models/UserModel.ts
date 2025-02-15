export class UserModel {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;

  constructor(data: any) {
    this.id = data._id || data.id;
    this.email = data.email;
    this.name = data.name;
    this.role = data.role;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
} 