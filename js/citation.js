// citation.js - Shared citation functionality

document.addEventListener('DOMContentLoaded', function() {
    const citationText = document.querySelector('.citation-text');
    const copyButton = document.querySelector('.copy-citation');
    
    if (citationText && copyButton) {
        // Update citation with current date and URL
        const today = new Date();
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        const formattedDate = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
        const currentURL = window.location.href;
        
        // Replace placeholders in the citation text
        let citation = citationText.textContent;
        citation = citation.replace('[date]', formattedDate);
        citation = citation.replace('[URL]', currentURL);
        citationText.textContent = citation;
        
        // Copy citation functionality
        copyButton.addEventListener('click', function() {
            const citationContent = citationText.textContent;
            
            // Copy to clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(citationContent).then(() => {
                    // Show success feedback
                    copyButton.textContent = 'Copied!';
                    copyButton.classList.add('copied');
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        copyButton.textContent = 'Copy';
                        copyButton.classList.remove('copied');
                    }, 2000);
                }).catch(() => {
                    // Fallback for clipboard API failure
                    fallbackCopy(citationContent);
                });
            } else {
                // Fallback for older browsers
                fallbackCopy(citationContent);
            }
        });
        
        // Fallback copy method
        function fallbackCopy(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                copyButton.textContent = 'Copied!';
                copyButton.classList.add('copied');
                
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                    copyButton.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy citation:', err);
            }
            
            document.body.removeChild(textArea);
        }
    }
});