"use client";
import { useModal } from "@/store";
import CustomButton from "../button/button";
import { Box } from "@mui/material";
import { auth } from "@/store";
import { logoutApi } from "@/apis/auth";

export const LogoutModalContent = () => {
  const { setModalClose } = useModal();
  const { logout, clearUserData } = auth();

  const handleClickYes = async () => {
    await logoutApi();
    logout();
    clearUserData();
    setModalClose();
    window.location.href = "https://mmd3.mastergroups.com/";
    window.location.reload(); 
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
