"use client";
import { useModal } from "@/store";
import CustomButton from "../button/button";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { auth } from "@/store";

export const LogoutModalContent = () => {
  const { setModalClose } = useModal();
  const { logout, clearUserData } = auth();
  const router = useRouter();

  const handleClickYes = () => {
    logout();
    clearUserData();
    setModalClose();
    Cookies.remove("user");
    Cookies.remove("token");
    router.refresh();
    router.push("https://mmd3.mastergroups.com/");
    window.location.href = "https://mmd3.mastergroups.com/";
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
