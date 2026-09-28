/** Matches the backend's UserDto — a member as returned for a group. */
export interface GroupMember {
  readonly id: string;
  readonly username: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly isAdmin: boolean;
}
