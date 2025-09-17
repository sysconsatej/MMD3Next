import { toast } from "react-toastify";

export const copyBetweenNotifyConsignee = (
  formData,
  setFormData,
  direction
) => {
  const updatedFormData = { ...formData };

  const mapping = {
    notifyPartyText: "consigneeText",
    notifyFieldsCode: "consigneeCode",
    notifyParty1TypeId: "consigneeTypeId",
    notifyingParty1Country: "consigneeCountry",
    notifyParty1State: "consigneeState",
    notifyParty1City: "consigneeCity",
    notifyParty1PinCode: "consigneePinCode",
    notifyPartyAddress: "consigneeAddress",
  };

  const fieldMapping =
    direction === "notifyToConsignee"
      ? mapping
      : Object.fromEntries(Object.entries(mapping).map(([k, v]) => [v, k]));

  Object.entries(fieldMapping).forEach(([sourceKey, targetKey]) => {
    if (formData[sourceKey]) {
      updatedFormData[targetKey] = formData[sourceKey];
    }
  });

  setFormData(updatedFormData);
  toast.success(
    direction === "notifyToConsignee"
      ? "Notify details copied to Consignee!"
      : "Consignee details copied to Notify!"
  );
};
