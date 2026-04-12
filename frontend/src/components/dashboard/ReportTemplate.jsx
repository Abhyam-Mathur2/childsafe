import React, { forwardRef } from 'react';
import { AlertTriangle, CheckCircle, Info, Wind, Droplets, Volume2, Sprout, Radio, Sun } from 'lucide-react';

const ReportTemplate = forwardRef(({ report, user }, ref) => {
    if (!report) return null;

    // Helper to get severity color
    const getSeverityColor = (level) => {
        const l = level?.toLowerCase();
        if (l === 'high' || l === 'severe' || l === 'poor') return '#d32f2f'; // Red
        if (l === 'medium' || l === 'moderate') return '#fbc02d'; // Yellow
        return '#388e3c'; // Green
    };

    // Helper for dot classes
    const getDotClass = (level) => {
        const l = level?.toLowerCase();
        if (l === 'high' || l === 'severe' || l === 'poor') return 'dot red';
        if (l === 'medium' || l === 'moderate') return 'dot yellow';
        return 'dot green';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const validUntilDate = new Date(report.generated_at);
    validUntilDate.setFullYear(validUntilDate.getFullYear() + 1);

    return (
        <div ref={ref} className="report-paper">
            {/* Header */}
            <div className="report-header">
                <h1>Environmental Health Risk Assessment Report</h1>
                <div className="meta-grid">
                    <div><strong>Report ID:</strong> EHA-2026-{report.report_id.toString().padStart(3, '0')}</div>
                    <div><strong>Generated:</strong> {formatDate(report.generated_at)}</div>
                    <div><strong>Valid Until:</strong> {formatDate(validUntilDate)}</div>
                </div>
                <div className="user-meta-grid">
                    <div><strong>Name:</strong> {report.name || user?.name || 'Guest User'}</div>
                    <div><strong>Age:</strong> {report.age_range || 'N/A'}</div>
                    <div><strong>Assessment Period:</strong> 1 Year</div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="section-spacer">
                <div className="disclaimer-header">
                    <AlertTriangle size={24} color="#F9A825" fill="#FFF176" />
                    <h2>Important Disclaimer</h2>
                </div>
                <div className="disclaimer-box">
                    <div className="disclaimer-primary">
                        <Info size={20} color="#1b4d3e" style={{ minWidth: '20px' }} />
                        <div className="disclaimer-title">
                            THIS REPORT PROVIDES ENVIRONMENTAL EXPOSURE INFORMATION ONLY. IT IS NOT MEDICAL OR CLINICAL ADVICE.
                        </div>
                    </div>
                    <div className="disclaimer-secondary">
                        <p>This assessment analyzes environmental factors that may affect health based on scientific research about population-level risks. It does NOT:</p>
                        <ul>
                            <li>Provide medical diagnosis or treatment recommendations</li>
                            <li>Consider your complete medical history</li>
                            <li>Replace consultation with qualified healthcare providers</li>
                        </ul>
                        <div className="disclaimer-footer-line">
                            ALWAYS CONSULT WITH YOUR DOCTOR OR HEALTHCARE PROVIDER for medical concerns, treatment decisions, and health management.
                        </div>
                    </div>
                </div>
            </div>

            {/* Executive Summary */}
            <h2 className="section-title">Executive Summary</h2>
            <div className="summary-container">
                <div className="summary-left">
                    <div className="summary-box">
                        <div className="summary-label">Overall Risk Status</div>
                        <div className="summary-score">
                            {Math.round(report.risk_score)}
                            <span>/100</span>
                        </div>
                    </div>
                </div>
                <div className="summary-right">
                    <div className="summary-box">
                        <div className="summary-label">Priority</div>
                        <div className="priority-text">
                            {report.risk_level === 'high' ? 'MODERATE-HIGH RISK' : report.risk_level === 'medium' ? 'MODERATE RISK' : 'LOW RISK'}
                        </div>
                        {report.risk_level !== 'low' && (
                            <div className="attention-badge">
                                <span className="dot orange"></span> ATTENTION RECOMMENDED
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="summary-text-grid">
                <div className="summary-text-col">
                    <h4 className="text-col-title">Primary Concerns</h4>
                    <p>
                        <strong style={{ color: '#2e7d32' }}>Primary Concern:</strong> {report.contributing_factors.filter(f => f.impact === 'negative')[0]?.factor || 'None identified'}
                    </p>
                    {report.contributing_factors.filter(f => f.impact === 'negative')[1] && (
                        <p>
                            <strong style={{ color: '#2e7d32' }}>Secondary Concern:</strong> {report.contributing_factors.filter(f => f.impact === 'negative')[1].factor}
                        </p>
                    )}
                </div>
                <div className="summary-text-col">
                    <h4 className="text-col-title">Protective Factors</h4>
                    <p>
                        {report.contributing_factors.filter(f => f.impact === 'positive')[0]?.factor || 'No specific protective factors noted.'}
                    </p>
                    <p>
                        <strong style={{ color: '#2e7d32' }}>Key Finding:</strong> Environmental conditions in your area may affect pre-existing health considerations.
                    </p>
                </div>
            </div>

            {/* Section 1: Environmental Exposure Assessment */}
            <h2 className="section-title">Section 1: Environmental Exposure Assessment</h2>
            <div className="exposure-grid">
                {/* Air Quality */}
                <div className="exposure-card air-card">
                    <div className="card-top-strip" style={{ backgroundColor: getSeverityColor(report.environmental_risk > 60 ? 'high' : report.environmental_risk > 30 ? 'medium' : 'low') }}></div>
                    <div className="card-body">
                        <h3>
                            <Wind size={18} /> Air Quality: {report.environmental_risk > 60 ? 'HIGH' : report.environmental_risk > 30 ? 'MODERATE' : 'LOW'} EXPOSURE
                            <span className={getDotClass(report.environmental_risk > 60 ? 'high' : report.environmental_risk > 30 ? 'medium' : 'low')}></span>
                            ({Math.round(report.environmental_risk)}/100)
                        </h3>
                        <ul>
                            <li><strong>AQI Level:</strong> {report.feature_vector?.aqi ? Math.round(report.feature_vector.aqi) : 'N/A'} (local monitoring)</li>
                            <li><strong>Peak Hours:</strong> 8-10 AM & 6-8 PM (traffic patterns)</li>
                            <li><strong>Seasonal Variation:</strong> Higher in winter months</li>
                        </ul>
                    </div>
                </div>

                {/* Water Quality */}
                <div className="exposure-card water-card">
                    <div className="card-top-strip" style={{ backgroundColor: getSeverityColor(report.feature_vector?.water_risk === 3 ? 'high' : report.feature_vector?.water_risk === 2 ? 'medium' : 'low') }}></div>
                    <div className="card-body">
                        <h3>
                            <Droplets size={18} /> Water Quality: {report.feature_vector?.water_risk === 3 ? 'HIGH' : report.feature_vector?.water_risk === 2 ? 'MODERATE' : 'LOW'} EXPOSURE
                            <span className={getDotClass(report.feature_vector?.water_risk === 3 ? 'high' : report.feature_vector?.water_risk === 2 ? 'medium' : 'low')}></span>
                        </h3>
                        <ul>
                            <li><strong>Supply Pattern:</strong> Intermittent municipal supply noted</li>
                            <li><strong>Recommendation:</strong> Consider periodic water quality testing</li>
                        </ul>
                    </div>
                </div>

                {/* Noise Exposure */}
                <div className="exposure-card noise-card">
                    <div className="card-top-strip" style={{ backgroundColor: getSeverityColor(report.noise_data?.level > 60 ? 'high' : 'medium') }}></div>
                    <div className="card-body">
                        <h3>
                            <Volume2 size={18} /> Noise Exposure: {report.noise_data?.level > 60 ? 'HIGH' : 'MODERATE'} LEVELS
                            <span className={getDotClass(report.noise_data?.level > 60 ? 'high' : 'medium')}></span>
                            ({Math.round(report.noise_data?.risk_score || 0)}/100)
                        </h3>
                        <ul>
                            <li><strong>Level:</strong> {report.noise_data?.level || 55} dB (Est.)</li>
                            <li><strong>Source:</strong> {report.noise_data?.source || 'Traffic'}</li>
                            <li><strong>Sleep Impact:</strong> Potential disruption if {'>'}45dB</li>
                        </ul>
                    </div>
                </div>

                {/* Soil Safety */}
                <div className="exposure-card soil-card">
                    <div className="card-top-strip" style={{ backgroundColor: getSeverityColor(report.feature_vector?.soil_ph < 5 || report.feature_vector?.soil_ph > 8 ? 'medium' : 'low') }}></div>
                    <div className="card-body">
                        <h3>
                            <Sprout size={18} /> Soil Safety: {report.feature_vector?.soil_ph < 5 || report.feature_vector?.soil_ph > 8 ? 'MODERATE' : 'LOW'} EXPOSURE
                            <span className={getDotClass(report.feature_vector?.soil_ph < 5 || report.feature_vector?.soil_ph > 8 ? 'medium' : 'low')}></span>
                        </h3>
                        <ul>
                            <li><strong>pH Level:</strong> {report.feature_vector?.soil_ph || 7.0}</li>
                            <li><strong>Assessment:</strong> No significant immediate pathways identified</li>
                            <li><strong>Gardening Note:</strong> Use standard precautions</li>
                        </ul>
                    </div>
                </div>

                {/* Radiation */}
                <div className="exposure-card rad-card">
                    <div className="card-top-strip" style={{ backgroundColor: getSeverityColor(report.radiation_data?.level || 'Low') }}></div>
                    <div className="card-body">
                        <h3>
                            <Radio size={18} /> Radiation: {report.radiation_data?.level?.toUpperCase() || 'LOW'} EXPOSURE
                            <span className={getDotClass(report.radiation_data?.level || 'Low')}></span>
                        </h3>
                        <ul>
                            <li><strong>Radon Levels:</strong> Below recommended action levels</li>
                            <li><strong>Background:</strong> Within normal range for region</li>
                        </ul>
                    </div>
                </div>

                 {/* Weather */}
                 <div className="exposure-card weather-card">
                    <div className="card-top-strip" style={{ backgroundColor: '#fbc02d' }}></div>
                    <div className="card-body">
                        <h3>
                            <Sun size={18} /> Weather Conditions: VARIABLE
                            <span className="dot yellow"></span>
                        </h3>
                        <ul>
                            <li><strong>Heat Stress:</strong> Seasonal waves possible</li>
                            <li><strong>Extreme Conditions:</strong> Seasonal temperature variations noted</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Section 2: Personal Factors Analysis */}
            <h2 className="section-title">Section 2: Personal Factors Analysis</h2>
            <div className="subtitle">Factors That May Influence Environmental Impact:</div>
            
            <table className="personal-factors-table">
                <thead>
                    <tr>
                        <th>Factor</th>
                        <th>Status</th>
                        <th>Environmental Consideration</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Reported Health Factors</strong></td>
                        <td>[NOTED]</td>
                        <td>May increase sensitivity to certain exposures</td>
                    </tr>
                    <tr>
                        <td><strong>Sleep Quality</strong></td>
                        <td>{report.sleep_hours ? `[${report.sleep_hours.toUpperCase()}]` : '[REPORTED LEVEL]'}</td>
                        <td>Important for overall resilience</td>
                    </tr>
                    <tr>
                        <td><strong>Stress Levels</strong></td>
                        <td>{report.stress_level ? `[${report.stress_level.toUpperCase()}]` : '[REPORTED LEVEL]'}</td>
                        <td>Can interact with environmental stressors</td>
                    </tr>
                    <tr>
                        <td><strong>Exercise Habits</strong></td>
                        <td>{report.activity_level ? `[${report.activity_level.toUpperCase().replace('_', ' ')}]` : '[PATTERN]'}</td>
                        <td>Timing and location affect exposure</td>
                    </tr>
                </tbody>
            </table>

            <div className="subtitle" style={{ marginTop: '20px' }}>Potential Exposure Interactions Identified:</div>
            <div className="interactions-grid">
                <div className="interaction-box">
                    <div className="interaction-num">1</div>
                    <div className="interaction-content">
                        <strong>Air Quality + Health Factors:</strong><br/>
                        Increased attention during high pollution periods
                    </div>
                </div>
                <div className="interaction-box">
                    <div className="interaction-num">2</div>
                    <div className="interaction-content">
                        <strong>Noise + Sleep Quality:</strong><br/>
                        Sleep environment optimisation recommended
                    </div>
                </div>
                <div className="interaction-box">
                    <div className="interaction-num">3</div>
                    <div className="interaction-content">
                        <strong>Exercise Timing + Pollution:</strong><br/>
                        Schedule adjustment may reduce exposure
                    </div>
                </div>
                <div className="interaction-box">
                    <div className="interaction-num">4</div>
                    <div className="interaction-content">
                        <strong>Seasonal Patterns:</strong><br/>
                        Awareness of seasonal variations suggested
                    </div>
                </div>
            </div>

            {/* Section 3: Environmental Management */}
            <h2 className="section-title">Section 3: Environmental Management Suggestions</h2>
            <div className="management-grid">
                <div className="management-col">
                    <div className="management-header">Immediate Considerations (Next 7 Days)</div>
                    <div className="management-card green-theme">
                        <h4>Air Quality Management:</h4>
                        <ul>
                            <li>Monitor local air quality reports</li>
                            <li>Consider indoor exercise alternatives during high pollution</li>
                            <li>Review home ventilation strategies</li>
                        </ul>
                    </div>
                </div>
                <div className="management-col">
                    <div className="management-header">Medium-Term Planning (Next 30 Days)</div>
                    <div className="management-card grey-theme">
                        <h4>Environmental Testing:</h4>
                        <ul>
                            <li>Research local water testing services</li>
                            <li>Consider indoor air quality monitor</li>
                            <li>Explore noise measurement apps</li>
                        </ul>
                    </div>
                     <div className="management-card grey-theme" style={{marginTop: '15px'}}>
                        <h4>Home Environment:</h4>
                        <ul>
                            <li>Review window seals</li>
                            <li>Consider air purification options</li>
                        </ul>
                    </div>
                </div>
                <div className="management-col">
                    <div className="management-header">Long-Term Considerations (3-12 Months)</div>
                    <div className="management-card grey-theme">
                        <h4>Structural Options:</h4>
                        <ul>
                            <li>Research window upgrades for noise</li>
                            <li>Explore air filtration system options</li>
                            <li>Consider indoor plants for air quality</li>
                        </ul>
                    </div>
                     <div className="management-card grey-theme" style={{marginTop: '15px'}}>
                        <h4>Community Resources:</h4>
                        <ul>
                            <li>Connect with local environmental groups</li>
                            <li>Stay informed about community initiatives</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Section 4: Water & UV Risk Panel */}
            <h2 className="section-title">Section 4: Water &amp; UV Risk Panel</h2>
            <div className="water-uv-grid">
                <div className="water-uv-card">
                    <h3><Droplets size={18} /> Water Source</h3>
                    <div className="water-source-display">
                        <span className="water-source-label">{report.water_source || 'Not reported'}</span>
                        {report.water_source && (
                            <span className={`risk-badge ${
                                report.water_source.toLowerCase() === 'well' ? 'risk-high' :
                                report.water_source.toLowerCase() === 'tap' ? 'risk-moderate' : 'risk-low'
                            }`}>
                                {report.water_source.toLowerCase() === 'well' ? 'HIGH RISK' :
                                 report.water_source.toLowerCase() === 'tap' ? 'MODERATE' : 'LOW RISK'}
                            </span>
                        )}
                    </div>
                </div>
                <div className="water-uv-card">
                    <h3><Sun size={18} /> UV Index</h3>
                    <div className="uv-scale-container">
                        <div className="uv-scale-bar">
                            <div className="uv-segment uv-low" style={{flex: 2}}>Low</div>
                            <div className="uv-segment uv-moderate" style={{flex: 3}}>Moderate</div>
                            <div className="uv-segment uv-high" style={{flex: 2}}>High</div>
                            <div className="uv-segment uv-very-high" style={{flex: 3}}>Very High</div>
                            <div className="uv-segment uv-extreme" style={{flex: 1}}>11+</div>
                        </div>
                        <div className="uv-indicator" style={{left: `${Math.min((report.uv_index || 0) / 12 * 100, 100)}%`}}>
                            <div className="uv-indicator-dot"></div>
                            <div className="uv-indicator-label">{report.uv_index ?? 'N/A'}</div>
                        </div>
                    </div>
                </div>
                <div className="water-uv-card full-width">
                    <h3><Wind size={18} /> Activity × Air Quality Exposure</h3>
                    {report.activity_duration ? (
                        <div className={`exposure-risk-badge ${
                            report.activity_duration.includes('90') && (report.feature_vector?.aqi || 0) > 100 ? 'exposure-very-high' :
                            (report.feature_vector?.aqi || 0) > 100 ? 'exposure-high' :
                            report.activity_duration.includes('60') ? 'exposure-moderate' : 'exposure-low'
                        }`}>
                            {report.activity_duration} outdoor activity with AQI {Math.round(report.feature_vector?.aqi || 0)} ={' '}
                            {report.activity_duration.includes('90') && (report.feature_vector?.aqi || 0) > 100 ? 'Very High Exposure Risk' :
                             (report.feature_vector?.aqi || 0) > 100 ? 'High Exposure Risk' :
                             report.activity_duration.includes('60') ? 'Moderate Exposure' : 'Low Exposure'}
                        </div>
                    ) : (
                        <p style={{fontSize: '0.9rem', color: '#666'}}>Activity duration not reported.</p>
                    )}
                </div>
            </div>

            {/* Section 5: Mental & Emotional Health Factors */}
            <h2 className="section-title">Section 5: Mental &amp; Emotional Health Factors</h2>
            <div className="mental-health-section">
                {report.mental_health_conditions && report.mental_health_conditions.length > 0 ? (
                    <div className="mental-conditions-grid">
                        {report.mental_health_conditions.map((condition, idx) => (
                            <div key={idx} className="mental-condition-card">
                                <div className="condition-name">{condition}</div>
                                <div className="condition-interaction">
                                    {condition.toLowerCase().includes('anxiety') && 'Studies show air pollution worsens anxiety symptoms. Consider indoor air purification and stress-reduction practices.'}
                                    {condition.toLowerCase().includes('depression') && 'Environmental stressors including poor air quality and noise pollution can exacerbate depressive episodes. Prioritize clean indoor environments.'}
                                    {condition.toLowerCase().includes('adhd') && 'Environmental toxins are linked to attention difficulties in children. Minimize exposure to lead, pesticides, and high-pollution areas.'}
                                    {!['anxiety', 'depression', 'adhd'].some(c => condition.toLowerCase().includes(c)) && `Environmental pollutants may interact with ${condition}. Consult your healthcare provider about specific environmental triggers.`}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mental-health-clean">
                        <CheckCircle size={20} color="#388e3c" />
                        <span>No mental health conditions reported — maintaining low-stress environments is still recommended for overall wellbeing.</span>
                    </div>
                )}
            </div>

            {/* Section 6: Age-Specific Vulnerability Analysis */}
            <h2 className="section-title">Section 6: Age-Specific Vulnerability Analysis</h2>
            {['0-1', '1-3', '3-12'].includes(report.age_range) && (
                <div className="age-warning-box">
                    <AlertTriangle size={22} color="#e65100" />
                    <span>⚠️ Children under 12 are classified as <strong>HIGH SENSITIVITY</strong>. Developing lungs, brains, and immune systems absorb pollutants at 2–3x the rate of adults.</span>
                </div>
            )}
            <table className="age-vulnerability-table">
                <thead>
                    <tr>
                        <th>Age Group</th>
                        <th>Vulnerability Level</th>
                        <th>Key Organs at Risk</th>
                        <th>Recommended AQI Limit</th>
                    </tr>
                </thead>
                <tbody>
                    {[
                        { range: '0-1', level: 'EXTREME', organs: 'Lungs, Brain, Immune System', aqi: '< 25' },
                        { range: '1-3', level: 'VERY HIGH', organs: 'Lungs, Brain, Kidneys', aqi: '< 50' },
                        { range: '3-12', level: 'HIGH', organs: 'Lungs, Neurological, Skin', aqi: '< 75' },
                        { range: '13-17', level: 'MODERATE', organs: 'Lungs, Hormonal System', aqi: '< 100' },
                        { range: '18-25', level: 'STANDARD', organs: 'Respiratory, Cardiovascular', aqi: '< 150' },
                        { range: '26-35', level: 'STANDARD', organs: 'Respiratory, Cardiovascular', aqi: '< 150' },
                        { range: '36-50', level: 'MODERATE', organs: 'Cardiovascular, Respiratory', aqi: '< 100' },
                        { range: '51-65', level: 'HIGH', organs: 'Heart, Lungs, Joints', aqi: '< 75' },
                        { range: '65+', level: 'VERY HIGH', organs: 'Heart, Lungs, Immune System', aqi: '< 50' },
                    ].map((row) => (
                        <tr key={row.range} className={report.age_range === row.range ? 'highlighted-row' : ''}>
                            <td><strong>{row.range}</strong></td>
                            <td><span className={`vuln-badge vuln-${row.level.toLowerCase().replace(' ', '-')}`}>{row.level}</span></td>
                            <td>{row.organs}</td>
                            <td>{row.aqi}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Section 7: Historical Trend (Past Reports) */}
            <h2 className="section-title">Section 7: Historical Trend</h2>
            {report.past_health_reports && report.past_health_reports.length > 0 ? (
                <div className="history-section">
                    <div className="history-chart">
                        {report.past_health_reports.map((pr, idx) => (
                            <div key={idx} className="history-bar-container">
                                <div className="history-bar-wrapper">
                                    <div
                                        className={`history-bar ${
                                            (pr.risk_level || '').toLowerCase() === 'high' ? 'bar-high' :
                                            (pr.risk_level || '').toLowerCase() === 'medium' ? 'bar-medium' : 'bar-low'
                                        }`}
                                        style={{height: `${Math.min(pr.risk_score || 0, 100)}%`}}
                                    >
                                        <span className="bar-value">{Math.round(pr.risk_score || 0)}</span>
                                    </div>
                                </div>
                                <div className="history-label">{pr.date || `Report ${idx + 1}`}</div>
                            </div>
                        ))}
                    </div>
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Report Date</th>
                                <th>Risk Score</th>
                                <th>Risk Level</th>
                                <th>Key Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.past_health_reports.map((pr, idx) => (
                                <tr key={idx}>
                                    <td>{pr.date || 'N/A'}</td>
                                    <td>{Math.round(pr.risk_score || 0)}</td>
                                    <td><span className={`risk-level-tag ${(pr.risk_level || 'low').toLowerCase()}`}>{pr.risk_level || 'N/A'}</span></td>
                                    <td>{pr.key_change || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="first-assessment-box">
                    <Info size={20} color="#1b4d3e" />
                    <span>This is your first assessment. Future reports will show trends here, allowing you to track environmental health changes over time.</span>
                </div>
            )}

            {/* Section 8: Short / Medium / Long Term Considerations */}
            <h2 className="section-title">Section 8: Time-Based Considerations</h2>
            <div className="timeline-grid">
                <div className="timeline-col">
                    <div className="timeline-header yellow-header">🟡 This Week (Short-Term)</div>
                    <ul className="timeline-list">
                        {(report.short_term_considerations || ['Monitor daily AQI', 'Limit outdoor exposure on high pollution days', 'Ensure adequate hydration', 'Apply sunscreen before going outside']).map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                </div>
                <div className="timeline-col">
                    <div className="timeline-header orange-header">🟠 This Month (Medium-Term)</div>
                    <ul className="timeline-list">
                        {(report.medium_term_considerations || ['Schedule pediatric check-up', 'Test water quality at home', 'Review indoor air filtration', 'Establish monitoring routines']).map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                </div>
                <div className="timeline-col">
                    <div className="timeline-header red-header">🔴 This Year (Long-Term)</div>
                    <ul className="timeline-list">
                        {(report.long_term_considerations || ['Invest in air purification', 'Consider location-based activity adjustments', 'Build seasonal health calendar', 'Plan annual assessments']).map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Section 9: Seasonal Awareness */}
            <h2 className="section-title">Section 9: Seasonal Awareness</h2>
            <div className="seasonal-section">
                <div className="season-header-display">
                    <span className="season-icon">
                        {(report.seasonal_awareness?.season || 'Spring') === 'Winter' ? '❄️' :
                         (report.seasonal_awareness?.season || 'Spring') === 'Spring' ? '🌸' :
                         (report.seasonal_awareness?.season || 'Spring') === 'Summer' ? '☀️' : '🍂'}
                    </span>
                    <span className="season-name">{report.seasonal_awareness?.season || 'Current Season'}</span>
                </div>
                <div className="seasonal-grid">
                    <div className="seasonal-card risk-card">
                        <h4>Seasonal Risk Factors</h4>
                        <ul>
                            {(report.seasonal_awareness?.risks || ['Seasonal variations may affect air quality', 'Temperature changes impact outdoor activity safety', 'Check local environmental reports']).map((risk, idx) => (
                                <li key={idx}>{risk}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="seasonal-card tips-card">
                        <h4>Actionable Tips</h4>
                        <ul>
                            {(report.seasonal_awareness?.tips || ['Adjust outdoor schedules based on conditions', 'Monitor indoor air quality', 'Stay informed about seasonal patterns']).map((tip, idx) => (
                                <li key={idx}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Section 10: Daily Pattern Suggestion */}
            <h2 className="section-title">Section 10: Daily Pattern Suggestion</h2>
            <div className="daily-pattern-grid">
                {[
                    { period: 'Morning', time: '6 AM – 12 PM', icon: '🌅', key: 'morning', defaultColor: '#e8f5e9', defaultBorder: '#388e3c' },
                    { period: 'Afternoon', time: '12 PM – 5 PM', icon: '☀️', key: 'afternoon', defaultColor: '#fff8e1', defaultBorder: '#fbc02d' },
                    { period: 'Evening', time: '5 PM – 10 PM', icon: '🌙', key: 'evening', defaultColor: '#e8f5e9', defaultBorder: '#388e3c' },
                ].map((slot) => {
                    const suggestion = report.daily_pattern_suggestion?.[slot.key] || '';
                    const isWarning = suggestion.toLowerCase().includes('avoid') || suggestion.toLowerCase().includes('limit') || suggestion.toLowerCase().includes('closed');
                    return (
                        <div key={slot.key} className={`daily-pattern-card ${isWarning ? 'pattern-caution' : 'pattern-safe'}`}>
                            <div className="pattern-icon">{slot.icon}</div>
                            <div className="pattern-period">{slot.period}</div>
                            <div className="pattern-time">{slot.time}</div>
                            <div className="pattern-suggestion">{suggestion || 'No specific recommendation'}</div>
                        </div>
                    );
                })}
            </div>

            {/* Section 11: Health Professional Discussion Guide */}
            <h2 className="section-title">Section 11: Health Professional Discussion Guide</h2>
            <div className="professional-guide">
                <div className="guide-header">
                    <strong>📋 Take this to your next doctor's appointment</strong>
                </div>
                <div className="guide-checklist">
                    {(report.health_professional_guide || [
                        'Discuss current AQI levels and safe thresholds for your child',
                        'Review UV protection strategies for their specific needs',
                        'Ask about respiratory precautions given local air quality patterns',
                        'Discuss water source and any filtration needs'
                    ]).map((item, idx) => (
                        <div key={idx} className="checklist-item">
                            <span className="checkbox-char">☐</span>
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section 12: Support & Resources */}
            <h2 className="section-title">Section 12: Support &amp; Resources</h2>
            <div className="support-section">
                <div className="resource-cards-grid">
                    {(report.support_resources || [
                        'WHO Air Quality Guidelines: who.int/air-quality',
                        'IQAir Real-Time Maps: iqair.com',
                        'EPA Indoor Air Quality Guide: epa.gov/indoor-air-quality-iaq',
                        'Skin Cancer Foundation UV Guide: skincancer.org',
                        'National Institute of Mental Health: nimh.nih.gov',
                        'American Academy of Pediatrics: aap.org'
                    ]).map((resource, idx) => {
                        const parts = resource.split(': ');
                        return (
                            <div key={idx} className="resource-card">
                                <div className="resource-name">{parts[0]}</div>
                                {parts[1] && <div className="resource-link">{parts[1]}</div>}
                            </div>
                        );
                    })}
                </div>
                <div className="caregiver-note">
                    <Info size={18} color="#1b4d3e" />
                    <span>Taking care of a child's environmental health can be stressful. Remember to look after yourself too — your wellbeing matters.</span>
                </div>
            </div>

            {/* Section 13: Comprehensive Action Plan (previously Section 4) */}
            <h2 className="section-title">Section 13: Comprehensive Action Plan</h2>
            
            <div className="action-plan-grid">
                <div className="action-plan-col">
                    <div className="management-header">Short-Term Considerations (Today / This Week)</div>
                    <div className="management-card green-theme">
                        <h4>Immediate Actions</h4>
                        <ul>
                            <li>Adapt to current AQI and Temperature</li>
                            <li>Protect against today's UV index peak</li>
                            <li>Ensure adequate hydration and indoor air circulation</li>
                        </ul>
                    </div>
                </div>
                <div className="action-plan-col">
                    <div className="management-header">Medium-Term Considerations (This Month)</div>
                    <div className="management-card grey-theme">
                        <h4>Pattern Adjustments</h4>
                        <ul>
                            <li>Establish check-in reminders for changing patterns</li>
                            <li>Review typical outdoor routines</li>
                            <li>Assess home water filtration status</li>
                        </ul>
                    </div>
                </div>
                <div className="action-plan-col">
                    <div className="management-header">Long-Term Considerations (This Season / Year)</div>
                    <div className="management-card grey-theme">
                        <h4>Habit Building</h4>
                        <ul>
                            <li>Monitor cumulative exposure risks over the year</li>
                            <li>Integrate sustainable health habits into daily life</li>
                            <li>Plan structural modifications (e.g., HVAC upgrades)</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="subtitle" style={{ marginTop: '30px' }}>Additional Guidance:</div>
            <div className="guidance-grid">
                <div className="management-card grey-theme outline-card">
                    <h4>Seasonal Awareness</h4>
                    <p style={{ fontSize: '0.85rem', marginTop: '10px' }}><strong>Summer:</strong> High UV/Heat precautions<br/>
                    <strong>Winter:</strong> Smog and indoor air quality<br/>
                    <strong>Monsoon:</strong> Humidity and mold prevention<br/>
                    <strong>Spring:</strong> Pollen and allergy management</p>
                </div>
                <div className="management-card grey-theme outline-card">
                    <h4>Daily Pattern Suggestion</h4>
                    <p style={{ fontSize: '0.85rem', marginTop: '10px' }}><strong>Best outdoor time:</strong> 6:00 AM – 8:00 AM<br/>
                    <strong>Avoid outdoors:</strong> 12:00 PM – 4:00 PM (Peak UV &amp; Temp)<br/>
                    <strong>Evening walk:</strong> After 6:00 PM</p>
                </div>
            </div>

            {/* Section 14: Medical & Support Resources (previously Section 5) */}
            <h2 className="section-title">Section 14: Medical &amp; Support Resources</h2>
            <div className="resources-grid">
                <div className="management-card green-theme">
                    <h4>Health Professional Discussion Guide</h4>
                    <p style={{ fontSize: '0.85rem', marginTop: '10px', marginBottom: '10px' }}>Bring this data to your pediatrician to tailor advice to your child's conditions:</p>
                    <ul>
                        <li>"Are there specific environmental triggers we should monitor based on their health history?"</li>
                        <li>"How might the local water source impact their development?"</li>
                        <li>"What UV protection strategies are best for their specific needs?"</li>
                        <li>"Are there any respiratory precautions needed given the local AQI patterns?"</li>
                    </ul>
                </div>
                <div className="management-card grey-theme outline-card">
                    <h4>Support &amp; Resources</h4>
                    <p style={{ fontSize: '0.85rem', marginTop: '10px', marginBottom: '10px' }}>You are not alone. Caregiving requires taking care of yourself, too.</p>
                    <ul>
                        <li><strong>Mental Health:</strong> Local support groups for caregivers</li>
                        <li><strong>Environmental Health:</strong> EPA guidelines for indoor air quality</li>
                        <li><strong>Community:</strong> Connect with neighborhood parent groups for shared childcare and support</li>
                    </ul>
                </div>
            </div>

            <div className="footer">
                <p>Generated by ChildSafeEnviro Platform • www.childsafeenviro.ai • Confidential • Report ID: EHA-2026-{report.report_id}</p>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Inter:wght@400;500;600&display=swap');

                .report-paper {
                    background: #fff;
                    color: #1a1a1a;
                    font-family: 'Inter', sans-serif;
                    padding: 60px 50px;
                    max-width: 100%;
                    box-sizing: border-box;
                    position: relative;
                }

                h1, h2, h3, h4 { font-family: 'Merriweather', serif; color: #1b4d3e; }

                .report-header { margin-bottom: 50px; border-bottom: 2px solid #1b4d3e; padding-bottom: 30px; }
                .report-header h1 { font-size: 2.6rem; margin-bottom: 25px; line-height: 1.2; }
                
                .meta-grid, .user-meta-grid {
                    display: flex;
                    justify-content: space-between;
                    padding-bottom: 12px;
                    margin-bottom: 15px;
                    font-size: 0.95rem;
                    color: #444;
                }
                
                .meta-grid { border-bottom: 1px solid #eee; }

                .section-spacer { margin-bottom: 50px; }
                .disclaimer-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
                .disclaimer-header h2 { font-size: 1.6rem; margin: 0; color: #b71c1c; }
                
                .disclaimer-box {
                    background: #fff5f5;
                    border: 1px solid #ffcdd2;
                    border-left: 6px solid #b71c1c;
                    padding: 30px;
                    border-radius: 4px;
                }
                .disclaimer-primary { display: flex; gap: 15px; align-items: start; margin-bottom: 18px; }
                .disclaimer-title { font-weight: 800; font-size: 1.1rem; color: #b71c1c; letter-spacing: 0.5px; }
                .disclaimer-secondary { margin-left: 35px; font-size: 0.95rem; line-height: 1.6; color: #333; }
                .disclaimer-secondary ul { margin-top: 10px; }
                .disclaimer-footer-line { margin-top: 20px; font-weight: bold; border-top: 1px solid #ffcdd2; padding-top: 15px; color: #b71c1c; text-align: center; font-size: 0.9rem; }

                .section-title { font-size: 1.9rem; margin-top: 60px; margin-bottom: 30px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
                .subtitle { font-family: 'Merriweather', serif; font-size: 1.2rem; color: #1b4d3e; margin-bottom: 20px; font-weight: 700; }

                /* Summary */
                .summary-container { display: flex; gap: 30px; margin-bottom: 40px; }
                .summary-left, .summary-right { flex: 1; background: #f3f1e9; padding: 30px; border-radius: 8px; border: 1px solid #e0ddd0; }
                .summary-label { font-family: 'Merriweather', serif; font-size: 1.2rem; margin-bottom: 15px; font-weight: 700; }
                .summary-score { font-size: 4rem; font-weight: bold; font-family: 'Merriweather', serif; line-height: 1; color: #1b4d3e; }
                .summary-score span { font-size: 1.5rem; color: #666; font-family: 'Inter', sans-serif; font-weight: 400; }
                .priority-text { font-weight: 800; margin-bottom: 15px; font-size: 1.1rem; letter-spacing: 1px; }
                .attention-badge { display: inline-flex; align-items: center; gap: 8px; background: #fff; padding: 8px 15px; border-radius: 20px; font-weight: bold; font-size: 0.85rem; color: #e65100; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

                .summary-text-grid { display: flex; gap: 40px; margin-bottom: 50px; }
                .summary-text-col { flex: 1; }
                .text-col-title { font-size: 1.15rem; border-bottom: 2px solid #1b4d3e; padding-bottom: 10px; margin-bottom: 15px; font-weight: 700; }
                .summary-text-col p { margin-bottom: 15px; line-height: 1.6; }

                /* Exposure Grid */
                .exposure-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px; margin-bottom: 50px; }
                .exposure-card { background: #fff; border: 1px solid #e0e0e0; display: flex; flex-direction: row; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
                .card-top-strip { width: 8px; flex-shrink: 0; }
                .card-body { padding: 25px; flex: 1; }
                .card-body h3 { font-size: 1.1rem; display: flex; align-items: center; gap: 10px; margin-bottom: 15px; margin-top: 0; }
                .card-body ul { padding-left: 18px; margin: 0; font-size: 0.9rem; line-height: 1.7; color: #444; }
                .card-body li { margin-bottom: 6px; }

                /* Personal Factors */
                .personal-factors-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 0.95rem; border: 1px solid #eee; }
                .personal-factors-table th { text-align: left; background: #f8f9fa; padding: 15px; font-family: 'Merriweather', serif; border-bottom: 2px solid #eee; }
                .personal-factors-table td { padding: 15px; border-bottom: 1px solid #eee; }

                .interactions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 50px; }
                .interaction-box { background: #f8fbf9; padding: 20px; display: flex; gap: 20px; border: 1px solid #e8f5e9; border-radius: 8px; }
                .interaction-num { background: #1b4d3e; color: white; width: 28px; height: 28px; min-width: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 50%; font-size: 0.9rem; }
                .interaction-content { font-size: 0.95rem; line-height: 1.5; color: #333; }

                /* Management */
                .management-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 60px; }
                .management-header { font-family: 'Inter', sans-serif; border-bottom: 2px solid #1b4d3e; padding-bottom: 10px; margin-bottom: 20px; font-size: 0.95rem; font-weight: 800; color: #1b4d3e; text-transform: uppercase; letter-spacing: 0.5px; }
                .management-card { padding: 25px; font-size: 0.9rem; border-radius: 8px; height: 100%; box-sizing: border-box; }
                .management-card h4 { font-size: 1rem; margin-top: 0; margin-bottom: 15px; }
                .management-card ul { padding-left: 20px; margin: 0; }
                .management-card li { margin-bottom: 10px; line-height: 1.5; }
                .green-theme { background-color: #1b4d3e; color: white; }
                .green-theme h4 { color: white; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px; }
                .grey-theme { background-color: #f3f1e9; color: #333; border: 1px solid #e0ddd0; }
                .grey-theme h4 { border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 8px; }

                .footer { border-top: 1px solid #eee; padding-top: 30px; margin-top: 60px; font-size: 0.85rem; color: #888; text-align: center; font-family: 'Inter', sans-serif; }

                /* Dots */
                .dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-left: 8px; }
                .dot.red { background: #d32f2f; box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1); }
                .dot.yellow { background: #fbc02d; box-shadow: 0 0 0 3px rgba(251, 192, 45, 0.1); }
                .dot.green { background: #388e3c; box-shadow: 0 0 0 3px rgba(56, 142, 60, 0.1); }
                .dot.orange { background: #e65100; box-shadow: 0 0 0 3px rgba(230, 81, 0, 0.1); }

                /* Grids */
                .action-plan-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
                .guidance-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; }
                .resources-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 50px; }
                .outline-card { border: 1px solid #e0ddd0 !important; background-color: #fbfaf7 !important; }

                /* Water & UV */
                .water-uv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 50px; }
                .water-uv-card { background: #fff; border: 1px solid #eee; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .water-uv-card.full-width { grid-column: 1 / -1; }
                .water-uv-card h3 { display: flex; align-items: center; gap: 10px; font-size: 1.1rem; margin-top: 0; margin-bottom: 20px; }
                .water-source-display { display: flex; align-items: center; gap: 20px; background: #f9f9f9; padding: 15px; border-radius: 6px; }
                .water-source-label { font-size: 1.4rem; font-weight: 700; text-transform: capitalize; color: #1b4d3e; }
                .risk-badge { padding: 6px 14px; border-radius: 4px; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.5px; }

                .uv-scale-container { position: relative; margin-top: 15px; padding-bottom: 40px; }
                .uv-scale-bar { display: flex; height: 28px; border-radius: 14px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
                .uv-segment { display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }

                .uv-indicator { position: absolute; top: -8px; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; transition: left 1s ease-out; }
                .uv-indicator-dot { width: 18px; height: 18px; background: #1b4d3e; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
                .uv-indicator-label { margin-top: 32px; font-weight: 800; font-size: 1.1rem; color: #1b4d3e; background: #fff; padding: 2px 8px; border-radius: 4px; border: 1px solid #1b4d3e; }

                .exposure-risk-badge { padding: 20px 30px; border-radius: 10px; font-size: 1.1rem; font-weight: 700; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

                /* Mental Health */
                .mental-health-section { margin-bottom: 50px; }
                .mental-conditions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
                .mental-condition-card { background: #fffcf9; border-left: 6px solid #e65100; padding: 22px; border-radius: 4px; border-right: 1px solid #fff3e0; border-top: 1px solid #fff3e0; border-bottom: 1px solid #fff3e0; }
                .condition-name { font-weight: 800; font-size: 1.1rem; color: #e65100; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
                .condition-interaction { font-size: 0.95rem; line-height: 1.6; color: #444; }
                .mental-health-clean { display: flex; align-items: center; gap: 15px; background: #f1f8f1; padding: 25px; font-size: 1rem; color: #2e7d32; border-radius: 8px; border: 1px solid #e8f5e9; }

                /* Age Vulnerability */
                .age-warning-box { display: flex; align-items: start; gap: 15px; background: #fff8e1; border: 2px solid #ffe082; border-left: 8px solid #fbc02d; padding: 25px; margin-bottom: 30px; font-size: 1.05rem; color: #333; line-height: 1.6; border-radius: 4px; }
                .age-vulnerability-table { width: 100%; border-collapse: collapse; margin-bottom: 50px; font-size: 0.9rem; border: 1px solid #eee; }
                .age-vulnerability-table th { text-align: left; background: #1b4d3e; color: white; padding: 15px; font-family: 'Merriweather', serif; font-size: 0.95rem; }
                .age-vulnerability-table td { padding: 12px 15px; border-bottom: 1px solid #eee; }
                .age-vulnerability-table .highlighted-row { background: #f1f8f1; font-weight: 700; outline: 2px solid #1b4d3e; outline-offset: -2px; }
                .vuln-badge { padding: 4px 12px; border-radius: 4px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }

                /* Timeline */
                .timeline-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 50px; }
                .timeline-col { background: #fff; border: 1px solid #eee; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
                .timeline-header { padding: 18px; font-weight: 800; font-size: 1rem; text-align: center; text-transform: uppercase; letter-spacing: 1px; }
                .timeline-list { padding: 20px 20px 25px 35px; margin: 0; font-size: 0.9rem; line-height: 1.8; color: #444; }
                .timeline-list li { margin-bottom: 10px; }

                /* Support */
                .resource-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                .resource-card { background: #f9f9f9; padding: 20px; border-left: 4px solid #1b4d3e; border-radius: 4px; transition: transform 0.2s; }
                .resource-name { font-weight: 800; font-size: 0.95rem; color: #1b4d3e; margin-bottom: 8px; }
                .resource-link { font-size: 0.8rem; color: #666; word-break: break-all; font-family: monospace; }
                .caregiver-note { display: flex; align-items: center; gap: 15px; background: #f0f7f4; border-left: 6px solid #1b4d3e; padding: 25px; font-size: 1rem; color: #333; line-height: 1.6; border-radius: 4px; }

                @media (max-width: 1024px) {
                    .report-paper {
                        padding: 36px 24px;
                    }

                    .report-header h1 {
                        font-size: 2rem;
                    }

                    .meta-grid,
                    .user-meta-grid,
                    .summary-container,
                    .summary-text-grid {
                        flex-direction: column;
                        gap: 14px;
                    }

                    .exposure-grid,
                    .management-grid,
                    .water-uv-grid,
                    .mental-conditions-grid,
                    .timeline-grid,
                    .resource-cards-grid,
                    .action-plan-grid,
                    .guidance-grid,
                    .resources-grid,
                    .daily-pattern-grid,
                    .seasonal-grid,
                    .interactions-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .water-uv-card.full-width {
                        grid-column: auto;
                    }
                }

                @media (max-width: 640px) {
                    .report-paper {
                        padding: 24px 16px;
                    }

                    .report-header h1 {
                        font-size: 1.6rem;
                        line-height: 1.3;
                    }

                    .section-title {
                        font-size: 1.3rem;
                        margin-top: 40px;
                    }

                    .summary-score {
                        font-size: 3rem;
                    }

                    .water-source-display {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }

                    .uv-segment {
                        font-size: 0.58rem;
                    }
                }

                @media print {
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                    body {
                        background: white;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .report-paper {
                        padding: 0 !important;
                        box-shadow: none !important;
                        width: 100% !important;
                    }
                    .section-title {
                        page-break-before: always;
                        padding-top: 30px;
                    }
                    .exposure-card, .management-card, .interaction-box, .water-uv-card, .mental-condition-card, .timeline-col, .resource-card, tr {
                        page-break-inside: avoid;
                    }
                    .no-print {
                        display: none;
                    }
                    .uv-scale-bar {
                        border: 1px solid #ddd;
                    }
                }
            `}</style>
        </div>
    );
});

export default ReportTemplate;
