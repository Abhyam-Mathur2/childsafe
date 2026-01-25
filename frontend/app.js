/**
 * Environmental Health Platform - Frontend Application
 * Handles location capture, API calls, and UI flow
 */

// Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Application State
const appState = {
    location: { latitude: null, longitude: null },
    environmentalData: { air: null, soil: null, weather: null },
    lifestyleDataId: null,
    healthReport: null
};

// DOM Elements
const elements = {
    steps: {
        location: document.getElementById('step-location'),
        environment: document.getElementById('step-environment'),
        quiz: document.getElementById('step-quiz'),
        report: document.getElementById('step-report')
    },
    buttons: {
        getLocation: document.getElementById('btn-get-location'),
        continueQuiz: document.getElementById('btn-continue-quiz'),
        startOver: document.getElementById('btn-start-over')
    },
    forms: {
        lifestyle: document.getElementById('lifestyle-form')
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
});

function initializeEventListeners() {
    elements.buttons.getLocation.addEventListener('click', handleGetLocation);
    elements.buttons.continueQuiz.addEventListener('click', () => showStep('quiz'));
    elements.buttons.startOver.addEventListener('click', resetApplication);
    elements.forms.lifestyle.addEventListener('submit', handleLifestyleSubmit);
}

// Step Navigation
function showStep(stepName) {
    // Hide all steps
    Object.values(elements.steps).forEach(step => step.classList.remove('active'));
    
    // Show target step
    elements.steps[stepName].classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Location Handling
async function handleGetLocation() {
    if (!navigator.geolocation) {
        showError('location-error', 'Geolocation is not supported by your browser');
        return;
    }

    elements.buttons.getLocation.disabled = true;
    elements.buttons.getLocation.textContent = 'Getting location...';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            appState.location = { latitude, longitude };

            // Display location info
            document.getElementById('latitude').textContent = latitude.toFixed(6);
            document.getElementById('longitude').textContent = longitude.toFixed(6);
            document.getElementById('location-info').style.display = 'block';

            // Wait a moment, then fetch environmental data
            setTimeout(async () => {
                showStep('environment');
                await fetchEnvironmentalData(latitude, longitude);
            }, 1500);
        },
        (error) => {
            let message = 'Unable to retrieve your location. ';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message += 'Please allow location access to continue.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message += 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    message += 'Location request timed out.';
                    break;
            }
            showError('location-error', message);
            elements.buttons.getLocation.disabled = false;
            elements.buttons.getLocation.textContent = 'Try Again';
        }
    );
}

// Fetch Environmental Data
async function fetchEnvironmentalData(latitude, longitude) {
    document.getElementById('env-loading').style.display = 'block';
    document.getElementById('env-results').style.display = 'none';

    try {
        // First get weather to extract location info
        const weatherResponse = await fetch(`${API_BASE_URL}/weather?latitude=${latitude}&longitude=${longitude}`);
        if (!weatherResponse.ok) throw new Error('Weather request failed');
        const weatherData = await weatherResponse.json();
        
        // Extract location for soil research
        const locationName = weatherData.location_name || '';
        const locationParts = locationName.split(',').map(s => s.trim());
        const city = locationParts[0] || '';
        const state = locationParts[1] || '';
        const country = locationParts[2] || weatherData.sys?.country || '';
        
        // Now fetch air quality and soil research in parallel
        const [airResponse, soilResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/air-quality?latitude=${latitude}&longitude=${longitude}`),
            fetch(`${API_BASE_URL}/soil-research?latitude=${latitude}&longitude=${longitude}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}`)
        ]);

        if (!airResponse.ok) throw new Error('Air quality request failed');
        if (!soilResponse.ok) throw new Error('Soil data request failed');

        const airData = await airResponse.json();
        const soilData = await soilResponse.json();

        appState.environmentalData.air = airData;
        appState.environmentalData.soil = soilData;
        appState.environmentalData.weather = weatherData;

        // Display results
        displayEnvironmentalData(airData, soilData, weatherData);

        // Show results
        document.getElementById('env-loading').style.display = 'none';
        document.getElementById('env-results').style.display = 'block';
    } catch (error) {
        console.error('Error fetching environmental data:', error);
        document.getElementById('env-loading').innerHTML = `
            <p class="error">Failed to fetch environmental data. Please try again.</p>
        `;
    }
}

function displayEnvironmentalData(airData, soilData, weatherData) {
    // Display AQI
    const aqiValue = document.getElementById('aqi-value');
    const aqiBadge = document.getElementById('aqi-badge');
    aqiValue.textContent = airData.data.aqi;
    
    // Set AQI color class
    aqiBadge.className = 'aqi-badge';
    if (airData.risk_level === 'low') {
        aqiBadge.classList.add('aqi-low');
    } else if (airData.risk_level === 'medium') {
        aqiBadge.classList.add('aqi-medium');
    } else {
        aqiBadge.classList.add('aqi-high');
    }

    // Display air interpretation
    document.getElementById('air-interpretation').textContent = airData.health_interpretation;

    // Display weather data
    document.getElementById('temperature').textContent = Math.round(weatherData.data.temperature);
    document.getElementById('feels-like').textContent = Math.round(weatherData.data.feels_like);
    document.getElementById('weather-summary').textContent = `${weatherData.data.weather_condition} · ${weatherData.data.weather_description}`;
    document.getElementById('location-name').textContent = weatherData.location_name || 'Your area';

    // Display soil data (Perplexity AI-powered)
    document.getElementById('soil-type').textContent = soilData.soil_type || 'unknown';
    document.getElementById('soil-ph').textContent = soilData.ph || 'unknown';
    document.getElementById('nitrogen-level').textContent = soilData.nitrogen_level || 'unknown';
    document.getElementById('phosphorus-level').textContent = soilData.phosphorus_level || 'unknown';
    document.getElementById('potassium-level').textContent = soilData.potassium_level || 'unknown';
    document.getElementById('contamination-risk').textContent = (soilData.contamination_risk || 'unknown').toUpperCase();
    
    // Display health implications
    const healthImplications = document.getElementById('soil-health-implications');
    healthImplications.innerHTML = '';
    if (soilData.health_implications && soilData.health_implications.length > 0) {
        soilData.health_implications.forEach(implication => {
            const li = document.createElement('li');
            li.textContent = implication;
            healthImplications.appendChild(li);
        });
    } else {
        healthImplications.innerHTML = '<li>No specific health concerns identified</li>';
    }
}

// Lifestyle Form Handling
async function handleLifestyleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(elements.forms.lifestyle);
    const lifestyleData = {
        age_range: formData.get('age_range'),
        smoking_status: formData.get('smoking_status'),
        activity_level: formData.get('activity_level'),
        work_environment: formData.get('work_environment'),
        diet_quality: formData.get('diet_quality') || null,
        sleep_hours: formData.get('sleep_hours') || null,
        stress_level: formData.get('stress_level') || null
    };

    try {
        // Submit lifestyle data
        const response = await fetch(`${API_BASE_URL}/lifestyle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lifestyleData)
        });

        const result = await response.json();
        appState.lifestyleDataId = result.id;

        // Generate health report
        showStep('report');
        await generateHealthReport();
    } catch (error) {
        console.error('Error submitting lifestyle data:', error);
        alert('Failed to submit lifestyle data. Please try again.');
    }
}

