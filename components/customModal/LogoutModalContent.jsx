"use client";
import { useAuth, useModal } from "@/store";
import CustomButton from "../button/button";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";

export const LogoutModalContent = () => {
  const { setModalClose } = useModal();
  const { logout } = useAuth();
  const router = useRouter();

  const handleClickYes = () => {
    console.log("Hello")
    logout();
    setModalClose();
    // router.refresh();
    router.push("/login");
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
