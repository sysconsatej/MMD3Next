"use client";
/* eslint-disable */
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MultiSelectFileInput({
  id = "files",
  name = "files",
  label = "Upload files",
  accept,
  required = false,
  multiple = true,
  maxTotalSizeBytes, // optional; if omitted, a soft 100MB bar is used
  onChange,
  className = "",
}) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState({}); // { key: objectURL }
  const inputRef = useRef(null);

  const uniqueKey = (f) => `${f.name}__${f.size}__${f.lastModified}`;

  /* ---------- Sync native input ---------- */
  const syncInputFiles = (newFiles) => {
    const dt = new DataTransfer();
    newFiles.forEach((f) => dt.items.add(f));
    if (inputRef.current) inputRef.current.files = dt.files;
  };

  /* ---------- Image previews (24×24) ---------- */
  useEffect(() => {
    const next = {};
    files.forEach((f) => {
      if (f.type?.startsWith("image/")) {
        const key = uniqueKey(f);
        next[key] = URL.createObjectURL(f);
      }
    });

    // Revoke stale URLs
    Object.entries(previews).forEach(([k, url]) => {
      if (!next[k]) URL.revokeObjectURL(url);
    });

    setPreviews(next);

    return () => {
      Object.values(next).forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  /* ---------- Accept filter (for drag-drop) ---------- */
  const passesAccept = (file, acceptStr) => {
    if (!acceptStr) return true;
    const parts = acceptStr.split(",").map((s) => s.trim().toLowerCase());
    const mime = (file.type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();

    return parts.some((rule) => {
      if (!rule) return false;
      if (rule.startsWith(".")) return name.endsWith(rule);
      if (rule.endsWith("/*")) return mime.startsWith(rule.slice(0, -2) + "/");
      return mime === rule;
    });
  };

  /* ---------- Handlers ---------- */
  const handleInputChange = (e) => {
    const list = Array.from(e.target.files || []);
    const next = multiple ? mergeUnique(files, list) : list.slice(0, 1);
    setFiles(next);
    syncInputFiles(next);
    onChange?.(next, e);
  };

  const handleRemove = (index) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    syncInputFiles(updated);
    onChange?.(updated, { type: "remove", removedIndex: index });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    let list = Array.from(e.dataTransfer?.files || []);
    if (accept) list = list.filter((f) => passesAccept(f, accept));
    if (list.length > 0) {
      const next = multiple ? mergeUnique(files, list) : list.slice(0, 1);
      setFiles(next);
      syncInputFiles(next);
      onChange?.(next, e);
    }
  };

  /* ---------- Totals & progress bar ---------- */
  const totalSize = useMemo(
    () => files.reduce((s, f) => s + f.size, 0),
    [files]
  );
  const barPercent = useMemo(() => {
    if (maxTotalSizeBytes && maxTotalSizeBytes > 0) {
      return Math.min((totalSize / maxTotalSizeBytes) * 100, 100);
    }
    const softCap = 100 * 1024 * 1024; // 100 MB
    return Math.min((totalSize / softCap) * 100, 100);
  }, [totalSize, maxTotalSizeBytes]);

  return (
    <div className={`w-full ${className} text-[12px]`}>
      {/* Grid: two columns horizontally on md+; stack on small screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* -------- Left: Upload -------- */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm h-full">
          <header className="flex items-center justify-between border-b border-gray-100 px-3 py-2 sticky top-0 bg-white z-10 rounded-t-xl">
            <h3 className="text-[13px] font-semibold text-gray-800 leading-none">
              {label}
            </h3>
            <span className="text-[10px] text-gray-500">
              {accept ? `Allowed: ${accept}` : "Any file type"}
              {required ? " • Required" : ""}
            </span>
          </header>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload files area"
            className={[
              "m-3 flex min-h-[140px] w-auto cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-all duration-200",
              dragActive
                ? "border-indigo-400 bg-indigo-50 shadow-sm"
                : "border-gray-300 hover:border-indigo-300 hover:bg-gray-50",
            ].join(" ")}
          >
            <UploadIcon className="mb-1.5 h-5 w-5 text-gray-500" />
            <p className="text-[12px] font-medium text-gray-700">
              Drag & drop files or{" "}
              <span className="text-indigo-600 underline">browse</span>
            </p>
            <input
              ref={inputRef}
              id={id}
              name={name}
              type="file"
              multiple={multiple}
              required={required}
              accept={accept}
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        </section>

        {/* -------- Right: Selected Files -------- */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm h-full flex flex-col">
          <header className="flex items-center justify-between border-b border-gray-100 px-3 py-2 sticky top-0 bg-white z-10 rounded-t-xl">
            <h3 className="text-[13px] font-semibold text-gray-800 leading-none">
              Selected Files
            </h3>
            <span className="text-[10px] text-gray-500">
              {files.length} file{files.length !== 1 ? "s" : ""} •{" "}
              {formatSize(totalSize)}
              {maxTotalSizeBytes ? ` / ${formatSize(maxTotalSizeBytes)}` : ""}
            </span>
          </header>

          {/* Total size bar */}
          <div className="px-3 pt-2">
            <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full w-0 bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-300"
                style={{ width: `${barPercent}%` }}
              />
            </div>
          </div>

          {/* List */}
          <div className="px-3 pb-3 pt-2 flex-1">
            {files.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-200 py-6 text-center text-gray-400">
                No files selected.
              </div>
            ) : (
              <ul className="max-h-[300px] overflow-y-auto pr-1 nice-scroll">
                <AnimatePresence initial={false}>
                  {files.map((file, index) => {
                    const key = uniqueKey(file);
                    const isImage = file.type?.startsWith("image/");
                    const previewUrl = isImage ? previews[key] : null;

                    return (
                      <motion.li
                        key={`${file.name}-${index}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          x: -16,
                          height: 0,
                          marginTop: 0,
                          marginBottom: 0,
                          paddingTop: 0,
                          paddingBottom: 0,
                          transition: { duration: 0.18 },
                        }}
                        className="group flex items-center justify-between gap-2.5 rounded-md border border-gray-100 bg-white px-2.5 py-1.5 shadow-sm transition-shadow hover:shadow-md +mb-1.5"
                        style={{ marginBottom: "6px" }}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt={file.name}
                              width={24}
                              height={24}
                              className="h-6 w-6 rounded object-cover ring-1 ring-gray-200"
                            />
                          ) : (
                            <FileIcon mime={file.type} small />
                          )}
                          <div className="min-w-0 leading-tight">
                            <div className="truncate text-gray-800">
                              {file.name}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {file.type || "unknown"} • {formatSize(file.size)}
                            </div>
                          </div>
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(index);
                          }}
                          className="rounded-full p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                          title="Remove file"
                          aria-label={`Remove ${file.name}`}
                        >
                          <XIcon small />
                        </motion.button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Scoped premium scrollbar */}
      <style jsx>{`
        .nice-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.35) transparent; /* slate-500/35 */
        }
        .nice-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .nice-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(100, 116, 139, 0.35);
          border-radius: 9999px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .nice-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(79, 70, 229, 0.45); /* indigo-600/45 */
        }
        .nice-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}

/* ---------- Utilities ---------- */

function mergeUnique(existing, incoming) {
  const map = new Map();
  [...existing, ...incoming].forEach((f) =>
    map.set(`${f.name}__${f.size}__${f.lastModified}`, f)
  );
  return [...map.values()];
}

function formatSize(bytes) {
  if (bytes === 0) return "0 B";
  if (!bytes && bytes !== 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    sizes.length - 1,
    Math.floor(Math.log(bytes) / Math.log(k))
  );
  const val = bytes / Math.pow(k, i);
  return `${i === 0 ? Math.round(val) : val.toFixed(2)} ${sizes[i]}`;
}

/* ---------- Icons ---------- */

function UploadIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 16V4m0 0l4 4m-4-4L8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function XIcon({ small }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={small ? "h-3.5 w-3.5" : "h-4 w-4"}
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M7 7l6 6M13 7l-6 6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FileIcon({ mime, small }) {
  const color = mime?.startsWith("image/")
    ? "text-blue-500"
    : mime?.includes("pdf")
    ? "text-red-500"
    : mime?.includes("zip") || mime?.includes("compressed")
    ? "text-amber-500"
    : mime?.includes("spreadsheet")
    ? "text-emerald-500"
    : mime?.includes("word") || mime?.includes("msword")
    ? "text-indigo-500"
    : "text-gray-500";

  return (
    <svg
      viewBox="0 0 24 24"
      className={`${small ? "h-5 w-5" : "h-6 w-6"} ${color}`}
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="3"
        fill="currentColor"
        opacity="0.12"
      />
      <path
        d="M14 3v4a2 2 0 0 0 2 2h4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
