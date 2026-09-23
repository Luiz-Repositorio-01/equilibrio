import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { createHmac, timingSafeEqual } from "crypto";
import { adminConfig } from "./site";
import { hasBlobStore, loadUsersFromBlob, saveUsersToBlob } from "./users-blob";

export type UserRole = "admin" | "editor" | "author";

export type CmsUser = {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  mustChangePassword: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  resetToken?: string;
  resetTokenExpiresAt?: string;
};

const USERS_PATH = path.join(process.cwd(), "content", "data", "users.json");
const RESET_TTL_MS = 60 * 60 * 1000;

/** In-memory cache (hydrated from disk / Blob). */
let cache: CmsUser[] | null = null;
let blobHydrated = false;

function ensure() {
  fs.mkdirSync(path.dirname(USERS_PATH), { recursive: true });
}

function readUsersDisk(): CmsUser[] {
  ensure();
  if (!fs.existsSync(USERS_PATH)) return [];
  const raw = fs.readFileSync(USERS_PATH, "utf-8").replace(/^\uFEFF/, "");
  return JSON.parse(raw) as CmsUser[];
}

function writeUsersDisk(users: CmsUser[]) {
  ensure();
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), "utf-8");
}

function readUsers(): CmsUser[] {
  if (cache) return cache;
  cache = readUsersDisk();
  return cache;
}

function writeUsers(users: CmsUser[]) {
  cache = users;
  try {
    writeUsersDisk(users);
  } catch {
    // Vercel may be read-only; Blob + memory still hold the data.
  }
  if (hasBlobStore()) {
    void saveUsersToBlob(users);
  }
}

async function hydrateFromBlob() {
  if (blobHydrated || !hasBlobStore()) return;
  blobHydrated = true;
  const remote = await loadUsersFromBlob<CmsUser>();
  if (remote && remote.length > 0) {
    cache = remote;
  }
}

export function publicUser(user: CmsUser) {
  const { passwordHash: _, resetToken: __, resetTokenExpiresAt: ___, ...safe } = user;
  return safe;
}

function signResetPayload(userId: string, email: string, exp: number) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, email, exp }), "utf8").toString(
    "base64url"
  );
  const sig = createHmac("sha256", adminConfig.sessionSecret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyResetPayload(token: string): { uid: string; email: string } | null {
  const [payload, sig] = String(token || "").split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", adminConfig.sessionSecret).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      uid?: string;
      email?: string;
      exp?: number;
    };
    if (!data.uid || !data.email || !data.exp || data.exp < Date.now()) return null;
    return { uid: data.uid, email: data.email };
  } catch {
    return null;
  }
}

