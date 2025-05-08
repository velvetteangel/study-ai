// JavaScript for handling file upload, confirmation, and summarization

const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const okButton = document.getElementById('okButton');
const summaryContent = document.getElementById('summaryContent');

// Handle file upload
uploadButton.addEventListener('click', () => {
  if (fileInput.files.length > 0) {
    const fileName = fileInput.files[0].name;

    summaryContent.innerHTML = `
      <p><strong>${fileName}</strong> uploaded successfully!</p>
      <p>Please click "OK" to proceed with summarization.</p>
    `;

    // Show the OK button
    okButton.classList.remove('hidden');
  } else {
    alert('Please upload a file first!');
  }
});

// Handle "OK" confirmation and summarization
okButton.addEventListener('click', async () => {
  const file = fileInput.files[0];

  if (!file) {
    alert('No file uploaded. Please upload a file first.');
    return;
  }

  summaryContent.innerHTML = `
    <p>Extracting text and summarizing your content...</p>
  `;

  try {
    // Extract text from the uploaded file
    const extractedText = await extractTextFromFile(file);

    // Summarize the extracted text using AI API
    const summary = await summarizeText(extractedText);

    // Display the summary
    summaryContent.innerHTML = `
      <h3>Summary:</h3>
      <p>${summary}</p>
    `;
  } catch (error) {
    summaryContent.innerHTML = `
      <p>Error: ${error.message}</p>
    `;
  }
});

// Function to extract text from a file (PDF or DOC)
async function extractTextFromFile(file) {
  if (file.type === 'application/pdf') {
    // Use PDF.js library for extracting text from PDF
    const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js');
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(' ');
    }

    return text;
  } else if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // Use a library like Mammoth.js for extracting text from Word documents
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or Word document.');
  }
}

// Function to summarize text using an AI summarization API
async function summarizeText(text) {
  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer YOUR_API_KEY`, // Replace with your OpenAI API key
    },
    body: JSON.stringify({
      model: 'text-davinci-003', // Choose the appropriate model
      prompt: `Summarize the following study material in a concise and clear manner:\n\n${text}`,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to summarize the text.');
  }

  const data = await response.json();
  return data.choices[0].text.trim();
}