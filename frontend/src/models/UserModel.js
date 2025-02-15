export class UserModel {
  constructor(data) {
    this.id = data._id || data.id;
    this.email = data.email;
    this.name = data.name;
    this.role = data.role;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
} 