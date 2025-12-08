export function setInputValue(obj) {
  const { prevData, tabName, gridName, tabIndex, containerIndex, name, value } =
    obj;

  let updateData = { ...prevData };

  if (!tabName && !gridName) {
    updateData[name] = value;
  } else if (tabName && !gridName) {
    const updatedTabs = [...(updateData[tabName] || [])];
    updatedTabs[tabIndex] = {
      ...updatedTabs[tabIndex],
      [name]: value,
    };
    updateData[tabName] = updatedTabs;
  } else if (!tabName && gridName) {
    const updatedGrid = [...(updateData[gridName] || [])];
    updatedGrid[containerIndex] = {
      ...updatedGrid[containerIndex],
      [name]: value,
    };
    updateData[gridName] = updatedGrid;
  } else if (tabName && gridName) {
    const updatedTabs = [...(updateData[tabName] || [])];
    const updatedRow = { ...updatedTabs[tabIndex] };

    const updatedGrid = [...(updatedRow[gridName] || [])];
    updatedGrid[containerIndex] = {
      ...updatedGrid[containerIndex],
      [name]: value,
    };

    updatedRow[gridName] = updatedGrid;
    updatedTabs[tabIndex] = updatedRow;
    updateData[tabName] = updatedTabs;
  }

  return updateData;
}

export function getInputValue(obj) {
  const { gridName, tabName, tabIndex, containerIndex, formData, name } = obj;

  if (!tabName && !gridName) {
    return formData?.[name] || "";
  } else if (!tabName && gridName) {
    return formData?.[gridName]?.[containerIndex]?.[name] || "";
  } else if (tabName && !gridName) {
    return formData?.[tabName]?.[tabIndex]?.[name] || "";
  } else if (tabName && gridName) {
    return (
      formData?.[tabName]?.[tabIndex]?.[gridName]?.[containerIndex]?.[name] ||
      ""
    );
  }
}
