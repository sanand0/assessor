const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export const sanitizeText = (text) => text.replace(/[<>]/g, (c) => ({ "<": "&lt;", ">": "&gt;" }[c]));

export const validateFile = (file) => {
  if (file.size > MAX_FILE_SIZE) throw new Error(`File ${file.name} exceeds 10MB limit`);
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error(`File type ${file.type} not supported`);
  return true;
};

export const getDocumentHash = (doc) => `${doc.name}-${doc.content.length}`;

export const showToast = (message, isError = false) => {
  const toast = document.createElement("div");
  toast.className = `toast align-items-center border-0 ${isError ? "bg-danger" : "bg-success"} text-white`;
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${sanitizeText(message)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  document.querySelector(".toast-container").appendChild(toast);
  new bootstrap.Toast(toast, { autohide: true, delay: 5000 }).show();
  toast.addEventListener("hidden.bs.toast", () => toast.remove());
};
