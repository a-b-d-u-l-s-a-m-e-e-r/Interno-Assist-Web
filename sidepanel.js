// =====================================================
// INTERNO-ASSIST SIDE PANEL
// =====================================================

let latestAIResponse = "";

let currentSelectedText = "";

let currentSourceUrl = null;


// =====================================================
// API URL
// =====================================================

const API_URL =
    "http://localhost:8080/api/assist/process";

const DOWNLOAD_PDF_API_URL =
    "http://localhost:8080/api/assist/download";


// =====================================================
// TOP TRANSLATION LANGUAGES
// =====================================================

const TRANSLATION_LANGUAGES = [

    {
        name: "English",
        value: "English"
    },

    {
        name: "Hindi",
        value: "Hindi"
    },

    {
        name: "Marathi",
        value: "Marathi"
    },

    {
        name: "Spanish",
        value: "Spanish"
    },

    {
        name: "French",
        value: "French"
    },

    {
        name: "German",
        value: "German"
    },

    {
        name: "Portuguese",
        value: "Portuguese"
    },

    {
        name: "Chinese",
        value: "Chinese"
    },

    {
        name: "Japanese",
        value: "Japanese"
    },

    {
        name: "Arabic",
        value: "Arabic"
    }

];


// =====================================================
// INITIALIZE SIDE PANEL
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        document
            .getElementById("submitBtn")
            .addEventListener(
                "click",
                processText
            );


        document
            .getElementById("saveNotesBtn")
            .addEventListener(
                "click",
                saveNotes
            );


        document
            .getElementById("clearNotesBtn")
            .addEventListener(
                "click",
                clearNotes
            );


        // -------------------------------------------------
        // DOWNLOAD ALL NOTES
        // -------------------------------------------------

        document
            .getElementById("downloadNotesBtn")
            .addEventListener(
                "click",
                downloadNotesAsPdf
            );


        await loadNotes();

        await loadSelectedText();


        // -------------------------------------------------
        // Listen for selected text changes
        // -------------------------------------------------

        chrome.storage.onChanged.addListener(
            handleStorageChange
        );

    }
);


// =====================================================
// HANDLE STORAGE CHANGES
// =====================================================

function handleStorageChange(
    changes,
    areaName
) {

    if (areaName !== "local") {
        return;
    }


    // -------------------------------------------------
    // Selected text changed
    // -------------------------------------------------

    if (changes.selectedText) {

        const selectedText =
            changes.selectedText.newValue;


        if (
            typeof selectedText === "string" &&
            selectedText
        ) {

            currentSelectedText =
                selectedText;


            const textElement =
                document.getElementById(
                    "selectedText"
                );


            if (textElement) {

                textElement.value =
                    selectedText;

            }

        }

    }


    // -------------------------------------------------
    // Source URL changed
    // -------------------------------------------------

    if (changes.selectedSourceUrl) {

        const sourceUrl =
            changes.selectedSourceUrl.newValue;


        if (
            typeof sourceUrl === "string" &&
            sourceUrl
        ) {

            currentSourceUrl =
                sourceUrl;


            console.log(
                "Current source URL updated:",
                currentSourceUrl
            );

        }

    }

}


// =====================================================
// LOAD SELECTED TEXT
// =====================================================

async function loadSelectedText() {

    try {

        const data =
            await chrome.storage.local.get([
                "selectedText",
                "selectedSourceUrl"
            ]);


        // -------------------------------------------------
        // Load selected text
        // -------------------------------------------------

        const selectedText =
            data.selectedText || "";


        if (selectedText) {

            currentSelectedText =
                selectedText;


            const textElement =
                document.getElementById(
                    "selectedText"
                );


            if (textElement) {

                textElement.value =
                    selectedText;

            }

        }


        // -------------------------------------------------
        // Load source URL
        // -------------------------------------------------

        const sourceUrl =
            data.selectedSourceUrl || null;


        if (sourceUrl) {

            currentSourceUrl =
                sourceUrl;

        }


        console.log(
            "Loaded selected text:",
            currentSelectedText
        );


        console.log(
            "Loaded source URL:",
            currentSourceUrl
        );


    } catch (error) {

        console.error(
            "Unable to load selected text:",
            error
        );

    }

}


// =====================================================
// PROCESS TEXT
// =====================================================

