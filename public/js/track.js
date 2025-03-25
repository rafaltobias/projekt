async function trackPageVisit() {
    const sessionId = localStorage.getItem('sessionId') || generateSecureRandomString();
    localStorage.setItem('sessionId', sessionId); // Zachowaj sesję w localStorage

    const trackData = {
        page_url: window.location.href, // Aktualny URL strony
        referrer: document.referrer || '', // Skąd użytkownik przyszedł
        session_id: sessionId // Unikalny identyfikator sesji
    };

    try {
        const response = await fetch('/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(trackData)
        });
        if (!response.ok) {
            console.error('Błąd śledzenia:', response.statusText);
        }
    } catch (error) {
        console.error('Błąd wysyłania danych śledzenia:', error);
    }
}

// Generate a secure random string
function generateSecureRandomString() {
    const array = new Uint32Array(10);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(36)).substr(-2)).join('');
}

// Wywołaj funkcję po załadowaniu strony
window.onload = trackPageVisit;