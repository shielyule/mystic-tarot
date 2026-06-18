import type { Express, NextFunction, Request, Response } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";
import type { SafeUser } from "@shared/schema";
import { getPool, isDatabaseConfigured } from "./db";
import { hashPassword, verifyPassword } from "./password";
import { createUser, findUserByEmail, findUserById, toSafeUser } from "./user-repository";

declare global {
  namespace Express {
    interface User extends SafeUser {}
  }
}

const PgSession = connectPgSimple(session);

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_ATTEMPTS = 20;

function authRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (entry && entry.resetAt > now && entry.count >= AUTH_MAX_ATTEMPTS) {
    return res.status(429).json({ message: "Too many attempts. Try again later." });
  }
  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS });
  } else {
    entry.count += 1;
  }
  next();
}

function recordAuthFailure(req: Request) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(ip, { count: 2, resetAt: now + AUTH_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!isDatabaseConfigured()) {
    return res.status(503).json({
      message: "Authentication is not configured. Set DATABASE_URL and SESSION_SECRET.",
    });
  }
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Authentication required" });
}

export function requireDatabase(_req: Request, res: Response, next: NextFunction) {
  if (!isDatabaseConfigured()) {
    return res.status(503).json({
      message: "Database is not configured. Set DATABASE_URL on the server.",
    });
  }
  next();
}

export async function setupAuth(app: Express): Promise<void> {
  if (!isDatabaseConfigured()) {
    console.warn("DATABASE_URL not set — auth and reading history are disabled.");
    return;
  }

  const sessionSecret = process.env.SESSION_SECRET?.trim();
  if (process.env.NODE_ENV === "production" && !sessionSecret) {
    throw new Error("SESSION_SECRET is required in production");
  }

  const pool = getPool();
  const sessionStore = new PgSession({
    pool,
    createTableIfMissing: true,
    tableName: "session",
  });

  app.use(
    session({
      store: sessionStore,
      secret: sessionSecret || "dev-only-insecure-session-secret",
      resave: false,
      saveUninitialized: false,
      name: "discovery.sid",
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      },
    }),
  );

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await findUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          const valid = await verifyPassword(password, user.passwordHash);
          if (!valid) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, toSafeUser(user));
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await findUserById(id);
      if (!user) return done(null, false);
      done(null, toSafeUser(user));
    } catch (err) {
      done(err);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());
}

const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  displayName: z.string().max(120).optional(),
});

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(128),
});

export function registerAuthRoutes(app: Express): void {
  app.get("/api/auth/me", (req, res) => {
    if (!isDatabaseConfigured()) {
      return res.json(null);
    }
    res.json(req.user ?? null);
  });

  app.post("/api/auth/register", requireDatabase, authRateLimit, async (req, res, next) => {
    try {
      const body = registerSchema.parse(req.body);
      const existing = await findUserByEmail(body.email);
      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }
      const passwordHash = await hashPassword(body.password);
      const user = await createUser({
        email: body.email,
        passwordHash,
        displayName: body.displayName,
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid registration data", issues: error.issues });
      }
      next(error);
    }
  });

  app.post("/api/auth/login", requireDatabase, authRateLimit, (req, res, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login data", issues: error.issues });
      }
      return next(error);
    }

    passport.authenticate("local", (err: Error | null, user: SafeUser | false, info?: { message?: string }) => {
      if (err) return next(err);
      if (!user) {
        recordAuthFailure(req);
        return res.status(401).json({ message: info?.message || "Invalid email or password" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.json({ ok: true });
    }
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((destroyErr) => {
        if (destroyErr) return next(destroyErr);
        res.clearCookie("discovery.sid");
        res.json({ ok: true });
      });
    });
  });
}
