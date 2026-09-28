/**
 * Generates a clean, lowercase, unique username based on the user's name and role.
 * Example: "Tanvir Ahmed" -> "tanvir102"
 */
export async function generateUniqueUsername(
  fullName: string,
  role?: string,
  isUsernameTaken?: (username: string) => Promise<boolean>
): Promise<string> {
  const firstWord = (fullName || "").trim().split(/\s+/)[0] || "";
  let base = firstWord.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (base.length < 2) {
    base = (role || "user").toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
  }

  if (!isUsernameTaken) {
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `${base}${randomNum}`;
  }

  for (let i = 0; i < 15; i++) {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const candidate = `${base}${randomNum}`;
    const taken = await isUsernameTaken(candidate);
    if (!taken) {
      return candidate;
    }
  }

  for (let i = 0; i < 15; i++) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${base}${randomNum}`;
    const taken = await isUsernameTaken(candidate);
    if (!taken) {
      return candidate;
    }
  }

  return `${base}${Date.now().toString().slice(-4)}`;
}
