document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const extractButton = document.getElementById('extractButton');
    const outputDomains = document.getElementById('outputDomains');
    const copyButton = document.getElementById('copyButton');

    // Function to extract domains (no change here)
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

    // Event listener for the "Extract Domains" button (no change here)
    extractButton.addEventListener('click', () => {
        const text = inputText.value;
        const domains = extractDomains(text);
        outputDomains.value = domains;
    });

    // --- IMPORTANT CHANGE HERE ---
    // Event listener for the "Copy Domains" button
    copyButton.addEventListener('click', async () => { // Added 'async' keyword
        const textToCopy = outputDomains.value;

        // Check if the Clipboard API is available in the browser
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                alert('Domains copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy domains. Please copy manually.');
            }
        } else {
            // Fallback for older browsers (though less reliable)
            outputDomains.select();
            try {
                document.execCommand('copy');
                alert('Domains copied to clipboard (fallback)!');
            } catch (err) {
                console.error('Fallback copy failed: ', err);
                alert('Copying is not supported in this browser. Please copy manually.');
            }
        }
    });
});
