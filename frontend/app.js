/**
 * Environmental Health Platform - Frontend Application
 * Handles location capture, API calls, and UI flow
 */

// Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Initialize Visualizer


// Application State
const appState = {
    location: { latitude: null, longitude: null },
    environmentalData: { air: null, soil: null, water: null, weather: null },
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

    // Set initial background (e.g. based on time of day)
    const hour = new Date().getHours();
    const bgContainer = document.getElementById('bg-container');
    if (hour < 6 || hour > 20) {
        bgContainer.className = 'bg-city'; /* Night mode vibe */
    }
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
        // First get weather to extract location info (Critical for location context)
        let weatherData = null;
        try {
            const weatherResponse = await fetch(`${API_BASE_URL}/weather?latitude=${latitude}&longitude=${longitude}`);
            if (weatherResponse.ok) {
                weatherData = await weatherResponse.json();
            } else {
                console.warn('Weather fetch failed, using fallback.');
            }
        } catch (e) {
            console.warn('Weather fetch error:', e);
        }

        // Fallback if weather fails entirely (prevent app crash)
        if (!weatherData) {
            weatherData = {
                location_name: "Unknown Location",
                data: {
                    temperature: "-", feels_like: "-", humidity: "-",
                    weather_condition: "Unknown", weather_description: "Data unavailable"
                },
                sys: { country: "" }
            };
        }

        // Extract location for research
        const locationName = weatherData.location_name || '';
        const locationParts = locationName.split(',').map(s => s.trim());
        const city = locationParts[0] || '';
        const state = locationParts[1] || '';
        const country = locationParts[2] || weatherData.sys?.country || '';

        // Now fetch air quality, soil, and water in parallel (independent fails allowed)
        const [airResult, soilResult, waterResult] = await Promise.allSettled([
            fetch(`${API_BASE_URL}/air-quality?latitude=${latitude}&longitude=${longitude}`),
            fetch(`${API_BASE_URL}/soil-research?latitude=${latitude}&longitude=${longitude}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}`),
            fetch(`${API_BASE_URL}/water-quality?latitude=${latitude}&longitude=${longitude}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}`)
        ]);

        // Process Air Data
        let airData = { data: { aqi: '-' }, health_interpretation: 'Data unavailable', risk_level: 'unknown' };
        if (airResult.status === 'fulfilled' && airResult.value.ok) {
            airData = await airResult.value.json();
        }

        // Process Soil Data
        let soilData = { soil_type: 'unknown', ph: 'unknown', contamination_risk: 'unknown', health_implications: [] };
        if (soilResult.status === 'fulfilled' && soilResult.value.ok) {
            soilData = await soilResult.value.json();
        }

        // Process Water Data
        let waterData = { source_type: 'unknown', ph: '-', hardness: '-', contamination_risk: 'unknown', recommendations: [] };
        if (waterResult.status === 'fulfilled' && waterResult.value.ok) {
            waterData = await waterResult.value.json();
        }

        appState.environmentalData.air = airData;
        appState.environmentalData.soil = soilData;
        appState.environmentalData.water = waterData;
        appState.environmentalData.weather = weatherData;

        // Display results
        displayEnvironmentalData(airData, soilData, waterData, weatherData);

        // Update Visuals
        updateBackground(weatherData);
        updateAqiOverlay(airData);

        // Show results
        document.getElementById('env-loading').style.display = 'none';
        document.getElementById('env-results').style.display = 'block';
    } catch (error) {
        console.error('Critical error in fetchEnvironmentalData:', error);
        document.getElementById('env-loading').innerHTML = `
            <p class="error">Failed to load environmental data. Please refresh and try again.</p>
        `;
    }
}

