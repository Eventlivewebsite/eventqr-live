import { Role } from "./roles";

export const permissions = {
  [Role.SUPER_ADMIN]: ["*"],

  [Role.ADMIN]: [
    "client:create",
    "client:update",
    "event:create",
    "event:update",
    "album:create",
    "media:upload",
  ],

  [Role.STAFF]: [
    "media:upload",
    "album:view",
  ],
};