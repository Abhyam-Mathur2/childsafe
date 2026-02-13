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

            <div className="footer">
                <p>Generated by Childsafeenvirons Platform • www.childsafeenvirons.ai • Confidential • Report ID: EHA-2026-{report.report_id}</p>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Inter:wght@400;600&display=swap');

                .report-paper {
                    background: #fff;
                    color: #1a1a1a;
                    font-family: 'Inter', sans-serif;
                    padding: 50px;
                    max-width: 100%;
                    box-sizing: border-box;
                }

                h1, h2, h3, h4 { font-family: 'Merriweather', serif; color: #1b4d3e; }

                .report-header { margin-bottom: 40px; }
                .report-header h1 { font-size: 2.4rem; border-bottom: none; margin-bottom: 25px; }
                
                .meta-grid, .user-meta-grid {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                    font-size: 0.95rem;
                    color: #444;
                }

                .section-spacer { margin-bottom: 40px; }
                .disclaimer-header { display: flex; alignItems: center; gap: 10px; margin-bottom: 15px; }
                .disclaimer-header h2 { font-size: 1.6rem; margin: 0; }
                
                .disclaimer-box {
                    background: #e8f5e9;
                    border-left: 5px solid #1b4d3e;
                    padding: 25px;
                }
                .disclaimer-primary { display: flex; gap: 15px; align-items: start; margin-bottom: 15px; }
                .disclaimer-title { font-weight: bold; font-size: 1.1rem; color: #1b4d3e; }
                .disclaimer-secondary { margin-left: 35px; font-size: 0.95rem; line-height: 1.5; color: #333; }
                .disclaimer-footer-line { margin-top: 15px; font-weight: bold; border-left: 3px solid #1b4d3e; padding-left: 10px; }

                .section-title { font-size: 1.8rem; border-bottom: none; margin-top: 40px; margin-bottom: 25px; }
                .subtitle { font-family: 'Merriweather', serif; font-size: 1.2rem; color: #1b4d3e; margin-bottom: 15px; }

                /* Summary */
                .summary-container { display: flex; gap: 30px; margin-bottom: 30px; }
                .summary-left, .summary-right { flex: 1; background: #f3f1e9; padding: 25px; }
                .summary-label { font-family: 'Merriweather', serif; font-size: 1.1rem; margin-bottom: 10px; }
                .summary-score { font-size: 3.5rem; font-weight: bold; font-family: 'Merriweather', serif; line-height: 1; }
                .summary-score span { font-size: 1.2rem; color: #666; font-family: 'Inter', sans-serif; font-weight: normal; }
                .priority-text { font-weight: bold; margin-bottom: 10px; }
                .attention-badge { display: inline-flex; align-items: center; gap: 5px; background: #fff; padding: 5px 10px; border-radius: 4px; font-weight: bold; font-size: 0.85rem; color: #e65100; }

                .summary-text-grid { display: flex; gap: 40px; margin-bottom: 40px; }
                .summary-text-col { flex: 1; }
                .text-col-title { font-size: 1.1rem; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 10px; }

                /* Exposure Grid */
                .exposure-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
                .exposure-card { background: #f9f9f9; border: 1px solid #eee; display: flex; flex-direction: row; }
                .card-top-strip { width: 6px; flex-shrink: 0; }
                .card-body { padding: 20px; flex: 1; }
                .card-body h3 { font-size: 0.95rem; display: flex; align-items: center; gap: 8px; margin-bottom: 12px; margin-top: 0; }
                .card-body ul { padding-left: 15px; margin: 0; font-size: 0.85rem; line-height: 1.6; }

                /* Personal Factors */
                .personal-factors-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 0.95rem; }
                .personal-factors-table th { text-align: left; background: #f9f9f9; padding: 12px; font-family: 'Merriweather', serif; }
                .personal-factors-table td { padding: 12px; border-bottom: 1px solid #eee; }

                .interactions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
                .interaction-box { background: #f9f9f9; padding: 15px; display: flex; gap: 15px; }
                .interaction-num { background: #eee; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: 'Merriweather', serif; }
                .interaction-content { font-size: 0.9rem; line-height: 1.4; }

                /* Management */
                .management-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 50px; }
                .management-header { font-family: 'Inter', sans-serif; border-top: 2px solid #ddd; padding-top: 10px; margin-bottom: 15px; font-size: 0.9rem; font-weight: bold; }
                .management-card { padding: 20px; font-size: 0.85rem; }
                .management-card h4 { font-size: 0.95rem; margin-top: 0; margin-bottom: 10px; }
                .management-card ul { padding-left: 20px; margin: 0; }
                .management-card li { margin-bottom: 6px; }
                .green-theme { background-color: #1b4d3e; color: white; }
                .green-theme h4 { color: white; }
                .grey-theme { background-color: #f3f1e9; color: #333; }

                .footer { border-top: 1px solid #eee; padding-top: 20px; font-size: 0.8rem; color: #888; text-align: center; }

                /* Dots */
                .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-left: 5px; }
                .dot.red { background: #d32f2f; }
                .dot.yellow { background: #fbc02d; }
                .dot.green { background: #388e3c; }
                .dot.orange { background: #e65100; }

                @media print {
                    .report-paper { padding: 20px; }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
});

export default ReportTemplate;
