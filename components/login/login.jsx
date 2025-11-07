"use client";

import React, { useRef, useState } from "react";
import CustomButton from "../button/button";
import { login } from "@/apis";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { auth } from "@/store";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export const LoginForm = () => {
  const { push } = useRouter();
  const { setToken, setUserData } = auth();
  const [formData, setFormData] = useState({ emailId: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef(null);

  const handleChange = (value, name) => {
    setFormData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (Object.values(formData).length === 0) {
      return toast.error("Please enter Username and Password", {
        position: "top-right",
      });
    }

    try {
      const requestBody = { ...formData };

      const res = await login(requestBody);
      if (res?.token) {
        Cookies.set("auth_token", res?.token, { expires: 1 });
        setToken(res?.token);
        setUserData({ data: res?.user});
        toast.success(`${res?.message}`, {
          position: "top-right",
          // autoClose: 1000,
        });
        push("/home");
      }
    } catch (e) {
      return Error(e);
    }
    if (formRef.current) {
      const formId = formRef?.current?.id;
      if (formId) {
        setFormData({});
      }
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={submitHandler} style={styles.form} ref={formRef}>
        <h2 style={styles.title}>Login</h2>
        <input
          type="text"
          placeholder="Email Id"
          value={formData.emailId}
          name="emailId"
          onChange={(e) => handleChange(e.target.value, 'emailId')}
          style={styles.input}
          required
        />

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            name="password"
            onChange={(e) => handleChange(e.target.value, 'password')}
            style={styles.input}
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              fontSize: 20,
              color: "#555",
            }}
          >
            {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </span>
        </div>

        <CustomButton
          type="submit"
          text="Login"
          buttonStyles="!w-full !bg-[#3D74B6] hover:!bg-[#1B3C53]"
        />
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    height: "inherit",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 8,
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
    fontSize: 24,
    fontWeight: "bold",
  },
  input: {
    padding: 12,
    fontSize: 16,
    border: "1px solid #ccc",
    borderRadius: 4,
    width: "100%",
    boxSizing: "border-box",
  },
};
