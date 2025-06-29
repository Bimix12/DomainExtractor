document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    // const fileInput = document.getElementById('fileInput'); // Removed
    const extractButton = document.getElementById('extractButton');
    const outputDomains = document.getElementById('outputDomains');
    const copyButton = document.getElementById('copyButton');

    // Function to extract domains
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

    // Event listener for the "Extract Domains" button (for pasted text)
    extractButton.addEventListener('click', () => {
        const text = inputText.value;
        const domains = extractDomains(text);
        outputDomains.value = domains;
    });

    // Event listener for the file upload input - REMOVED
    // fileInput.addEventListener('change', (event) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = (e) => {
    //             const text = e.target.result;
    //             const domains = extractDomains(text);
    //             outputDomains.value = domains;
    //         };
    //         reader.readAsText(file);
    //     }
    // });

    // Event listener for the "Copy Domains" button
    copyButton.addEventListener('click', () => {
        outputDomains.select();
        document.execCommand('copy');
        alert('Domains copied to clipboard!');
    });
});
