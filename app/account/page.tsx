import { requireUser } from "@/lib/auth-guard";

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">
        My Account
      </h1>

      <div className="mt-6 space-y-2">
        <p>
          <strong>Name:</strong> {user.name}
        </p>

        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p>
          <strong>Roles:</strong> {user.roles.join(", ")}
        </p>
      </div>
    </main>
  );
}