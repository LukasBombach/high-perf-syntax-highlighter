import "./style.css";

const app = document.getElementById("app");

if (!app) {
  throw new Error("Failed to find app element");
}

const textarea = document.createElement("textarea");
app.classList.add("w-full", "h-full", "bg-gray-900", "text-white");
app.appendChild(textarea);
