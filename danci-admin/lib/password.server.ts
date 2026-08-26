import {
  pbkdf2 as pbkdf2Callback,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const pbkdf2 = promisify(pbkdf2Callback);
const ALGORITHM = "pbkdf2_sha256";
const ITERATIONS = 600_000;
const KEY_LENGTH = 32;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = await pbkdf2(
    password,
    salt,
    ITERATIONS,
    KEY_LENGTH,
    "sha256",
  );

  return [
    ALGORITHM,
    ITERATIONS,
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(password: string, encodedHash: string) {
  const [algorithm, iterationsValue, saltValue, hashValue] =
    encodedHash.split("$");
  const iterations = Number(iterationsValue);

  if (
    algorithm !== ALGORITHM ||
    iterations !== ITERATIONS ||
    !saltValue ||
    !hashValue
  ) {
    return false;
  }

  try {
    const expectedHash = Buffer.from(hashValue, "base64url");
    const actualHash = await pbkdf2(
      password,
      Buffer.from(saltValue, "base64url"),
      iterations,
      expectedHash.length,
      "sha256",
    );

    return (
      expectedHash.length === actualHash.length &&
      timingSafeEqual(expectedHash, actualHash)
    );
  } catch {
    return false;
  }
}
