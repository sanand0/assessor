# Prompts

## Ideate Design

ChatGPT O4 Mini High:

> I want you to view the visual design or simply the full screenshot or pre-shot of an application for autonomous driving. This application is a document architecture. Users can upload articles, PDF files, or world documents, or any government documents. They can also specify a set of terms they want to access, seen in the document. For example, if it is a legal contract, they may want to specify the terms they want to access. They would specify these clauses one by one in a box, and once the application is done, the application will then send the document to an LLM, along with these clauses, check which of these clauses are present, yes or no, and return it along with a reason or a rationale. It should be a citation saying, here is where the clause is present, or here is the text that indicates this clause is present, or no, there is no such clause that is present. That may be the reason. This would be, as the documents are progressing, captured and the progress shown on the screen. You would also be, like, populating a table, where each of the documents is a row, and each of the clauses is a column, and the cells contain a visual indication, maybe with a graphic of colors, of the user. So, users would be able to see the progress as things are moving along, as the LLM is making the request. They see the first cell may be turned red, because the first request came through, and the first response has been populated, and the clause is not present. And then, it's still working on the second, so that may be a stringer in the second cell, and then it turns green, because the clause is present. They hover over any of these, or click on any of these, and a pop-up appears, showing the exact reason why that particular cell was created, or red, in which case, that's only the reason the clause is just getting from the document. I'd like you to create a beautiful, modern, visual design for this application.

The citation should reference the specific clause or text indicating whether it is present. If the clause is missing, the source should indicate that too. This could be represented visually on a table, where each document is a row and each clause is a column, with colors or other indicators in the cells showing the status of each clause across the documents. That way, the clauses' progress is tracked visually.

The user wants a beautiful, modern visual design for an app that tracks document progress. The UI should show progress updates where cells turn red or green based on whether clauses are present, with tooltips explaining the results upon hover or click. They might be asking for a more polished design or a mockup. We could suggest a layout or describe it as a React component structure using Tailwind and ShadCN UI, though I’m not sure if that’s exactly what they’re looking for. I'll focus on delivering a sleek, user-friendly concept.

![Design](design-1.webp)

> I don't need the sidebar. If there are several clauses, it should not spill over vertically and the Upload Document section and Clauses to Check section should have equal heights. Finally, I would like the cells to contain pretty icons -- it looks plain right now.

![Design](design-2.webp)

## Create Scaffolding

GitHub Copilot (Agent) with Claude 3.5 Sonnet:

> #file:README.md has the context of the application I'm building. #file:design-2.webp is the design I'm looking for.
> Create the SCAFFOLDING for this in #file:index.html using Bootstrap (minimize custom styles, prefer Bootstrap classes). Create a script.js that uses lit-html to implement basic functionality. For now, mock the LLM call as an API.
> Write VERY concise code.

![Scaffolding](scaffolding-1.webp)

[🔗 Commit](https://github.com/sanand0/assessor/commit/d72ff9d)

## Update Scaffolding

> The uploaded filenames should fit within the list and not go outside.
> Ensure that the table header height does not exceed 3 rows (in case there are long clauses).
> Ensure that the table's first column does not exceed 25 em width (in case there are long filenames).
> Convert files and store files as text as they are uploaded using Mammoth (for DOCX) and PDFJS (for PDF) via CDN.

![Scaffolding](scaffolding-2.webp)

> The table header row height still exceeds what we want. If it'll be complex to implement, undo all changes related to table row height.
> Add an "Assess" button that will trigger the assessment, at which point we will call the LLM API (mocked) document by document.
> Shorten and simplify #file:script.js. Avoid braces for single-line blocks. Make the code elegant, readable, modern.

![Scaffolding](scaffolding-3.webp)
