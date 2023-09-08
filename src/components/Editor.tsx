"use client";

import { useEffect, useState } from "react";
import { loadWASM, createOnigScanner, createOnigString } from "vscode-oniguruma";
import { Registry } from "vscode-textmate";

import type { IRawGrammar, IOnigLib, IRawTheme } from "vscode-textmate";

async function fetchOniguruma(): Promise<IOnigLib> {
  return fetch("/onig.wasm")
    .then(data => loadWASM({ data }))
    .then(() => ({ createOnigScanner, createOnigString }));
}

async function fetchTypescriptGrammar(): Promise<IRawGrammar> {
  const response = await fetch("/tsx.tmLanguage.json");
  return await response.json();
}

const sourceCode = `
const x = 10;

function hello() {
  console.log("Hello, world!", x);
}`.trim();

export function Editor() {
  const [wasmModule, setWasmModule] = useState<any>(null);

  useEffect(() => {
    // Initialisiere das TextMate-Registry
    const registry = new Registry({
      loadGrammar: () => fetchTypescriptGrammar(),
      onigLib: fetchOniguruma(),
    });

    // Lade die JavaScript-Grammatik
    registry.loadGrammar("source.tsx").then(grammar => {
      if (grammar) {
        let ruleStack = null;
        const lines = sourceCode.split("\n");

        // Tokenisiere jede Zeile
        for (const line of lines) {
          const result = grammar.tokenizeLine(line, ruleStack);
          console.log(line, result.tokens);
          ruleStack = result.ruleStack;
        }
      }
    });
  }, []);

  return (
    <textarea
      className="w-full h-full outline-none caret-black font-mono bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
      defaultValue={sourceCode}
    />
  );
}
