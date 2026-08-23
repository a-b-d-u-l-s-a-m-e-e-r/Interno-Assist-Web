/*
 * =====================================================
 * INTERNO-ASSIST CONTENT SCRIPT
 * =====================================================
 *
 * Purpose:
 *
 * Detect selected text on the webpage and save:
 *
 * 1. Plain selected text
 * 2. URL of the webpage where the selection happened
 *
 * IMPORTANT:
 *
 * The URL is captured immediately when the selection
 * happens.
 *
 * We do NOT get the URL later while saving the note.
 *
 * This prevents the following bug:
 *
 * User selects text on Page A
 *        ↓
 * AI generates response
 *        ↓
 * Move response to Notes
 *        ↓
 * User navigates to Page B
 *        ↓
 * User clicks Save
 *
 * The source must still be Page A.
 *
 * =====================================================
 */


// =====================================================
// HANDLE TEXT SELECTION
// =====================================================

document.addEventListener(
    "mouseup",
    handleTextSelection
);


// =====================================================
// HANDLE SELECTION
// =====================================================

async function handleTextSelection() {

    const selection =
        window.getSelection();


    // -------------------------------------------------
    // No selection
    // -------------------------------------------------

    if (!selection) {
        return;
    }


    if (selection.rangeCount === 0) {
        return;
    }


    // -------------------------------------------------
    // Get selected text
    // -------------------------------------------------

    const selectedText =
        selection.toString();


    // -------------------------------------------------
    // Ignore empty selection
    // -------------------------------------------------

    if (!selectedText.trim()) {
        return;
    }


    // =================================================
    // CAPTURE SOURCE URL NOW
    // =================================================
    //
    // IMPORTANT:
    //
    // This is the URL of the page where the user
    // selected the text.
    //
    // Do NOT calculate this inside saveNotes().
    //
    // =================================================

    const sourceUrl =
        window.location.href;


    console.log(
        "Interno-Assist selected text:",
        selectedText
    );

    console.log(
        "Interno-Assist source URL:",
        sourceUrl
    );


    // =================================================
    // SAVE SELECTED TEXT + SOURCE URL
    // =================================================

    try {

        await chrome.storage.local.set({

            selectedText: selectedText,

            selectedSourceUrl: sourceUrl

        });

        console.log(
            "Selected text and source URL saved."
        );

    } catch (error) {

        console.error(
            "Unable to save selected text and source URL:",
            error
        );

    }

}