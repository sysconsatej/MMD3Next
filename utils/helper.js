import * as XLSX from "xlsx";

export const excelFileToJson = (file) => {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();

            reader.onload = (evt) => {
                try {
                    const data = new Uint8Array(evt.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                    resolve(jsonData);
                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        } catch (err) {
            reject(err);
        }
    });
};

export const jsonToExcelFile = (jsonData, fileName = "data") => {
    try {
        const worksheet = XLSX.utils.json_to_sheet(jsonData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch (error) {
        console.error("Error converting JSON to Excel:", error);
    }
};

export const jsonFormatterForSp = (data) => {
    const formatted = {};

    Object.entries(data).forEach(([key, value]) => {
        // If value is an object with Id, return only Id
        if (value && typeof value === "object" && "Id" in value) {
            formatted[key] = value.Id;
        } else {
            formatted[key] = value;
        }
    });

    return formatted;
};
