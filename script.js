document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const fileInput = document.getElementById('fileInput');
    const extractButton = document.getElementById('extractButton');
    const outputDomains = document.getElementById('outputDomains');
    const copyButton = document.getElementById('copyButton');

    // Function to extract domains
    function extractDomains(text) {
        // This regex is simplified to find basic domain names.
        // It looks for sequences of letters, numbers, hyphens, followed by a dot and an extension (min 2 letters).
        // It doesn't capture protocols (http/https) or complex subdomains.
        const domainRegex = /([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?:\b|\/)/g;
        let matches = new Set(); // Using a Set to avoid duplicate domains
        let match;

        while ((match = domainRegex.exec(text)) !== null) {
            // Ensure only the main domain is added, and handle cases where paths follow the domain.
            let domain = match[1];
            // Simple cleanup to avoid including accidental slashes or ports
            if (domain.includes('/')) {
                domain = domain.split('/')[0];
            }
            if (domain.includes(':')) {
                domain = domain.split(':')[0];
            }
            matches.add(domain);
        }
        return Array.from(matches).join('\n'); // Join unique domains with newlines
    }

    // Event listener for the "Extract Domains" button (for pasted text)
    extractButton.addEventListener('click', () => {
        const text = inputText.value;
        const domains = extractDomains(text);
        outputDomains.value = domains;
    });

    // Event listener for the file upload input
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const domains = extractDomains(text);
                outputDomains.value = domains;
            };
            reader.readAsText(file); // Read the file content as text
        }
    });

    // Event listener for the "Copy Domains" button
    copyButton.addEventListener('click', () => {
        outputDomains.select(); // Select the text in the output area
        document.execCommand('copy'); // Copy the selected text to clipboard
        alert('Domains copied to clipboard!'); // Notify the user
    });
});
