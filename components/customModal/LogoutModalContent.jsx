"use client";
import { useAuth, useModal } from "@/store";
import CustomButton from "../button/button";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export const LogoutModalContent = () => {
  const { setModalClose } = useModal();
  const { logout , clearUserData } = useAuth();
  const router = useRouter();

  const handleClickYes = () => {
    logout();
    clearUserData();
    setModalClose();
    Cookies.remove("auth_token");
    router.refresh();
    router.push("/login");
    window.location.reload("/login");
  };

  return (
    <>
      <p className="text-white"> Do you want to logout? </p>
      <Box className="flex justify-end gap-5 mt-10">
        <CustomButton onClick={() => handleClickYes()} text={"Yes"} />
        <CustomButton
          onClick={() => {
            setModalClose();
          }}
          text={"No"}
        />
      </Box>
    </>
  );
};
