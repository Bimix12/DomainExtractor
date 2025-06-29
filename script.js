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
        // Hide all sections
        document.querySelectorAll('.tool-section').forEach(section => {
            section.classList.add('hidden');
            section.style.opacity = 0; // Reset opacity for hidden sections
        });
        // Deactivate all tabs
        document.querySelectorAll('.border-b-2').forEach(tab => {
            tab.classList.remove('active-tab');
        });

        // Show the selected section
        sectionToShow.classList.remove('hidden');
        // Small delay to allow CSS transition, then set opacity
        setTimeout(() => {
            sectionToShow.style.opacity = 1;
        }, 10); // 10ms delay
        // Activate the selected tab
        tabToActivate.classList.add('active-tab');
    }

    // Event Listeners for Tabs
    extractorTab.addEventListener('click', () => {
        showSection(extractorSection, extractorTab);
    });

    converterTab.addEventListener('click', () => {
        showSection(converterSection, converterTab);
    });

    ---

    // --- Common Copy Function (reusable for both tools) ---
    // This is the core function for copying text.
    async function copyToClipboard(textToCopy, alertMessage) {
        // 1. Check if the modern Clipboard API is supported and available
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                // Attempt to copy using the modern asynchronous API
                await navigator.clipboard.writeText(textToCopy);
                alert(alertMessage || 'Copied to clipboard successfully!');
            } catch (err) {
                // If there's an error with the modern API (e.g., permissions denied)
                console.error('Failed to copy text using Clipboard API:', err);
                // Fallback to the old method if the modern one fails
                fallbackCopyToClipboard(textToCopy, alertMessage);
            }
        } else {
            // 2. If modern Clipboard API is not supported at all, directly use fallback
            console.warn('Clipboard API not supported, falling back to old method.');
            fallbackCopyToClipboard(textToCopy, alertMessage);
        }
    }

    // --- Fallback Copy Function for older browsers or failed modern API ---
    function fallbackCopyToClipboard(textToCopy, alertMessage) {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        // Make the textarea invisible and place it off-screen to avoid visual disruption
        tempTextArea.style.position = 'absolute';
        tempTextArea.style.left = '-9999px';
        tempTextArea.style.top = '-9999px';
        tempTextArea.style.opacity = '0'; // Ensure it's invisible
        document.body.appendChild(tempTextArea); // Append it to the body

        try {
            tempTextArea.select(); // Select the text in the temporary textarea
            // Attempt to execute the old copy command
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
            // Always remove the temporary textarea from the DOM
            document.body.removeChild(tempTextArea);
        }
    }

    ---

    // --- Domain Extractor Logic ---
    function extractDomains(text) {
        // Regex to find basic domain names. Adjust if more complex patterns are needed.
        const domainRegex = /([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?:\b|\/)/g;
        let matches = new Set(); // Use Set to store unique domains
        let match;

        while ((match = domainRegex.exec(text)) !== null) {
            let domain = match[1];
            // Simple cleanup to remove trailing slashes or ports if present
            if (domain.includes('/')) {
                domain = domain.split('/')[0];
            }
            if (domain.includes(':')) {
                domain = domain.split(':')[0];
            }
            matches.add(domain);
        }
        return Array.from(matches).join('\n'); // Return unique domains, each on a new line
    }

    // Event listener for "Extract Domains" button
    extractButton.addEventListener('click', () => {
        const text = inputText.value;
        const domains = extractDomains(text);
        outputDomains.value = domains;
    });

    // Event listener for "Copy Domains" button (Extractor section)
    copyExtractedButton.addEventListener('click', () => {
        copyToClipboard(outputDomains.value, 'Extracted domains copied!');
    });

    ---

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
            // Only process domains