// Generate Health Report
async function generateHealthReport() {
    document.getElementById('report-loading').style.display = 'block';
    document.getElementById('report-results').style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/health-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                latitude: appState.location.latitude,
                longitude: appState.location.longitude,
                lifestyle_data_id: appState.lifestyleDataId
            })
        });

        const report = await response.json();
        appState.healthReport = report;

        // Display report
        displayHealthReport(report);

        // Show results
        document.getElementById('report-loading').style.display = 'none';
        document.getElementById('report-results').style.display = 'block';
    } catch (error) {
        console.error('Error generating health report:', error);
        document.getElementById('report-loading').innerHTML = `
            <p class="error">Failed to generate health report. Please try again.</p>
        `;
    }
}

function displayHealthReport(report) {
    // Display risk score
    const scoreNumber = document.getElementById('score-number');
    const scoreLabel = document.getElementById('score-label');
    const riskScore = document.querySelector('.risk-score');

    scoreNumber.textContent = Math.round(report.risk_score);
    scoreLabel.textContent = report.risk_level;

    // Set risk color class
    riskScore.className = 'risk-score';
    riskScore.classList.add(`risk-${report.risk_level}`);

    // Display summary
    document.getElementById('report-summary').textContent = report.report_summary;

    // Display component scores
    document.getElementById('env-risk-score').textContent = 
        Math.round(report.environmental_risk) + '/100';
    document.getElementById('lifestyle-risk-score').textContent = 
        Math.round(report.lifestyle_risk) + '/100';

    // Display contributing factors
    const factorsContainer = document.getElementById('contributing-factors');
    factorsContainer.innerHTML = '';
    report.contributing_factors.forEach(factor => {
        const factorDiv = document.createElement('div');
        factorDiv.className = `factor-item factor-${factor.impact}`;
        factorDiv.innerHTML = `
            <strong>${factor.category.toUpperCase()}</strong>: ${factor.factor}
            <br><small>Impact: ${factor.impact} | Severity: ${factor.severity}</small>
        `;
        factorsContainer.appendChild(factorDiv);
    });

    // Display recommendations
    const recommendationsContainer = document.getElementById('recommendations');
    recommendationsContainer.innerHTML = '';
    report.health_recommendations.forEach(rec => {
        const recDiv = document.createElement('div');
        recDiv.className = 'recommendation-item';
        recDiv.innerHTML = `
            <h4>
                ${rec.title}
                <span class="priority-badge priority-${rec.priority}">${rec.priority}</span>
            </h4>
            <p>${rec.description}</p>
        `;
        recommendationsContainer.appendChild(recDiv);
    });
}

// Utility Functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function resetApplication() {
    // Reset state
    appState.location = { latitude: null, longitude: null };
    appState.environmentalData = { air: null, soil: null, weather: null };
    appState.lifestyleDataId = null;
    appState.healthReport = null;

    // Reset forms
    elements.forms.lifestyle.reset();

    // Hide error messages
    document.getElementById('location-error').style.display = 'none';
    document.getElementById('location-info').style.display = 'none';

    // Reset button
    elements.buttons.getLocation.disabled = false;
    elements.buttons.getLocation.textContent = 'Get My Location';

    // Return to first step
    showStep('location');
}