function displayEnvironmentalData(airData, soilData, waterData, weatherData) {
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

    // Display soil data
    document.getElementById('soil-type').textContent = soilData.soil_type || 'unknown';
    document.getElementById('soil-ph').textContent = soilData.ph || 'unknown';
    document.getElementById('contamination-risk').textContent = (soilData.contamination_risk || 'unknown').toUpperCase();

    // Display soil health implications
    const soilImplications = document.getElementById('soil-health-implications');
    soilImplications.innerHTML = '';
    if (soilData.health_implications?.length > 0) {
        soilData.health_implications.forEach(imp => {
            const li = document.createElement('li');
            li.textContent = imp;
            soilImplications.appendChild(li);
        });
    } else {
        soilImplications.innerHTML = '<li>No specific concerns</li>';
    }

    // Display water data (NEW)
    document.getElementById('water-source').textContent = waterData.source_type || 'Unknown';
    document.getElementById('water-ph').textContent = waterData.ph || '-';
    document.getElementById('water-hardness').textContent = waterData.hardness || '-';

    const waterRisk = document.getElementById('water-risk');
    waterRisk.textContent = (waterData.contamination_risk || 'unknown').toUpperCase();
    // Add color class logic if needed, or rely on CSS

    const waterRecs = document.getElementById('water-recommendations');
    waterRecs.innerHTML = '';
    if (waterData.recommendations?.length > 0) {
        waterData.recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            waterRecs.appendChild(li);
        });
    } else {
        waterRecs.innerHTML = '<li>No specific recommendations</li>';
    }
}

// Lifestyle Form Handling
async function handleLifestyleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(elements.forms.lifestyle);

    // Collect medical history (checkboxes)
    const medicalHistory = [];
    document.querySelectorAll('input[name="condition"]:checked').forEach(checkbox => {
        medicalHistory.push(checkbox.value);
    });

    const lifestyleData = {
        age_range: formData.get('age_range'),
        gender: formData.get('gender'),
        smoking_status: formData.get('smoking_status'),
        activity_level: formData.get('activity_level'),
        work_environment: formData.get('work_environment'),
        diet_quality: formData.get('diet_quality') || null,

        // Comprehensive Fields
        medical_history: medicalHistory,
        home_environment: {
            cooking_method: formData.get('cooking_method')
        }
    };

    try {
        // Submit lifestyle data
        const response = await fetch(`${API_BASE_URL}/lifestyle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lifestyleData)
        });

        if (!response.ok) throw new Error('Failed to save lifestyle data');

        const result = await response.json();
        appState.lifestyleDataId = result.id;

        // Generate health report
        showStep('report');
        await generateHealthReport();
    } catch (error) {
        console.error('Error submitting lifestyle data:', error);
        alert('Failed to submit lifestyle data. Please check your inputs.');
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
    // 1. Populate Report Header
    document.getElementById('report-date').textContent = new Date().toLocaleDateString();
    document.getElementById('report-id').textContent = 'RPT-' + Math.floor(Math.random() * 10000);

    // 2. Populate Risk Score Table
    // Air
    const airScore = Math.round((report.environmental_risk * 1.0));
    document.getElementById('table-air-score').textContent = airScore + '/100';
    document.getElementById('table-air-status').textContent = getRiskLabel(airScore);

    // Water
    const waterScore = report.feature_vector?.water_risk ? report.feature_vector.water_risk * 33 : 20; // Approx conversion
    document.getElementById('table-water-score').textContent = waterScore + '/100';
    document.getElementById('table-water-status').textContent = getRiskLabel(waterScore);

    // Soil
    const soilScore = 15; // Placeholder/Mock if missing
    document.getElementById('table-soil-score').textContent = soilScore + '/100';
    document.getElementById('table-soil-status').textContent = 'Low';

    // Noise & Radiation (Mocked in Service)
    if (report.noise_data) {
        document.getElementById('table-noise-score').textContent = report.noise_data.risk_score + '/100';
        document.getElementById('table-noise-status').textContent = 'Low';
    }
    if (report.radiation_data) {
        document.getElementById('table-rad-score').textContent = report.radiation_data.risk_score + '/100';
        document.getElementById('table-rad-status').textContent = 'Low';
    }

    // Total
    const totalScore = Math.round(report.risk_score);
    const totalCell = document.getElementById('table-total-score');
    totalCell.textContent = totalScore + '/100';
    document.getElementById('table-total-status').textContent = report.risk_level.toUpperCase();

    // Color code total
    totalCell.style.color = getRiskColor(totalScore);

    // 3. Vulnerability Section
    document.getElementById('vuln-multiplier').textContent = report.vulnerability_multiplier || '1.0';

    const interactionList = document.getElementById('interaction-risks');
    interactionList.innerHTML = '';
    const interactions = report.contributing_factors.filter(f => f.category === 'interaction');

    if (interactions.length > 0) {
        interactions.forEach(f => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${f.factor}</strong>`;
            li.style.color = '#d32f2f';
            interactionList.appendChild(li);
        });
    } else {
        interactionList.innerHTML = '<li>No critical synergistic risks identified.</li>';
    }

    // 4. Recommendations
    const recList = document.getElementById('recommendations-list');
    recList.innerHTML = '';
    report.health_recommendations.forEach(rec => {
        const div = document.createElement('div');
        div.className = 'recommendation-item';
        div.innerHTML = `
            <h4>${rec.title} <span class="priority-badge priority-${rec.priority}">${rec.priority}</span></h4>
            <p>${rec.description}</p>
        `;
        recList.appendChild(div);
    });

    // 5. Medical Notes
    const notesList = document.getElementById('medical-notes-list');
    // Clear previous dynamic notes but keep the static one? Actually let's just re-add static
    notesList.innerHTML = '<li>Share this risk report with your primary care physician.</li>';

    if (totalScore > 50) {
        const li = document.createElement('li');
        li.textContent = "Discuss pulmonary function tests due to elevated environmental risk.";
        notesList.appendChild(li);
    }
}

