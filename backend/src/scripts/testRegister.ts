import { AuthService } from "../auth/auth.service";

async function run() {
  try {
    const timestamp = Date.now();
    const name = `Script User ${timestamp}`;
    const email = `script+${timestamp}@example.com`;
    const password = "secret";

    console.log("Calling AuthService.register with:", { name, email });
    const user = await AuthService.register(name, email, password);
    console.log("Register succeeded:", user);
    process.exit(0);
  } catch (err: any) {
    console.error("Register failed:", err?.code ?? err?.message ?? err);
    if (err?.meta) console.error("meta:", err.meta);
    process.exit(1);
  }
}

run();
