export interface ThemeSettings {
  foreground: string;
  [key: string]: any;
}

export interface TokenColor {
  scope: string | string[];
  settings: ThemeSettings;
}

export interface SemanticTokenColors {
  [token: string]: ThemeSettings;
}

export interface ThemeColors {
  [color: string]: string;
}

export interface Theme {
  name: string;
  type: string;
  semanticHighlighting: boolean;
  semanticTokenColors: SemanticTokenColors;
  tokenColors: TokenColor[];
  colors: ThemeColors;
}
