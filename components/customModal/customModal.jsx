"use client";
import { useModal } from "@/store";
import { Box, Modal } from "@mui/material";
import { RenderModal } from "./RenderModal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: "14px",
  boxShadow: 24,
  p: 4,
};

const CustomModal = () => {
  const { modalShowType, setModalClose } = useModal();

  return (
    <>
      {modalShowType?.isModalShow ? (
        <Modal
          open={modalShowType?.isModalShow}
          onClose={() => setModalClose()}
        >
          <Box
            sx={style}
            className="bg-gradient-to-b from-blue-600 via-indigo-700 to-blue-900"
          >
            <RenderModal type={modalShowType?.type || "None"} />
          </Box>
        </Modal>
      ) : (
        <></>
      )}
    </>
  );
};

export default CustomModal;
