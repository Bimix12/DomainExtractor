document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const fileInput = document.getElementById('fileInput');
    const extractButton = document.getElementById('extractButton');
    const outputDomains = document.getElementById('outputDomains');
    const copyButton = document.getElementById('copyButton');

    // Fonction pour extraire les domaines
    function extractDomains(text) {
        // Cette regex est simplifiée pour trouver les noms de domaine basiques.
        // Elle cherche des séquences de lettres, chiffres, tirets, suivies d'un point et d'une extension (min 2 lettres).
        // Elle ne capture pas les protocoles (http/https) ou les sous-domaines complexes.
        const domainRegex = /([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?:\b|\/)/g;
        let matches = new Set();
        let match;

        while ((match = domainRegex.exec(text)) !== null) {
            // Assurez-vous d'ajouter uniquement le domaine principal
            // et de gérer les cas où des chemins suivent le domaine.
            let domain = match[1];
            // Simple nettoyage pour ne pas inclure de slashs ou de ports accidentels
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

    // Événement pour le bouton d'extraction (quand on colle le texte)
    extractButton.addEventListener('click', () => {
        const text = inputText.value;
        const domains = extractDomains(text);
        outputDomains.value = domains;
    });

    // Événement pour le téléchargement de fichier
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const domains = extractDomains(text);
                outputDomains.value = domains;
            };
            reader.readAsText(file);
        }
    });

    // Événement pour le bouton de copie
    copyButton.addEventListener('click', () => {
        outputDomains.select();
        document.execCommand('copy');
        alert('Domaines copiés dans le presse-papiers !');
    });
});
