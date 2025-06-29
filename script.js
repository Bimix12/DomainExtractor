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
    const convertButton = document.getElementById('convertButton'); // هذا هو الزر لي ما كانش مربوط مزيان
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
        setTimeout(() => { // Small delay to allow CSS transition
            sectionToShow.style.opacity = 1;
        }, 10);
        // Activate the selected tab
        tabToActivate.classList.add('active-tab');
    }

    extractorTab.addEventListener('click', () => {
        showSection(extractorSection, extractorTab);
    });

    converterTab.addEventListener('click', () => {
        showSection(converterSection, converterTab);
    });

    // --- Common Copy Function (reusable for both tools) ---
    async function copyToClipboard(textToCopy, alertMessage) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                alert(alertMessage || 'Copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy. Please copy manually.');
            }
        } else {
            // Fallback for older browsers (less reliable, but better than nothing)
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = textToCopy;
            tempTextArea.style.position = 'fixed'; // Avoid scrolling
            tempTextArea.style.opacity = 0; // Make it invisible
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            try {
                document.execCommand('copy');
                alert(alertMessage ? `${alertMessage} (fallback)` : 'Copied to clipboard (fallback)!');
            } catch (err) {
                console.error('Fallback copy failed: ', err);
                alert('Copying is not supported in this browser. Please copy manually.');
            } finally {
                document.body.removeChild(tempTextArea); // Clean up
            }
        }
    }

    // --- Domain Extractor Logic ---
    function extractDomains(text) {
        const domainRegex = /([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?:\b|\/)/g;
        let matches = new Set();
        let match;

        while ((match = domainRegex.exec(text)) !== null) {
            let domain = match[1];
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

    extractButton.addEventListener('click', () => {
        const text = inputText.value;
        const domains = extractDomains(text);
        outputDomains.value = domains;
    });

    copyExtractedButton.addEventListener('click', () => {
        copyToClipboard(outputDomains.value, 'Extracted domains copied!');
    });

    // --- Domain Converter Logic ---
    function convertDomainsFunction() { // Non-conflicting function name
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
            if (domain.endsWith('.com')) {
                const base = domain.replace(/\.com$/, '');
                tlds.forEach(ext => {
                    results.push(base + ext);
                });
            }
        }

        converterResultOutput.value = results.join("\n");
        converterResultSection.classList.remove("hidden");
    }

    // --- FIX: Add event listener for the convert button ---
    convertButton.addEventListener('click', convertDomainsFunction); // ربط الزر بالدالة الصحيحة

    copyConvertedButton.addEventListener('click', () => {
        copyToClipboard(converterResultOutput.value, 'Converted domains copied!');
    });

    downloadCSVButton.addEventListener('click', () => {
        const result = converterResultOutput.value;
        const blob = new Blob([result], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'converted_domains.csv';
        link.click();
    });

    // Initialize: Show the extractor section by default
    showSection(extractorSection, extractorTab);
});
