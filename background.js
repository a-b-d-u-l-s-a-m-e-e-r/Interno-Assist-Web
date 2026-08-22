/*
 * Open Side Panel when extension icon is clicked
 */

chrome.runtime.onInstalled.addListener(
    () => {

        chrome.sidePanel.setPanelBehavior({

            openPanelOnActionClick: true

        });
    }
);