export async function ensureBootstrapAdmin(): Promise<CmsUser> {
  await hydrateFromBlob();
  const users = readUsers();
  const username = adminConfig.username || "antonio.ptp2011@gmail.com";
  const email = (adminConfig.email || username).toLowerCase();
  const now = new Date().toISOString();

  if (users.length > 0) {
    const idx = users.findIndex((u) => u.role === "admin");
    const i = idx >= 0 ? idx : 0;
    const prev = users[i];
    users[i] = {
      ...prev,
      username,
      email,
      mustChangePassword: false,
      active: true,
      updatedAt: now,
    };
    if (adminConfig.passwordHash) {
      users[i].passwordHash = adminConfig.passwordHash;
    } else if (process.env.FORCE_ADMIN_PASSWORD_SYNC === "1" && adminConfig.password) {
      users[i].passwordHash = await bcrypt.hash(adminConfig.password, 10);
    }
    if (
      prev.username !== users[i].username ||
      prev.email !== users[i].email ||
      prev.passwordHash !== users[i].passwordHash ||
      prev.mustChangePassword
    ) {
      writeUsers(users);
    }
    return users[i];
  }

  const password = adminConfig.password || "#06V17@As";
  const passwordHash = adminConfig.passwordHash || (await bcrypt.hash(password, 10));
  const admin: CmsUser = {
    id: "user-admin-1",
    username,
    email,
    name: "Administrador",
    role: "admin",
    passwordHash,
    mustChangePassword: false,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  writeUsers([admin]);
  return admin;
}

export function listUsers() {
  void ensureBootstrapAdmin();
  return readUsers().map(publicUser);
}

export function getUserByUsername(username: string) {
  void ensureBootstrapAdmin();
  return readUsers().find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export function getUserById(id: string) {
  void ensureBootstrapAdmin();
  return readUsers().find((u) => u.id === id) || null;
}

export function getUserByEmail(email: string) {
  void ensureBootstrapAdmin();
  return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function verifyUserCredentials(username: string, password: string) {
  await ensureBootstrapAdmin();
  const login = String(username || "").trim().toLowerCase();
  const users = readUsers();
  const user =
    users.find((u) => u.username.toLowerCase() === login) ||
    users.find((u) => u.email.toLowerCase() === login) ||
    null;
  if (!user || !user.active) {
    const adminLogin = (adminConfig.username || "").toLowerCase();
    const adminEmail = (adminConfig.email || "").toLowerCase();
    if (login === adminLogin || login === adminEmail) {
      if (password === adminConfig.password) {
        return ensureBootstrapAdmin();
      }
      if (adminConfig.passwordHash && (await bcrypt.compare(password, adminConfig.passwordHash))) {
        return ensureBootstrapAdmin();
      }
    }
    return null;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (ok) return user;
  if (user.role === "admin" && password === adminConfig.password) {
    return user;
  }
  return null;
}

export async function createUser(input: {
  username: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
  mustChangePassword?: boolean;
}) {
  await ensureBootstrapAdmin();
  const users = readUsers();
  if (users.some((u) => u.username.toLowerCase() === input.username.toLowerCase())) {
    throw new Error("Usuário já existe");
  }
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("E-mail já cadastrado");
  }
  const now = new Date().toISOString();
  const user: CmsUser = {
    id: `user-${Date.now()}`,
    username: input.username.trim(),
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    role: input.role,
    passwordHash: await bcrypt.hash(input.password, 10),
    mustChangePassword: input.mustChangePassword !== false,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);
  writeUsers(users);
  return publicUser(user);
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<CmsUser, "email" | "name" | "role" | "active" | "mustChangePassword">>
) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) throw new Error("Usuário não encontrado");
  users[idx] = { ...users[idx], ...patch, updatedAt: new Date().toISOString() };
  writeUsers(users);
  return publicUser(users[idx]);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) throw new Error("Usuário não encontrado");
  const ok = await bcrypt.compare(currentPassword, users[idx].passwordHash);
  if (!ok) throw new Error("Senha atual incorreta");
  if (newPassword.length < 8) throw new Error("A nova senha deve ter ao menos 8 caracteres");
  users[idx].passwordHash = await bcrypt.hash(newPassword, 10);
  users[idx].mustChangePassword = false;
  users[idx].updatedAt = new Date().toISOString();
  writeUsers(users);
  return publicUser(users[idx]);
}

export async function forceSetPassword(userId: string, newPassword: string) {
  await hydrateFromBlob();
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) throw new Error("Usuário não encontrado");
  if (newPassword.length < 8) throw new Error("A nova senha deve ter ao menos 8 caracteres");
  users[idx].passwordHash = await bcrypt.hash(newPassword, 10);
  users[idx].mustChangePassword = false;
  users[idx].resetToken = undefined;
  users[idx].resetTokenExpiresAt = undefined;
  users[idx].updatedAt = new Date().toISOString();
  writeUsers(users);
  await saveUsersToBlob(users);
  return publicUser(users[idx]);
}

export async function createPasswordResetToken(email: string) {
  await hydrateFromBlob();
  const users = readUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx < 0) return null;
  const exp = Date.now() + RESET_TTL_MS;
  const token = signResetPayload(users[idx].id, users[idx].email, exp);
  users[idx].resetToken = token;
  users[idx].resetTokenExpiresAt = new Date(exp).toISOString();
  users[idx].updatedAt = new Date().toISOString();
  writeUsers(users);
  return { user: publicUser(users[idx]), token };
}

export async function getUserByResetToken(token: string) {
  await hydrateFromBlob();
  const signed = verifyResetPayload(token);
  if (signed) {
    const users = readUsers();
    const user = users.find(
      (u) => u.id === signed.uid || u.email.toLowerCase() === signed.email.toLowerCase()
    );
    return user || null;
  }
  const users = readUsers();
  const user = users.find((u) => u.resetToken === token);
  if (!user || !user.resetTokenExpiresAt) return null;
  if (new Date(user.resetTokenExpiresAt).getTime() < Date.now()) return null;
  return user;
}

export function deleteUser(id: string) {
  const users = readUsers();
  const admins = users.filter((u) => u.role === "admin" && u.active);
  const target = users.find((u) => u.id === id);
  if (!target) throw new Error("Usuário não encontrado");
  if (target.role === "admin" && admins.length <= 1) {
    throw new Error("Não é possível remover o único administrador");
  }
  writeUsers(users.filter((u) => u.id !== id));
}