function getRiskLabel(score) {
    if (score < 35) return 'Low';
    if (score < 65) return 'Moderate';
    return 'High';
}

function getRiskColor(score) {
    if (score < 35) return '#4CAF50';
    if (score < 65) return '#FF9800';
    return '#F44336';
}

// Utility Functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}


// --- Visual Updates (Background & Overlay) ---

function updateBackground(weatherData) {
    const bgContainer = document.getElementById('bg-container');
    const locationName = (weatherData.location_name || '').toLowerCase();
    const weatherCond = (weatherData.data?.weather_condition || '').toLowerCase();

    // Reset classes
    bgContainer.className = '';

    // 1. Try to detect "Vibe" from Location Name
    if (locationName.match(/beach|ocean|sea|coast|island|bay|resort/)) {
        bgContainer.classList.add('bg-coastal');
    }
    else if (locationName.match(/forest|park|mountain|hill|valley|garden|nature/)) {
        bgContainer.classList.add('bg-nature');
    }
    else if (locationName.match(/city|metro|urban|downtown|plaza|street/)) {
        bgContainer.classList.add('bg-city');
    }
    // 2. Fallback to Weather/Time
    else {
        // If clear/sunny -> Coastal/Bright vibe might fit or just Default
        // If rain/snow -> City/Dark vibe might fit
        if (weatherCond.includes('rain') || weatherCond.includes('thunder') || weatherCond.includes('drizzle')) {
            bgContainer.classList.add('bg-city'); // Moody
        } else if (weatherCond.includes('clear') || weatherCond.includes('sun')) {
            bgContainer.classList.add('bg-coastal'); // Bright
        } else {
            bgContainer.classList.add('bg-default');
        }
    }

    console.log(`Updated background to: ${bgContainer.className} based on location: ${locationName} and weather: ${weatherCond}`);
}

function updateAqiOverlay(airData) {
    const overlay = document.getElementById('aqi-overlay');
    const aqi = airData.data.aqi;

    if (aqi <= 50) {
        overlay.style.opacity = '0';
        overlay.style.backgroundColor = 'transparent';
    }
    else if (aqi <= 100) {
        overlay.style.opacity = '0.2';
        overlay.style.backgroundColor = 'rgba(255, 235, 59, 0.3)'; // Yellowish haze
    }
    else if (aqi <= 150) {
        overlay.style.opacity = '0.4';
        overlay.style.backgroundColor = 'rgba(255, 152, 0, 0.4)'; // Orange haze
    }
    else {
        overlay.style.opacity = '0.6';
        overlay.style.backgroundColor = 'rgba(92, 60, 60, 0.5)'; // Dark/Red smog
    }
}

function resetApplication() {
    // Reset state
    appState.location = { latitude: null, longitude: null };
    appState.environmentalData = { air: null, soil: null, water: null, weather: null };
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

    // Reset Visuals
    document.getElementById('bg-container').className = 'bg-default';
    document.getElementById('aqi-overlay').style.opacity = '0';
}