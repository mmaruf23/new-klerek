import { useEffect, useState } from "react";

/** Hitung mundur per detik dari `secs` sampai 0. `str` berformat "mm:ss". */
export function useCountdown(secs: number) {
  const [rem, setRem] = useState(secs);
  useEffect(() => {
    const id = setInterval(() => setRem((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(rem / 60).toString().padStart(2, "0");
  const s = (rem % 60).toString().padStart(2, "0");
  return { str: `${m}:${s}`, m, s };
}
