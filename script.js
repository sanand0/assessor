import { html, render } from "https://cdn.jsdelivr.net/npm/lit-html@2.7.0/lit-html.min.js";
import { getProfile } from "https://aipipe.org/aipipe.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const state = {
  documents: [],
  clauses: [],
  results: {},
  isAssessing: false,
  dragActive: false,
  token: null,
};

// Auth handling
const initAuth = async () => {
  const { token } = getProfile();
  if (!token) {
    document.getElementById("login").style.display = "block";
    document.getElementById("app").style.display = "none";
    return;
  }
  state.token = token;
  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";
};

// File conversion
const convertPdfToText = async (file) => {
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = await Promise.all(
    Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1).then((page) => page.getTextContent()))
  );
  return pages.flatMap((content) => content.items.map((item) => item.str)).join(" ");
};

const convertFileToText = async (file) => {
  try {
    if (file.type === "application/pdf") return await convertPdfToText(file);
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
      return (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
    if (file.type === "text/plain") return await file.text();
    throw new Error("Unsupported file type");
  } catch (error) {
    console.error(`Error converting ${file.name}:`, error);
    return null;
  }
};

// LLM API
const assessDocumentClauses = async (doc, clauses) => {
  const prompt = `
Analyze the following document content for the presence of specified clauses.
For each clause, determine if it is present (true/false) and provide a brief reason with citation.

Document content:
${doc.content.slice(0, 8000)}... // Truncated for API limits

Clauses to check:
${clauses.map((c) => `- ${c.text}`).join("\n")}

Respond with a JSON object in this exact format:
{
    "results": [
        {
            "clause": "clause text here",
            "isPresent": true/false,
            "reason": "Brief explanation with citation from the document"
        },
        // ... for each clause
    ]
}`;

  const response = await fetch("https://aipipe.org/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${state.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    }),
  }).then((r) => r.json());

  const results = {};
  try {
    const parsed = JSON.parse(response.choices[0].message.content);
    parsed.results.forEach((result) => {
      const clause = state.clauses.find((c) => c.text === result.clause);
      if (clause)
        results[clause.id] = {
          loading: false,
          data: {
            present: result.isPresent,
            citation: result.reason,
          },
          timestamp: Date.now(),
        };
    });
  } catch (error) {
    console.error("Error parsing LLM response:", error);
  }
  return results;
};

// Drag and drop handling
const setupDragDrop = () => {
  const zone = document.querySelector(".upload-zone");
  ["dragenter", "dragover", "dragleave", "drop"].forEach((event) =>
    zone.addEventListener(event, (e) => {
      e.preventDefault();
      e.stopPropagation();
    })
  );

  ["dragenter", "dragover"].forEach((event) =>
    zone.addEventListener(event, () => {
      state.dragActive = true;
      zone.classList.add("pulse-border");
      updateUI();
    })
  );

  ["dragleave", "drop"].forEach((event) =>
    zone.addEventListener(event, () => {
      state.dragActive = false;
      zone.classList.remove("pulse-border");
      updateUI();
    })
  );

  zone.addEventListener("drop", async (e) => {
    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  });
};

// File handling
const handleFiles = async (files) => {
  for (const file of files) {
    const text = await convertFileToText(file);
    if (text) {
      state.documents.push({
        name: file.name,
        content: text,
        type: file.type,
        id: Date.now() + Math.random(),
      });
      updateUI();
    }
  }
};

document.getElementById("documentUpload").addEventListener("change", async (e) => {
  await handleFiles(Array.from(e.target.files));
  e.target.value = "";
});

// Clause handling
document.getElementById("addClause").addEventListener("click", () => {
  const input = document.getElementById("clauseInput");
  if (input.value.trim()) {
    state.clauses.push({
      text: input.value.trim(),
      id: Date.now() + Math.random(),
    });
    input.value = "";
    updateUI();
  }
});

document.getElementById("clauseInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") document.getElementById("addClause").click();
});

// Assessment handling
document.getElementById("assessButton").addEventListener("click", async () => {
  if (state.isAssessing) return;
  state.isAssessing = true;
  updateUI();

  for (const doc of state.documents) {
    if (!state.results[doc.id]) state.results[doc.id] = {};
    state.clauses.forEach((clause) => {
      state.results[doc.id][clause.id] = { loading: true };
    });
    updateUI();

    const results = await assessDocumentClauses(doc, state.clauses);
    state.results[doc.id] = { ...state.results[doc.id], ...results };
    updateUI();
  }

  state.isAssessing = false;
  updateUI();
});

