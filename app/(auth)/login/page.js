import { LoginForm } from "@/components/login/login";
import LoginLayout from "./layout";
export default function LoginPage() {
  return (
    <LoginLayout>
      <main
        className=""
        style={{
          padding: "50px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height  : 'inherit',
        }}
      >
        <LoginForm />
      </main>
    </LoginLayout>
  );
}
