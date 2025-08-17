import { CreateProfileForm } from "@/components/auth/create-profile-form";

export default function CreateProfilePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <CreateProfileForm />
      </div>
    </main>
  );
}
