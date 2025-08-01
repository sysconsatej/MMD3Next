import { useEffect, useState } from "react";

export function useDebounce(search = "", delay) {
  const [debounceValue, setDebounceValue] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceValue(search);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [search, delay]);

  return debounceValue;
}