async function processText() {

    const textElement =
        document.getElementById(
            "selectedText"
        );


    const action =
        document.getElementById(
            "actionSelect"
        ).value;


    const text =
        textElement.value.trim();


    if (!text) {

        showResult(
            "Please select some text from the webpage."
        );

        return;

    }


    currentSelectedText =
        text;


    const submitBtn =
        document.getElementById(
            "submitBtn"
        );


    submitBtn.disabled = true;


    showResult(
        "Processing..."
    );


    try {

        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        content: text,

                        operation: action

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                `API Error: ${response.status}`
            );

        }


        const aiResponse =
            await response.text();


        latestAIResponse =
            aiResponse;


        showResult(
            aiResponse
        );


    } catch (error) {

        console.error(
            "AI request failed:",
            error
        );


        showResult(
            "Unable to process your request.\n\n" +
            error.message
        );

    } finally {

        submitBtn.disabled = false;

    }

}


// =====================================================
// DISPLAY AI RESULT
// =====================================================

function showResult(content) {

    const results =
        document.getElementById(
            "results"
        );


    results.innerHTML = "";


    const resultItem =
        document.createElement(
            "div"
        );


    resultItem.className =
        "result-content";


    const isProcessing =
        content === "Processing..." ||
        content === "Translating...";


    const isError =
        content.startsWith(
            "Unable to"
        );


    if (
        isProcessing ||
        isError
    ) {

        resultItem.textContent =
            content;

    } else {

        resultItem.innerHTML =
            markdownToHtml(
                content
            );

    }


    results.appendChild(
        resultItem
    );


    // -------------------------------------------------
    // Don't show action buttons during processing/error
    // -------------------------------------------------

    if (
        isProcessing ||
        isError
    ) {

        return;

    }


    // =================================================
    // RESULT ACTIONS
    // =================================================

    const actions =
        document.createElement(
            "div"
        );


    actions.className =
        "result-actions";


    // =================================================
    // COPY BUTTON
    // =================================================

    const copyButton =
        document.createElement(
            "button"
        );


    copyButton.textContent =
        "Copy";


    copyButton.title =
        "Copy response";


    copyButton.addEventListener(
        "click",
        () => copyResponse(content)
    );


    // =================================================
    // TRANSLATE BUTTON
    // =================================================

    const translateButton =
        document.createElement(
            "button"
        );


    translateButton.textContent =
        "Translate";


    translateButton.title =
        "Translate response";


    translateButton.addEventListener(
        "click",
        () =>
            showTranslationLanguages(
                content
            )
    );


    // =================================================
    // MOVE TO NOTES
    // =================================================

    const moveToNotesButton =
        document.createElement(
            "button"
        );


    moveToNotesButton.textContent =
        "Move to Notes";


    moveToNotesButton.title =
        "Move response to research notes";


    moveToNotesButton.addEventListener(
        "click",
        () =>
            moveResponseToNotes(
                content
            )
    );


    // -------------------------------------------------
    // Button order
    // -------------------------------------------------

    actions.appendChild(
        copyButton
    );


    actions.appendChild(
        translateButton
    );


    actions.appendChild(
        moveToNotesButton
    );


    results.appendChild(
        actions
    );

}


// =====================================================
// TRANSLATION LANGUAGE PANEL
// =====================================================

function showTranslationLanguages(
    content
) {

    const results =
        document.getElementById(
            "results"
        );


    const existing =
        document.getElementById(
            "translationPanel"
        );


    if (existing) {
        existing.remove();
    }


    const translationPanel =
        document.createElement(
            "div"
        );


    translationPanel.id =
        "translationPanel";


    translationPanel.className =
        "translation-panel";


    // =================================================
    // TITLE
    // =================================================

    const title =
        document.createElement(
            "div"
        );


    title.className =
        "translation-title";


    title.textContent =
        "Translate to";


    // =================================================
    // LANGUAGE SELECT
    // =================================================

    const languageSelect =
        document.createElement(
            "select"
        );


    languageSelect.id =
        "translationLanguage";


    TRANSLATION_LANGUAGES.forEach(
        language => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                language.value;


            option.textContent =
                language.name;


            languageSelect.appendChild(
                option
            );

        }
    );


    // =================================================
    // TRANSLATE NOW
    // =================================================

    const translateNowButton =
        document.createElement(
            "button"
        );


    translateNowButton.textContent =
        "Submit";


    translateNowButton.addEventListener(
        "click",
        () => {

            const language =
                languageSelect.value;


            translateResponse(
                content,
                language
            );

        }
    );


    // =================================================
    // CLOSE BUTTON
    // =================================================

    const closeButton =
        document.createElement(
            "button"
        );


    closeButton.textContent =
        "Cancel";


    closeButton.addEventListener(
        "click",
        () => {

            translationPanel.remove();

        }
    );


    translationPanel.appendChild(
        title
    );


    translationPanel.appendChild(
        languageSelect
    );


    translationPanel.appendChild(
        translateNowButton
    );


    translationPanel.appendChild(
        closeButton
    );


    results.appendChild(
        translationPanel
    );

}


