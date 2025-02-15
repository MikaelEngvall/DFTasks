export class User {
  constructor(data) {
    this._id = data._id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
    this.preferredLanguage = data.preferredLanguage;
  }
}

export default User; 