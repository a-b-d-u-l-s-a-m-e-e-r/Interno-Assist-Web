// =====================================================
// INTERNO-ASSIST BACKGROUND SERVICE WORKER
// =====================================================


// =====================================================
// CREATE CONTEXT MENU
// =====================================================

function createContextMenu() {

    chrome.contextMenus.removeAll(() => {

        chrome.contextMenus.create({
            id: "internoAssist",
            title: "Send to Interno-Assist",
            contexts: ["selection"]
        });

    });

}


// =====================================================
// EXTENSION INSTALLED / UPDATED
// =====================================================

chrome.runtime.onInstalled.addListener(() => {

    console.log(
        "Interno-Assist installed/updated."
    );


    // -------------------------------------------------
    // Create context menu
    // -------------------------------------------------

    createContextMenu();


    // -------------------------------------------------
    // Configure toolbar action
    // -------------------------------------------------

    chrome.sidePanel.setPanelBehavior({
        openPanelOnActionClick: true
    }).catch(error => {

        console.error(
            "Unable to configure side panel:",
            error
        );

    });

});


// =====================================================
// BROWSER STARTUP
// =====================================================

chrome.runtime.onStartup.addListener(() => {

    console.log(
        "Interno-Assist browser startup."
    );

    createContextMenu();

});


// =====================================================
// CONTEXT MENU CLICK
// =====================================================

chrome.contextMenus.onClicked.addListener(
    (info, tab) => {

        // -------------------------------------------------
        // Make sure this is our menu item
        // -------------------------------------------------

        if (
            info.menuItemId !==
            "internoAssist"
        ) {
            return;
        }


        // -------------------------------------------------
        // Make sure tab exists
        // -------------------------------------------------

        if (!tab || !tab.id) {

            console.error(
                "No valid tab found."
            );

            return;
        }


        // -------------------------------------------------
        // Get selected text
        // -------------------------------------------------

        const selectedText =
            typeof info.selectionText === "string"
                ? info.selectionText
                : "";


        if (!selectedText.trim()) {

            console.log(
                "No selected text found."
            );

            return;
        }


        // =================================================
        // GET SOURCE URL
        // =================================================
        //
        // IMPORTANT:
        //
        // info.pageUrl represents the page where the
        // context-menu selection happened.
        //
        // We MUST NOT use window.location.href here.
        //
        // =================================================

        const sourceUrl =
            info.pageUrl ||
            tab.url ||
            null;


        console.log(
            "Interno-Assist context menu clicked."
        );

        console.log(
            "Selected text:",
            selectedText
        );

        console.log(
            "Source URL:",
            sourceUrl
        );


        // =================================================
        // OPEN SIDE PANEL FIRST
        // =================================================

        chrome.sidePanel.open({
            windowId: tab.windowId
        }).then(() => {

            console.log(
                "Interno-Assist side panel opened."
            );

        }).catch(error => {

            console.error(
                "Unable to open Interno-Assist side panel:",
                error
            );

        });


        // =================================================
        // SAVE SELECTED TEXT + SOURCE URL
        // =================================================
        //
        // These two values belong together.
        //
        // Example:
        //
        // selectedText:
        // "Java Exception Handling..."
        //
        // selectedSourceUrl:
        // "https://example.com/java-exception"
        //
        // Even if the user later navigates somewhere else,
        // this URL remains associated with this selection.
        //
        // =================================================

        chrome.storage.local.set({

            selectedText: selectedText,

            selectedSourceUrl: sourceUrl

        }).then(() => {

            console.log(
                "Selected text and source URL saved successfully."
            );

        }).catch(error => {

            console.error(
                "Unable to save selected text and source URL:",
                error
            );

        });

    }
);