// =====================================================
// TRANSLATE RESPONSE
// =====================================================

async function translateResponse(
    content,
    language
) {

    const translationPanel =
        document.getElementById(
            "translationPanel"
        );


    if (translationPanel) {
        translationPanel.remove();
    }


    const originalResponse =
        latestAIResponse;


    showResult(
        "Translating..."
    );


    try {

        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        content: content,

                        operation: "translate",

                        language: language

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                `Translation API Error: ${response.status}`
            );

        }


        const translatedText =
            await response.text();


        latestAIResponse =
            translatedText;


        showResult(
            translatedText
        );


    } catch (error) {

        console.error(
            "Translation failed:",
            error
        );


        latestAIResponse =
            originalResponse;


        showResult(
            "Unable to translate your response.\n\n" +
            error.message
        );

    }

}


// =====================================================
// MOVE RESPONSE TO NOTES
// =====================================================

function moveResponseToNotes(
    content
) {

    const notesElement =
        document.getElementById(
            "notes"
        );


    if (!notesElement) {

        console.error(
            "Research Notes textarea not found."
        );

        return;

    }


    notesElement.value =
        content;


    notesElement.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });


    setTimeout(
        () => {

            notesElement.focus();

        },
        300
    );

}


// =====================================================
// SAVE MANUAL NOTES
// =====================================================

async function saveNotes() {

    const notesElement =
        document.getElementById(
            "notes"
        );


    const notes =
        notesElement.value.trim();


    if (!notes) {

        alert(
            "Please enter some notes."
        );

        return;

    }


    try {

        // =================================================
        // IMPORTANT
        // =================================================
        //
        // DO NOT DO THIS:
        //
        // source: window.location.href
        //
        // because the side panel may currently be associated
        // with another webpage.
        //
        // Instead use currentSourceUrl, which was captured
        // when the text was originally selected.
        //
        // =================================================


        const data =
            await chrome.storage.local.get([
                "researchNotesList",
                "selectedSourceUrl"
            ]);


        const savedNotes =
            data.researchNotesList || [];


        // -------------------------------------------------
        // Use current source URL.
        //
        // Fallback to storage in case the side panel was
        // opened/reloaded.
        // -------------------------------------------------

        const sourceUrl =
            currentSourceUrl ||
            data.selectedSourceUrl ||
            null;


        savedNotes.push({

            id: Date.now(),

            type: "MANUAL_NOTE",

            operation: null,

            content: notes,

            source: sourceUrl,

            date: new Date().toLocaleString()

        });


        await chrome.storage.local.set({

            researchNotesList:
                savedNotes

        });


        console.log(
            "Note saved with source:",
            sourceUrl
        );


        notesElement.value =
            "";


        await loadNotes();


        alert(
            "Notes saved successfully."
        );


    } catch (error) {

        console.error(
            "Unable to save notes:",
            error
        );


        alert(
            "Unable to save notes."
        );

    }

}


// =====================================================
// LOAD SAVED NOTES
// =====================================================

