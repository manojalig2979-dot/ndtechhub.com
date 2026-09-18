// estimator.js
function calculateEstimate() {
    const type = document.getElementById('estimator-type').value;
    const scale = document.getElementById('estimator-scale').value;
    const ai = document.getElementById('estimator-ai').value;

    let baseWeeks = 4;
    let minBudget = 1500;
    let maxBudget = 3000;

    if (type === 'landing') {
        baseWeeks = 2;
        minBudget = 800;
        maxBudget = 1800;
    } else if (type === 'saas') {
        baseWeeks = 6;
        minBudget = 2500;
        maxBudget = 6000;
    } else if (type === 'ai') {
        baseWeeks = 5;
        minBudget = 2200;
        maxBudget = 5500;
    } else if (type === 'mobile') {
        baseWeeks = 6;
        minBudget = 2800;
        maxBudget = 6500;
    }

    if (scale === 'mvp') {
        // base
    } else if (scale === 'growth') {
        baseWeeks += 2;
        minBudget += 1000;
        maxBudget += 2500;
    } else if (scale === 'enterprise') {
        baseWeeks += 4;
        minBudget += 3000;
        maxBudget += 7000;
    }

    if (ai === 'assistant') {
        minBudget += 600;
        maxBudget += 1200;
    } else if (ai === 'agent') {
        baseWeeks += 2;
        minBudget += 1500;
        maxBudget += 3500;
    }

    document.getElementById('est-time').innerText = `${baseWeeks} - ${baseWeeks + 2} Weeks`;
    document.getElementById('est-budget').innerText = `$${minBudget.toLocaleString()} – $${maxBudget.toLocaleString()}`;
}

function transferEstimateToContact() {
    const typeEl = document.getElementById('estimator-type');
    const selectedType = typeEl.options[typeEl.selectedIndex].text;
    const timeEst = document.getElementById('est-time').innerText;
    const budgetEst = document.getElementById('est-budget').innerText;
    
    // Redirect to contact page with URL params
    const scope = `Inquiry for ${selectedType} (Est: ${budgetEst}, ${timeEst})`;
    window.location.href = `contact.html?subject=${encodeURIComponent(scope)}`;
}
