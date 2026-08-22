/*
 * Interno-Assist
 *
 * Detect text selected on the webpage
 */

document.addEventListener(
    "mouseup",
    async () => {

        const selectedText =
            window
                .getSelection()
                .toString()
                .trim();


        /*
         * Nothing selected
         */

        if (!selectedText) {

            return;
        }


        console.log(
            "Interno-Assist selected text:",
            selectedText
        );


        try {

            await chrome.storage.local.set({

                selectedText:
                    selectedText

            });

        } catch (error) {

            console.error(
                "Unable to save selected text:",
                error
            );
        }
    }
);