async function loadNotes() {

    try {

        const data =
            await chrome.storage.local.get(
                ["researchNotesList"]
            );


        const notes =
            data.researchNotesList || [];


        const notesList =
            document.getElementById(
                "savedNotesList"
            );


        if (!notesList) {
            return;
        }


        notesList.innerHTML =
            "";


        if (notes.length === 0) {

            notesList.innerHTML = `
                <div class="empty-result">
                    No saved notes yet.
                </div>
            `;

            return;

        }


        notes.forEach(
            note => {

                const noteElement =
                    document.createElement(
                        "div"
                    );


                noteElement.className =
                    "saved-note";


                // =================================================
                // DELETE BUTTON
                // =================================================

                const deleteButton =
                    document.createElement(
                        "button"
                    );


                deleteButton.className =
                    "delete-note";


                deleteButton.textContent =
                    "Delete";


                deleteButton.addEventListener(
                    "click",
                    () =>
                        deleteNote(
                            note.id
                        )
                );


                // =================================================
                // CONTENT
                // =================================================

                const content =
                    document.createElement(
                        "div"
                    );


                content.className =
                    "saved-note-content";


                content.innerHTML =
                    markdownToHtml(
                        note.content
                    );


                // =================================================
                // DATE
                // =================================================

                const date =
                    document.createElement(
                        "div"
                    );


                date.className =
                    "saved-note-date";


                if (note.operation) {

                    date.textContent =
                        `${capitalize(note.operation)} • ${note.date}`;

                } else {

                    date.textContent =
                        note.date;

                }


                // =================================================
                // SOURCE
                // =================================================

                if (note.source) {

                    const source =
                        document.createElement(
                            "div"
                        );


                    source.className =
                        "saved-note-source";


                    const sourceLabel =
                        document.createElement(
                            "span"
                        );


                    sourceLabel.textContent =
                        "Source: ";


                    const sourceLink =
                        document.createElement(
                            "a"
                        );


                    sourceLink.href =
                        note.source;


                    sourceLink.target =
                        "_blank";


                    sourceLink.rel =
                        "noopener noreferrer";


                    sourceLink.textContent =
                        note.source;


                    source.appendChild(
                        sourceLabel
                    );


                    source.appendChild(
                        sourceLink
                    );


                    noteElement.appendChild(
                        source
                    );

                }


                // =================================================
                // APPEND
                // =================================================

                noteElement.appendChild(
                    deleteButton
                );


                noteElement.appendChild(
                    content
                );


                noteElement.appendChild(
                    date
                );


                notesList.appendChild(
                    noteElement
                );

            }
        );


    } catch (error) {

        console.error(
            "Unable to load notes:",
            error
        );

    }

}


// =====================================================
// DELETE ONE NOTE
// =====================================================

async function deleteNote(
    id
) {

    try {

        const data =
            await chrome.storage.local.get(
                ["researchNotesList"]
            );


        const notes =
            data.researchNotesList || [];


        const updatedNotes =
            notes.filter(
                note =>
                    note.id !== id
            );


        await chrome.storage.local.set({

            researchNotesList:
                updatedNotes

        });


        await loadNotes();


    } catch (error) {

        console.error(
            "Unable to delete note:",
            error
        );

    }

}


// =====================================================
// DELETE ALL NOTES
// =====================================================

async function clearNotes() {

    try {

        const data =
            await chrome.storage.local.get(
                ["researchNotesList"]
            );


        const notes =
            data.researchNotesList || [];


        if (notes.length === 0) {
            return;
        }


        const confirmed =
            confirm(
                "Are you sure you want to delete all saved notes?"
            );


        if (!confirmed) {
            return;
        }


        await chrome.storage.local.remove(
            ["researchNotesList"]
        );


        await loadNotes();


    } catch (error) {

        console.error(
            "Unable to clear notes:",
            error
        );

    }

}


// =====================================================
// DOWNLOAD ALL NOTES AS PDF
// =====================================================

async function downloadNotesAsPdf() {

    const downloadButton =
        document.getElementById(
            "downloadNotesBtn"
        );


    try {

        // -------------------------------------------------
        // Get all saved notes
        // -------------------------------------------------

        const data =
            await chrome.storage.local.get(
                ["researchNotesList"]
            );


        const notes =
            data.researchNotesList || [];


        // -------------------------------------------------
        // Check notes
        // -------------------------------------------------

        if (notes.length === 0) {

            alert(
                "No saved notes available to download."
            );

            return;

        }


        // -------------------------------------------------
        // Disable button
        // -------------------------------------------------

        downloadButton.disabled =
            true;


        downloadButton.textContent =
            "Generating...";


        // =================================================
        // COMBINE ALL NOTES
        // =================================================

        const allNotes =
            notes
                .map(
                    (note, index) => {

                        return (

                            `Note ${index + 1}\n` +

                            `Date: ${note.date || ""}\n` +

                            `Source: ${note.source || "Not available"}\n\n` +

                            `${note.content || ""}`

                        );

                    }
                )
                .join(
                    "\n\n----------------------------------------\n\n"
                );


        // -------------------------------------------------
        // Send notes to backend
        // -------------------------------------------------

        const response =
            await fetch(
                DOWNLOAD_PDF_API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        content:
                            allNotes

                    })

                }
            );


        // -------------------------------------------------
        // Check response
        // -------------------------------------------------

        if (!response.ok) {

            throw new Error(
                `PDF API Error: ${response.status}`
            );

        }


        // -------------------------------------------------
        // Convert response to Blob
        // -------------------------------------------------

        const blob =
            await response.blob();


        // -------------------------------------------------
        // Create temporary URL
        // -------------------------------------------------

        const url =
            URL.createObjectURL(
                blob
            );


        // -------------------------------------------------
        // Create download link
        // -------------------------------------------------

        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "interno-assist-notes.pdf";


        document.body.appendChild(
            link
        );


        link.click();


        // -------------------------------------------------
        // Cleanup
        // -------------------------------------------------

        link.remove();


        URL.revokeObjectURL(
            url
        );


    } catch (error) {

        console.error(
            "Unable to download notes:",
            error
        );


        alert(
            "Unable to download notes as PDF.\n\n" +
            error.message
        );


    } finally {

        downloadButton.disabled =
            false;


        downloadButton.textContent =
            "Download PDF";

    }

}


