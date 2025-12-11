document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ideaForm");
  const input = document.getElementById("idea-input");
  const errorMsg = document.getElementById("error-msg");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // stop reload

    const idea = input.value.trim();
    if (!idea) {
      errorMsg.style.display = "block";
      return;
    }

    errorMsg.style.display = "none";
    localStorage.setItem("ideaText", idea);
    window.location.href = "resurrect.html";
  });
});
