"use client";

import { useEffect, useState } from "react";
import { loadWASM, createOnigScanner, createOnigString } from "vscode-oniguruma";
import { Registry } from "vscode-textmate";

import type { IRawGrammar, IGrammar, IOnigLib, IRawTheme } from "vscode-textmate";
import type { Theme } from "../theme.type";

async function fetchOniguruma(): Promise<IOnigLib> {
  return fetch("/onig.wasm")
    .then(data => loadWASM({ data }))
    .then(() => ({ createOnigScanner, createOnigString }));
}

async function fetchTypescriptGrammar(): Promise<IRawGrammar> {
  const response = await fetch("/tsx.tmLanguage.json");
  return await response.json();
}

async function fetchTheme(): Promise<Theme> {
  const response = await fetch("/one-dark-pro.json");
  return await response.json();
}

interface TokenInfo {
  start: number;
  end: number;
  scope: string;
  color: string | undefined;
}

function findColorForScope(scope: string, colorMap: { [scope: string]: string }): string | undefined {
  let parts = scope.split(".");
  while (parts.length > 0) {
    const currentScope = parts.join(".");
    if (colorMap[currentScope]) {
      return colorMap[currentScope];
    }
    parts.pop();
  }
  return undefined; // Fallback-Farbe als undefined
}

function tokenizeSourceCode(sourceCode: string, grammar: IGrammar, theme: Theme): TokenInfo[] {
  const lines = sourceCode.split("\n");
  let ruleStack = null;
  const allTokens: TokenInfo[] = [];

  // Erstelle Farbkarte aus dem Theme
  const colorMap: { [scope: string]: string } = {};
  theme.tokenColors.forEach(setting => {
    if (setting.scope && setting.settings.foreground) {
      const scopes = Array.isArray(setting.scope) ? setting.scope : setting.scope.split(",");
      scopes.forEach(scope => {
        colorMap[scope.trim()] = setting.settings.foreground;
      });
    }
  });

  // Tokenisiere jede Zeile
  for (const line of lines) {
    const result = grammar.tokenizeLine(line, ruleStack);
    const mappedTokens = result.tokens.map(token => {
      const lastScope = token.scopes[token.scopes.length - 1];
      const color = findColorForScope(lastScope, colorMap);
      return {
        start: token.startIndex,
        end: token.endIndex,
        scope: lastScope,
        color,
      };
    });
    allTokens.push(...mappedTokens);
    ruleStack = result.ruleStack;
  }

  return allTokens;
}

const sourceCode = `
const x = 10;

function hello() {
  console.log("Hello, world!", x);
}`.trim();

export function Editor() {
  useEffect(() => {
    // Initialisiere das TextMate-Registry
    const registry = new Registry({
      loadGrammar: () => fetchTypescriptGrammar(),
      onigLib: fetchOniguruma(),
    });

    Promise.all([registry.loadGrammar("source.tsx"), fetchTheme()]).then(([grammar, theme]) => {
      const colorMap: { [scope: string]: string } = {};

      if (grammar) {
        const tokens = tokenizeSourceCode(sourceCode, grammar, theme);

        console.log(tokens);
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
