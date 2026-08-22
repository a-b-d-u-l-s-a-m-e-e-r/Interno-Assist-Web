let latestAIResponse = "";

let currentSelectedText = "";


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


        await loadNotes();

        await loadSelectedText();


        // Listen for selected text from content.js

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


    if (changes.selectedText) {

        const selectedText =
            changes.selectedText.newValue || "";


        if (!selectedText) {
            return;
        }


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


// =====================================================
// LOAD SELECTED TEXT
// =====================================================

async function loadSelectedText() {

    try {

        const data =
            await chrome.storage.local.get(
                ["selectedText"]
            );


        const selectedText =
            data.selectedText || "";


        if (!selectedText) {
            return;
        }


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
                "http://localhost:8080/api/assist/process",
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


    if (
        content === "Processing..." ||
        content.startsWith("Unable to")
    ) {

        resultItem.textContent =
            content;

    } else {

        resultItem.innerHTML =
            markdownToHtml(content);
    }


    results.appendChild(
        resultItem
    );


    // Do not display buttons for processing/error

    if (
        content === "Processing..." ||
        content.startsWith("Unable to")
    ) {

        return;
    }


    // =================================================
    // RESULT ACTION BUTTONS
    // =================================================

    const actions =
        document.createElement(
            "div"
        );


    actions.className =
        "result-actions";


    // COPY BUTTON

    const copyButton =
        document.createElement(
            "button"
        );


    copyButton.textContent =
        "Copy";


    copyButton.addEventListener(
        "click",
        () => copyResponse(content)
    );


    // MOVE TO NOTES

    const moveToNotesButton =
        document.createElement(
            "button"
        );


    moveToNotesButton.textContent =
        "Move to Notes";


    moveToNotesButton.addEventListener(
        "click",
        () => moveResponseToNotes(content)
    );


    // TRANSLATE BUTTON

    const translateButton =
        document.createElement(
            "button"
        );


    translateButton.textContent =
        "Translate";


    translateButton.addEventListener(
        "click",
        () => showTranslationLanguages(content)
    );


    actions.appendChild(
        copyButton
    );


    actions.appendChild(
        moveToNotesButton
    );


    actions.appendChild(
        translateButton
    );


    results.appendChild(
        actions
    );
}


// =====================================================
// TRANSLATION LANGUAGES
// =====================================================

function showTranslationLanguages(content) {

    const results =
        document.getElementById(
            "results"
        );


    // Remove previous language selector

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


    const title =
        document.createElement(
            "div"
        );


    title.className =
        "translation-title";


    title.textContent =
        "Translate to";


    const languageSelect =
        document.createElement(
            "select"
        );


    languageSelect.id =
        "translationLanguage";


    const languages = [

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


    languages.forEach(
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


    translationPanel.appendChild(
        title
    );


    translationPanel.appendChild(
        languageSelect
    );


    translationPanel.appendChild(
        translateNowButton
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

    const results =
        document.getElementById(
            "results"
        );


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
                "http://localhost:8080/api/assist/process",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        content:
                            content,

                        operation:
                            "translate",

                        language:
                            language

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
// MARKDOWN TO HTML
// =====================================================

function markdownToHtml(markdown) {

    if (!markdown) {
        return "";
    }


    let html =
        escapeHtml(markdown);


    // Code blocks

    html = html.replace(
        /```([\s\S]*?)```/g,
        '<pre class="code-block"><code>$1</code></pre>'
    );


    // Inline code

    html = html.replace(
        /`([^`\n]+)`/g,
        "<code>$1</code>"
    );


    // Bold

    html = html.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );


    // Italic

    html = html.replace(
        /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
        "<em>$1</em>"
    );


    // Headings

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


    // Numbered lists

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


    // Bullet lists

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


    // Paragraphs

    html = html.replace(
        /\n{2,}/g,
        "</p><p>"
    );


    html =
        "<p>" +
        html +
        "</p>";


    // Single line breaks

    html = html.replace(
        /\n/g,
        "<br>"
    );


    // Remove breaks around lists/headings

    html = html.replace(
        /<br>\s*(<(?:ul|ol|h2|h3|h4|pre))/g,
        "$1"
    );


    html = html.replace(
        /(<\/(?:ul|ol|h2|h3|h4|pre)>)\s*<br>/g,
        "$1"
    );


    // Remove empty paragraphs

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

async function copyResponse(content) {

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
// MOVE RESPONSE TO NOTES
// =====================================================

function moveResponseToNotes(content) {

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

        const data =
            await chrome.storage.local.get(
                ["researchNotesList"]
            );


        const savedNotes =
            data.researchNotesList || [];


        savedNotes.unshift({

            id: Date.now(),

            type: "MANUAL_NOTE",

            operation: null,

            content: notes,

            source: null,

            date:
                new Date()
                    .toLocaleString()
        });


        await chrome.storage.local.set({

            researchNotesList:
                savedNotes

        });


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


            // Delete button

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
                    deleteNote(note.id)
            );


            // Content

            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "saved-note-content";


            // IMPORTANT:
            // Use same Markdown rendering
            // as AI Response

            content.innerHTML =
                markdownToHtml(
                    note.content
                );


            // Date

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
}


// =====================================================
// DELETE ONE NOTE
// =====================================================

async function deleteNote(id) {

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
}


// =====================================================
// DELETE ALL NOTES
// =====================================================

async function clearNotes() {

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
}


// =====================================================
// CAPITALIZE
// =====================================================

function capitalize(value) {

    if (!value) {
        return "";
    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}