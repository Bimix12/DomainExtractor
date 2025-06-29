document.addEventListener('DOMContentLoaded', () => {
    // --- Elements for Tabs ---
    const extractorTab = document.getElementById('extractorTab');
    const converterTab = document.getElementById('converterTab');
    const extractorSection = document.getElementById('extractorSection');
    const converterSection = document.getElementById('converterSection');

    // --- Elements for Domain Extractor ---
    const inputText = document.getElementById('inputText');
    const extractButton = document.getElementById('extractButton');
    const outputDomains = document.getElementById('outputDomains');
    const copyExtractedButton = document.getElementById('copyExtractedButton');

    // --- Elements for Domain Converter ---
    const domainInput = document.getElementById('domainInput');
    const extCheckboxes = document.querySelectorAll('.extCheckbox');
    const convertButton = document.getElementById('convertButton');
    const converterResultSection = document.getElementById('converterResultSection');
    const converterResultOutput = document.getElementById('converterResultOutput');
    const copyConvertedButton = document.getElementById('copyConvertedButton');
    const downloadCSVButton = document.getElementById('downloadCSVButton');

    // --- Tab Switching Logic ---
    function showSection(sectionToShow, tabToActivate) {
        // Hide all sections and deactivate all tabs
        document.querySelectorAll('.tool-section').forEach(section => {
            section.classList.add('hidden');
            section.style.opacity = 0;
        });
        document.querySelectorAll('.border-b-2').forEach(tab => {
            tab.classList.remove('active-tab');
        });

        // Show the selected section and activate the tab
        sectionToShow.classList.remove('hidden');
        setTimeout(() => { // Small delay for CSS transition
            sectionToShow.style.opacity = 1;
        }, 10);
        tabToActivate.classList.add('active-tab');
    }

    // Attach event listeners for tab buttons
    extractorTab.addEventListener('click', () => {
        showSection(extractorSection, extractorTab);
    });
    converterTab.addEventListener('click', () => {
        showSection(converterSection, converterTab);
    });

    // --- Common Copy Function ---
    // This is the robust copy function using Clipboard API with a fallback.
    async function copyToClipboard(textToCopy, alertMessage) {
        if (!textToCopy.trim()) { // Check if there's actual text to copy
            alert('Nothing to copy!');
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                alert(alertMessage || 'Copied to clipboard successfully!');
            } catch (err) {
                console.error('Failed to copy using Clipboard API:', err);
                fallbackCopyToClipboard(textToCopy, alertMessage);
            }
        } else {
            console.warn('Clipboard API not supported, using fallback.');
            fallbackCopyToClipboard(textToCopy, alertMessage);
        }
    }

    // --- Fallback Copy Function for older browsers/failures ---
    function fallbackCopyToClipboard(textToCopy, alertMessage) {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        tempTextArea.style.position = 'absolute';
        tempTextArea.style.left = '-9999px';
        tempTextArea.style.top = '-9999px';
        tempTextArea.style.opacity = '0';
        document.body.appendChild(tempTextArea);

        try {
            tempTextArea.select();
            const successful = document.execCommand('copy');
            if (successful) {
                alert(alertMessage ? `${alertMessage} (using fallback)` : 'Copied to clipboard (fallback)!');
            } else {
                alert('Copy failed. Please copy manually.');
            }
        } catch (err) {
            console.error('Fallback copy command failed:', err);
            alert('Copying is not supported in this browser. Please copy manually.');
        } finally {
            document.body.removeChild(tempTextArea);
        }
    }

    // --- Domain Extractor Logic ---
    function extractDomains(text) {
        // This regex looks for common domain patterns.
        const domainRegex = /([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?:\b|\/|$)/g; // Added |$ for end of string
        let matches = new Set();
        let match;

        while ((match = domainRegex.exec(text)) !== null) {
            let domain = match[1];
            // Clean up any trailing slashes or ports
            if (domain.includes('/')) {
                domain = domain.split('/')[0];
            }
            if (domain.includes(':')) {
                domain = domain.split(':')[0];
            }
            matches.add(domain);
        }
        return Array.from(matches).join('\n');
    }

    // Attach event listener for "Extract Domains" button
    extractButton.addEventListener('click', () => {
        const text = inputText.value;
        const domains = extractDomains(text);
        outputDomains.value = domains;
    });

    // Attach event listener for "Copy Domains" button (Extractor)
    copyExtractedButton.addEventListener('click', () => {
        copyToClipboard(outputDomains.value, 'Extracted domains copied!');
    });

    // --- Domain Converter Logic ---
    function convertDomainsLogic() {
        const input = domainInput.value.trim();
        const tlds = Array.from(extCheckboxes)
                         .filter(cb => cb.checked)
                         .map(cb => cb.value);

        if (!input) {
            alert('Please enter at least one .com domain.');
            return;
        }

        if (tlds.length === 0) {
            alert('Please select at least one extension.');
            return;
        }

        const lines = input.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        let results = [];

        for (const domain of lines) {
            // Only process domains that end with '.com'
            if (domain.endsWith('.com')) {
                const base = domain.replace(/\.com$/, ''); // Remove the .com part
                tlds.forEach(ext => {
                    results.push(base + ext); // Add domain with new extension
                });
            }
        }

        converterResultOutput.value = results.join("\n");
        converterResultSection.classList.remove("hidden"); // Show results section
    }

    // Attach event listener for "Convert" button (Converter)
    convertButton.addEventListener('click', convertDomainsLogic);

    // Attach event listener for "Copy" button (Converter)
    copyConvertedButton.addEventListener('click', () => {
        copyToClipboard(converterResultOutput.value, 'Converted domains copied!');
    });

    // Attach event listener for "Download CSV" button (Converter)
    downloadCSVButton.addEventListener('click', () => {
        const result = converterResultOutput.value;
        if (!result.trim()) { // Check if there's actual content to download
            alert('No domains to download!');
            return;
        }
        const blob = new Blob([result], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'converted_domains.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // --- Initialization ---
    // Set the initial active tab and section when the page loads
    showSection(extractorSection, extractorTab);
});