// UI Templates
const documentTemplate = () =>
  html` ${state.documents.map(
    (doc) => html`
      <div class="list-group-item d-flex justify-content-between align-items-center animate__animated animate__fadeIn">
        <span title="${doc.name}">
          <i class="bi ${getFileIcon(doc.type)} me-2 text-primary"></i>
          ${doc.name}
        </span>
        <button
          class="btn btn-sm btn-outline-danger btn-float"
          @click=${() => {
            delete state.results[doc.id];
            state.documents = state.documents.filter((d) => d !== doc);
            updateUI();
          }}
        >
          <i class="bi bi-trash3"></i>
        </button>
      </div>
    `
  )}`;

const getFileIcon = (type) => {
  if (type === "application/pdf") return "bi-file-pdf";
  if (type.includes("wordprocessingml")) return "bi-file-word";
  return "bi-file-text";
};

const clauseTemplate = () =>
  html` ${state.clauses.map(
    (clause) => html`
      <div class="list-group-item d-flex justify-content-between align-items-center animate__animated animate__fadeIn">
        <span>
          <i class="bi bi-check-circle me-2 text-primary"></i>
          ${clause.text}
        </span>
        <button
          class="btn btn-sm btn-outline-danger btn-float"
          @click=${() => {
            Object.values(state.results).forEach((r) => delete r[clause.id]);
            state.clauses = state.clauses.filter((c) => c !== clause);
            updateUI();
          }}
        >
          <i class="bi bi-trash3"></i>
        </button>
      </div>
    `
  )}`;

const getCellContent = (result) => {
  if (!result)
    return html` <div class="clause-cell d-flex align-items-center justify-content-center text-muted">
      <i class="bi bi-dash-circle fs-4"></i>
    </div>`;
  if (result.loading)
    return html` <div
      class="clause-cell d-flex align-items-center justify-content-center animate__animated animate__pulse animate__infinite"
    >
      <div class="spinner-border progress-spinner text-primary"></div>
    </div>`;
  const isNew = Date.now() - result.timestamp < 2000;
  return html`
    <div
      class="clause-cell d-flex align-items-center justify-content-center
                    ${result.data.present ? "text-success" : "text-danger"}
                    ${isNew ? "animate__animated animate__bounceIn" : ""}"
      data-bs-toggle="tooltip"
      title="${result.data.citation}"
    >
      <i class="bi ${result.data.present ? "bi-check-circle-fill" : "bi-x-circle-fill"} fs-4"></i>
    </div>
  `;
};

const resultsTemplate = () => html`
  ${state.documents.length && state.clauses.length
    ? html`
        <table class="table table-bordered">
          <thead class="table-light">
            <tr>
              <th class="align-middle">Document</th>
              ${state.clauses.map((clause) => html` <th class="text-center align-middle">${clause.text}</th> `)}
            </tr>
          </thead>
          <tbody>
            ${state.documents.map(
              (doc) => html`
                <tr>
                  <td class="align-middle">
                    <i class="bi ${getFileIcon(doc.type)} me-2 text-primary"></i>
                    ${doc.name}
                  </td>
                  ${state.clauses.map(
                    (clause) => html`
                      <td
                        class="p-0 text-center"
                        @click=${async () => {
                          if (!state.results[doc.id]) state.results[doc.id] = {};
                          state.results[doc.id][clause.id] = { loading: true };
                          updateUI();
                          const result = await mockAssessDocument(doc, clause);
                          state.results[doc.id][clause.id] = {
                            loading: false,
                            data: result,
                            timestamp: Date.now(),
                          };
                          updateUI();
                        }}
                      >
                        ${getCellContent(state.results[doc.id]?.[clause.id])}
                      </td>
                    `
                  )}
                </tr>
              `
            )}
          </tbody>
        </table>
      `
    : html`
        <div class="text-center text-muted py-5">
          <i class="bi bi-table display-1 mb-3 d-block"></i>
          <h5>No Results Yet</h5>
          <p>Upload documents and add clauses to see assessment results</p>
        </div>
      `}
`;

const updateUI = () => {
  render(documentTemplate(), document.getElementById("documentList"));
  render(clauseTemplate(), document.getElementById("clauseList"));
  render(resultsTemplate(), document.getElementById("resultsTable"));
  document.getElementById("assessButton").disabled =
    !state.documents.length || !state.clauses.length || state.isAssessing;
};

// Initialize
initAuth();
setupDragDrop();
updateUI();
