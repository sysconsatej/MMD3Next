"use client";

import { LogoutModalContent } from "./LogoutModalContent";

export const RenderModal = ({ type }) => {
  const renderModalBasedOnType = (type) => {
    switch (type) {
      case "logout":
        return <LogoutModalContent />;
      case "None":
        return <></>;
      default:
        return <></>;
    }
  };

  return <>{renderModalBasedOnType(type)}</>;
};
