
const positiveInteger = (value, fallback) => {
    const parsed = Number(value);

    return Number.isSafeInteger(parsed) && parsed > 0
        ? parsed
        : fallback;
};

export const PDF_EXTRACTOR_CONFIG = {
    maxFiles: positiveInteger(
        process.env.NEXT_PUBLIC_PDF_MAX_FILES,
        1000
    ),

    maxFileSizeMB: positiveInteger(
        process.env.NEXT_PUBLIC_PDF_MAX_SIZE_MB,
        10
    ),

    filesPerRequest: positiveInteger(
        process.env.NEXT_PUBLIC_PDF_FILES_PER_REQUEST,
        5
    )
};
