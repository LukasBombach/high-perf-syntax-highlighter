import { useEffect, useState } from "react";
import { loadWASM, createOnigScanner, createOnigString } from "vscode-oniguruma";

export function Editor() {
  const [wasmModule, setWasmModule] = useState<any>(null);

  useEffect(() => {
    fetch("onig.wasm")
      .then(data => loadWASM({ data }))
      .then(() => {});
  }, []);

  return (
    <textarea
      className="w-full h-full outline-none caret-black font-mono bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
      value=" Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sit labore, iste voluptate repellendus laudantium
        omnis modi culpa quod quibusdam nesciunt corrupti! Dolor quaerat in, a ipsam et itaque cumque dignissimos."
    />
  );
}
