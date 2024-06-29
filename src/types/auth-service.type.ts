import { Role } from "../auth/roles/role.enum.js";

export interface IAuthService {
  signIn(username: string, password: string): Promise<{ accessToken: string; }>;

  hasGrant(subjectId: string, roles: Role): Promise<boolean>;
}