// =====================================================
// MARKDOWN TO HTML
// =====================================================

function markdownToHtml(markdown) {

    if (!markdown) {
        return "";
    }


    let html =
        escapeHtml(markdown);


    // -------------------------------------------------
    // Code blocks
    // -------------------------------------------------

    html = html.replace(
        /```([\s\S]*?)```/g,
        '<pre class="code-block"><code>$1</code></pre>'
    );


    // -------------------------------------------------
    // Inline code
    // -------------------------------------------------

    html = html.replace(
        /`([^`\n]+)`/g,
        "<code>$1</code>"
    );


    // -------------------------------------------------
    // Bold
    // -------------------------------------------------

    html = html.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );


    // -------------------------------------------------
    // Italic
    // -------------------------------------------------

    html = html.replace(
        /(?<!\*)\*([^\*\n]+)\*(?!\*)/g,
        "<em>$1</em>"
    );


    // -------------------------------------------------
    // Headings
    // -------------------------------------------------

    html = html.replace(
        /^### (.*)$/gm,
        "<h4>$1</h4>"
    );


    html = html.replace(
        /^## (.*)$/gm,
        "<h3>$1</h3>"
    );


    html = html.replace(
        /^# (.*)$/gm,
        "<h2>$1</h2>"
    );


    // -------------------------------------------------
    // Markdown links
    // -------------------------------------------------

    html = html.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );


    // -------------------------------------------------
    // Numbered lists
    // -------------------------------------------------

    html = html.replace(
        /(^|\n)((?:\d+\.\s+.*(?:\n|$))+)/g,
        function (
            match,
            prefix,
            list
        ) {

            const items =
                list
                    .trim()
                    .split("\n")
                    .filter(Boolean)
                    .map(
                        item =>
                            item.replace(
                                /^\d+\.\s+/,
                                ""
                            )
                    )
                    .map(
                        item =>
                            `<li>${item}</li>`
                    )
                    .join("");


            return (
                `${prefix}<ol>${items}</ol>`
            );

        }
    );


    // -------------------------------------------------
    // Bullet lists
    // -------------------------------------------------

    html = html.replace(
        /(^|\n)((?:[-*•]\s+.*(?:\n|$))+)/g,
        function (
            match,
            prefix,
            list
        ) {

            const items =
                list
                    .trim()
                    .split("\n")
                    .filter(Boolean)
                    .map(
                        item =>
                            item.replace(
                                /^[-*•]\s+/,
                                ""
                            )
                    )
                    .map(
                        item =>
                            `<li>${item}</li>`
                    )
                    .join("");


            return (
                `${prefix}<ul>${items}</ul>`
            );

        }
    );


    // -------------------------------------------------
    // Paragraphs
    // -------------------------------------------------

    html = html.replace(
        /\n{2,}/g,
        "</p><p>"
    );


    html =
        "<p>" +
        html +
        "</p>";


    // -------------------------------------------------
    // Single line breaks
    // -------------------------------------------------

    html = html.replace(
        /\n/g,
        "<br>"
    );


    // -------------------------------------------------
    // Remove breaks around block elements
    // -------------------------------------------------

    html = html.replace(
        /<br>\s*(<(?:ul|ol|h2|h3|h4|pre)>)/g,
        "$1"
    );


    html = html.replace(
        /(<\/(?:ul|ol|h2|h3|h4|pre)>)\s*<br>/g,
        "$1"
    );


    // -------------------------------------------------
    // Remove empty paragraphs
    // -------------------------------------------------

    html = html.replace(
        /<p>\s*<\/p>/g,
        ""
    );


    return html;

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


// =====================================================
// COPY RESPONSE
// =====================================================

async function copyResponse(
    content
) {

    try {

        await navigator.clipboard.writeText(
            content
        );


        alert(
            "Response copied."
        );


    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );

    }

}


// =====================================================
// CAPITALIZE
// =====================================================

function capitalize(
    value
) {

    if (!value) {
        return "";
    }


    return (

        value.charAt(0).toUpperCase() +

        value.slice(1)

    );

}