import { afterEach, describe, expect, it } from "vitest";
import { oneDarkTheme } from "./core";
import { attachTextarea } from "./dom";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("attachTextarea", () => {
  it("applies and updates the textarea background", async () => {
    const textarea = document.createElement("textarea");
    textarea.value = "const value = 1;";
    document.body.append(textarea);

    const highlighter = attachTextarea(textarea, { theme: oneDarkTheme });

    await new Promise(resolve => setTimeout(resolve, 25));
    const initialImage = textarea.style.backgroundImage;
    expect(initialImage).toContain("data:image/png");

    textarea.value = "const value = 2;\nconst other = 3;";
    textarea.dispatchEvent(new Event("input"));
    await new Promise(resolve => setTimeout(resolve, 25));

    const updatedImage = textarea.style.backgroundImage;
    expect(updatedImage).toContain("data:image/png");
    expect(updatedImage).not.toBe(initialImage);

    highlighter.detach();
    const before = textarea.style.backgroundImage;

    textarea.value = "const detached = true;";
    textarea.dispatchEvent(new Event("input"));
    await new Promise(resolve => setTimeout(resolve, 25));

    expect(textarea.style.backgroundImage).toBe(before);
  });
});
