import { LoginForm } from "@/components/login/login";
import LoginLayout from "./layout";
export default function LoginPage() {
  return (
    <LoginLayout>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center  p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <LoginForm />
        </main>
      </div>
    </LoginLayout>
  );
}
