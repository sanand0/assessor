import { html, render } from "https://cdn.jsdelivr.net/npm/lit-html@2.7.0/lit-html.min.js";

let documents = [];
let clauses = [];
let results = {};

// Mock API call
const assessDocument = async (doc, clause) => {
  await new Promise((r) => setTimeout(r, Math.random() * 2000));
  return {
    present: Math.random() > 0.5,
    citation:
      Math.random() > 0.5
        ? `Found in section ${Math.floor(Math.random() * 10)}: "${clause}"`
        : `No matching clause found in document`,
  };
};

// Document handling
document.getElementById("documentUpload").addEventListener("change", (e) => {
  documents = [...documents, ...Array.from(e.target.files)];
  renderAll();
});

// Clause handling
document.getElementById("addClause").addEventListener("click", () => {
  const input = document.getElementById("clauseInput");
  if (input.value.trim()) {
    clauses.push(input.value.trim());
    input.value = "";
    renderAll();
  }
});

// Render functions
const documentTemplate = () => html`
  ${documents.map(
    (doc) => html`
      <div class="list-group-item d-flex justify-content-between align-items-center">
        <span>${doc.name}</span>
        <button
          class="btn btn-sm btn-danger"
          @click=${() => {
            documents = documents.filter((d) => d !== doc);
            renderAll();
          }}
        >
          ×
        </button>
      </div>
    `
  )}
`;

const clauseTemplate = () => html`
  ${clauses.map(
    (clause) => html`
      <div class="list-group-item d-flex justify-content-between align-items-center">
        <span>${clause}</span>
        <button
          class="btn btn-sm btn-danger"
          @click=${() => {
            clauses = clauses.filter((c) => c !== clause);
            renderAll();
          }}
        >
          ×
        </button>
      </div>
    `
  )}
`;

const getCellContent = (result) => {
  if (!result)
    return html`<div class="clause-cell d-flex align-items-center justify-content-center text-muted">-</div>`;
  if (result.loading)
    return html` <div class="clause-cell d-flex align-items-center justify-content-center">
      <div class="spinner-border progress-spinner text-primary"></div>
    </div>`;
  return html`
    <div
      class="clause-cell d-flex align-items-center justify-content-center ${result.data.present
        ? "text-success"
        : "text-danger"}"
      data-bs-toggle="tooltip"
      title="${result.data.citation}"
    >
      <i class="bi ${result.data.present ? "bi-check-circle-fill" : "bi-x-circle-fill"} fs-4"></i>
    </div>
  `;
};

const resultsTemplate = () => html`
  <table class="table table-bordered">
    <thead>
      <tr>
        <th>Document</th>
        ${clauses.map((clause) => html`<th class="text-center">${clause}</th>`)}
      </tr>
    </thead>
    <tbody>
      ${documents.map(
        (doc) => html`
          <tr>
            <td>${doc.name}</td>
            ${clauses.map(
              (clause) => html`
                <td
                  class="p-0 text-center"
                  @click=${async () => {
                    if (!results[doc.name]) results[doc.name] = {};
                    results[doc.name][clause] = { loading: true };
                    renderAll();
                    const result = await assessDocument(doc, clause);
                    results[doc.name][clause] = { loading: false, data: result };
                    renderAll();
                  }}
                >
                  ${getCellContent(results[doc.name]?.[clause])}
                </td>
              `
            )}
          </tr>
        `
      )}
    </tbody>
  </table>
`;

const renderAll = () => {
  render(documentTemplate(), document.getElementById("documentList"));
  render(clauseTemplate(), document.getElementById("clauseList"));
  render(resultsTemplate(), document.getElementById("resultsTable"));
};

renderAll();
