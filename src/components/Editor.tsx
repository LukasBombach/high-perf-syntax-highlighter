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

async function fetchTheme(): Promise<any> {
  const response = await fetch("/one-dark-pro.json");
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

    Promise.all([registry.loadGrammar("source.tsx"), fetchTheme()]).then(([grammar, theme]) => {
      const colorMap: { [scope: string]: string } = {};

      if (grammar) {
        // Mappe Scopes zu Farben
        theme.tokenColors.forEach((setting: any) => {
          if (setting.scope && setting.settings.foreground) {
            const scopes = Array.isArray(setting.scope) ? setting.scope : setting.scope.split(",");
            scopes.forEach((scope: any) => {
              colorMap[scope.trim()] = setting.settings.foreground;
            });
          }
        });

        let ruleStack = null;
        const lines = sourceCode.split("\n");

        // Tokenisiere jede Zeile
        for (const line of lines) {
          const result = grammar.tokenizeLine(line, ruleStack);
          const mappedTokens = result.tokens.map(token => {
            const color = colorMap[token.scopes[token.scopes.length - 1]];
            return {
              start: token.startIndex,
              end: token.endIndex,
              color: color || "#FF00FF", // Fallback-Farbe
            };
          });
          console.log(line, mappedTokens);
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
