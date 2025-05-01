# Document Assessor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://sanand0.github.io/assessor/)

Document Assessor is an AI-powered tool that automatically analyzes documents for specific clauses and terms, providing instant verification with cited evidence. It streamlines document review processes that traditionally require manual inspection.

![Document Assessor Screenshot](prompts/functionality-1.webp)

## Why Use Document Assessor?

Document review is a critical but time-consuming task across many industries. This tool helps:

- **Legal Teams**: Verify standard clauses across contracts, NDAs, and agreements
- **HR Departments**: Check employment contracts for required terms and compliance
- **Compliance Officers**: Audit documents for regulatory requirements and policy adherence
- **Real Estate Agents**: Review property documents for specific terms and conditions
- **Financial Analysts**: Extract and verify specific terms from financial documents
- **Procurement Teams**: Validate vendor contracts for required clauses and terms

## Features

- 📄 Support for multiple document formats (PDF, DOCX, TXT)
- 🔍 Concurrent clause checking across documents
- 💡 AI-powered analysis with GPT-4.1 Mini
- 📊 Visual results matrix with detailed explanations
- ⚡ Instant feedback with progress indicators
- 💾 Smart caching to prevent redundant analysis
- 🎯 Cited evidence for every assessment

## Usage

1. **Upload Documents**: Drag and drop or browse to upload your documents
2. **Add Clauses**: Enter the specific clauses or terms you want to verify
3. **Assess**: Click the "Assess Documents" button to start the analysis
4. **Review**: Click on any result cell to see detailed findings with citations

## Developer Setup

This is a static HTML application that can be deployed anywhere. To get started:

1. Clone the repository:

   ```bash
   git clone https://github.com/sanand0/assessor.git
   cd assessor
   ```

2. No build steps required! Simply serve the directory using any static file server:

   ```bash
   # Using Python
   python3 -m http.server 8000

   # Or using Node.js
   npx serve
   ```

3. Open `http://localhost:8000` in your browser

### Configuration

The application uses [AI Pipe](https://github.com/sanand0/aipipe) for LLM API access. Users will need to authenticate with their Google account to use the API.

## Architecture

- **Frontend**: Pure HTML/JavaScript application
- **UI Framework**: Bootstrap 5 for styling
- **Templating**: lit-html for efficient DOM updates
- **Document Processing**:
  - PDF.js for PDF parsing
  - Mammoth.js for DOCX conversion
- **AI Integration**: GPT-4.1 Mini via AI Pipe

## About

This application was entirely created through LLM-driven development, with no manual coding intervention. The entire development process, from design to implementation, was guided through prompts to AI assistants. You can view the complete development journey and prompts in the [prompts/README.md](prompts/README.md) file.
