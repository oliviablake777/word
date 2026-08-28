'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  DEMO_PROGRESS,
  DEMO_USER,
  LearningProgressRow,
  UserRow,
} from '@/lib/mock-data';

const STORAGE_KEYS = {
  users: 'word-island:users',
  session: 'word-island:session-user-id',
  progress: 'word-island:learning-progress',
} as const;

type PublicUser = Omit<UserRow, 'passwordHash'>;

type ActionResult = {
  ok: boolean;
  message?: string;
};

type MockAppContextValue = {
  hydrated: boolean;
  user: PublicUser | null;
  progressRecords: LearningProgressRow[];
  login: (email: string, password: string) => Promise<ActionResult>;
  register: (email: string, password: string) => Promise<ActionResult>;
  logout: () => void;
  getProgress: (bookId: string) => LearningProgressRow | null;
  completeWord: (
    bookId: string,
    wordId: string,
    wordRank: number,
    learnedCount: number,
    totalWords: number,
  ) => LearningProgressRow | null;
  resetProgress: (bookId: string) => void;
};

const MockAppContext = createContext<MockAppContextValue | null>(null);

function toPublicUser(user: UserRow): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persistProgress(records: LearningProgressRow[]) {
  window.localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(records));
}

async function hashMockPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function createId() {
  return window.crypto.randomUUID();
}

function wait(milliseconds = 420) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export function MockAppProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([DEMO_USER]);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [progressRecords, setProgressRecords] = useState<
    LearningProgressRow[]
  >([]);

  useEffect(() => {
    const storedUsers = readJson<UserRow[]>(STORAGE_KEYS.users, []);
    const allUsers = [
      DEMO_USER,
      ...storedUsers.filter((item) => item.id !== DEMO_USER.id),
    ];
    const sessionUserId = window.localStorage.getItem(STORAGE_KEYS.session);
    const sessionUser = allUsers.find((item) => item.id === sessionUserId);

    setUsers(allUsers);
    setUser(sessionUser ? toPublicUser(sessionUser) : null);
    setProgressRecords(
      readJson<LearningProgressRow[]>(STORAGE_KEYS.progress, []),
    );
    setHydrated(true);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<ActionResult> => {
      await wait();
      const normalizedEmail = email.trim().toLowerCase();
      const passwordHash = await hashMockPassword(password);
      const matchedUser = users.find(
        (item) =>
          item.email === normalizedEmail && item.passwordHash === passwordHash,
      );

      if (!matchedUser) {
        return { ok: false, message: '邮箱或密码错误，请重新输入' };
      }

      setUser(toPublicUser(matchedUser));
      window.localStorage.setItem(STORAGE_KEYS.session, matchedUser.id);

      if (matchedUser.id === DEMO_USER.id) {
        setProgressRecords((current) => {
          if (current.some((item) => item.userId === DEMO_USER.id)) {
            return current;
          }
          const next = [...current, DEMO_PROGRESS];
          persistProgress(next);
          return next;
        });
      }

      return { ok: true };
    },
    [users],
  );

  const register = useCallback(
    async (email: string, password: string): Promise<ActionResult> => {
      await wait();
      const normalizedEmail = email.trim().toLowerCase();

      if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
        return { ok: false, message: '请输入有效的邮箱地址' };
      }
      if (password.length < 8) {
        return { ok: false, message: '密码至少需要 8 位' };
      }
      if (users.some((item) => item.email === normalizedEmail)) {
        return { ok: false, message: '该邮箱已注册，请直接登录' };
      }

      const now = new Date().toISOString();
      const createdUser: UserRow = {
        id: createId(),
        email: normalizedEmail,
        passwordHash: await hashMockPassword(password),
        createdAt: now,
        updatedAt: now,
      };
      const nextUsers = [...users, createdUser];

      setUsers(nextUsers);
      window.localStorage.setItem(
        STORAGE_KEYS.users,
        JSON.stringify(nextUsers.filter((item) => item.id !== DEMO_USER.id)),
      );

      return { ok: true, message: '注册成功，请使用新账号登录' };
    },
    [users],
  );

  const logout = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEYS.session);
  }, []);

  const getProgress = useCallback(
    (bookId: string) => {
      if (!user) return null;
      return (
        progressRecords.find(
          (item) => item.userId === user.id && item.bookId === bookId,
        ) ?? null
      );
    },
    [progressRecords, user],
  );

  const completeWord = useCallback(
    (
      bookId: string,
      wordId: string,
      wordRank: number,
      learnedCount: number,
      totalWords: number,
    ) => {
      if (!user) return null;
      const now = new Date().toISOString();
      let result: LearningProgressRow | null = null;

      setProgressRecords((current) => {
        const existing = current.find(
          (item) => item.userId === user.id && item.bookId === bookId,
        );

        if (
          existing?.lastWordRank !== null &&
          existing?.lastWordRank !== undefined &&
          existing.lastWordRank >= wordRank
        ) {
          result = existing;
          return current;
        }

        const nextProgress: LearningProgressRow = {
          id: existing?.id ?? createId(),
          userId: user.id,
          bookId,
          lastWordId: wordId,
          lastWordRank: wordRank,
          learnedCount,
          completedAt: learnedCount === totalWords ? now : null,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };
        const next = existing
          ? current.map((item) =>
              item.id === existing.id ? nextProgress : item,
            )
          : [...current, nextProgress];

        result = nextProgress;
        persistProgress(next);
        return next;
      });

      return result;
    },
    [user],
  );

  const resetProgress = useCallback(
    (bookId: string) => {
      if (!user) return;
      setProgressRecords((current) => {
        const next = current.filter(
          (item) => !(item.userId === user.id && item.bookId === bookId),
        );
        persistProgress(next);
        return next;
      });
    },
    [user],
  );

  const value = useMemo<MockAppContextValue>(
    () => ({
      hydrated,
      user,
      progressRecords,
      login,
      register,
      logout,
      getProgress,
      completeWord,
      resetProgress,
    }),
    [
      completeWord,
      getProgress,
      hydrated,
      login,
      logout,
      progressRecords,
      register,
      resetProgress,
      user,
    ],
  );

  return (
    <MockAppContext.Provider value={value}>
      {children}
    </MockAppContext.Provider>
  );
}

export function useMockApp() {
  const context = useContext(MockAppContext);
  if (!context) {
    throw new Error('useMockApp must be used inside MockAppProvider');
  }
  return context;
}
