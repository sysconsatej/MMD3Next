import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const toggleModal = create(
  persist(
    (set) => ({
      modalShowType: { isModalShow: false, type: "None" },
      setModalOpen: (type) =>
        set({ modalShowType: { isModalShow: true, type: type } }),
      setModalClose: () =>
        set({ modalShowType: { isModalShow: false, type: "None" } }),
    }),
    { name: "modal-storage", storage: createJSONStorage(() => sessionStorage) }
  )
);

const useModal = () => {
  const { modalShowType, setModalClose, setModalOpen } = toggleModal();
  return { modalShowType, setModalClose, setModalOpen };
};

export default useModal;
