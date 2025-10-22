"use client";

import React, { useRef, useState } from "react";
import { CustomInput } from "../customInput";
import CustomButton from "../button/button";
import { Box, Card, CardContent } from "@mui/material";
import { login } from "@/apis";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "@/store/index";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export const LoginForm = () => {
  const { push } = useRouter();
  const { setToken, userDataToken, setUserData } = useAuth();
  const [formData, setFormData] = useState({});
  const formRef = useRef(null);
  const fieldData = {
    loginFields: [
      {
        name: "username",
        type: "text",
        key: "username",
      },
      {
        name: "password",
        type: "text",
        key: "password",
      },
    ],
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
        setUserData({ data: res?.user, name: "Master Marine" });
        toast.success(`${res?.message}`, {
          position: "top-right",
          autoClose: 1000,
        });
        push("/home");
      }
    } catch (e) {
      console.log(e, "e");
    }
    if (formRef.current) {
      const formId = formRef?.current?.id;
      if (formId) {
        setFormData({});
      }
    }
  };

  return (
    <>
      {userDataToken ? (
        <></>
      ) : (
        <>
          <Card>
            <CardContent className="bg-gradient-to-b from-blue-600 via-indigo-700 to-blue-900">
              <form
                id="login-form"
                onSubmit={(e) => submitHandler(e)}
                ref={formRef}
              >
                <Box className="flex flex-col  justify-between  gap-1 items-end py-1">
                  <CustomInput
                    fields={fieldData.loginFields}
                    formData={formData}
                    setFormData={setFormData}
                    fieldsMode={""}
                    popUp={false}
                  />
                </Box>

                <Box className={"mt-10 flex justify-center "}>
                  <CustomButton text={"Submit"} type="submit" />
                </Box>
              </form>
            </CardContent>
          </Card>
          <ToastContainer />
        </>
      )}
    </>
  );
};
