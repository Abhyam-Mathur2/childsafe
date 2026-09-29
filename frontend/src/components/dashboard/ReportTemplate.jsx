import React, { forwardRef } from 'react';
import { AlertTriangle, CheckCircle, Info, Wind, Droplets, Volume2, Sprout, Radio, Sun, Home } from 'lucide-react';

// A section is only worth rendering as "deep-dive" content when it's real
// AI output, not the {fallback: true} stub generate_report substitutes
// when no OpenAI key is configured or a call fails.
const isReal = (section) => Boolean(section) && !section.fallback && !section.error;

// The AI is asked to return arrays for list fields, but LLM JSON output isn't
// 100% type-consistent - it occasionally returns a single string instead of
// a one-item array. Coerce defensively so `.map()` never crashes the report.
const asList = (val) => {
    if (Array.isArray(val)) return val;
    if (val === null || val === undefined || val === '') return [];
    return [val];
};

const ReportTemplate = forwardRef(({ report, user }, ref) => {
    if (!report) return null;

    const ai = report.ai_report || {};

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

            {isReal(ai.ai_executive_summary) && (
                <div className="ai-narrative-box">
                    <p className="ai-narrative-text">{ai.ai_executive_summary.overall_narrative}</p>
                    <div className="ai-narrative-grid">
                        <div className="ai-narrative-item priority-item">
                            <span className="ai-narrative-label">Immediate Priority</span>
                            <p>{ai.ai_executive_summary.immediate_priority}</p>
                        </div>
                        <div className="ai-narrative-item">
                            <span className="ai-narrative-label">Key Insight</span>
                            <p>{ai.ai_executive_summary.key_insight}</p>
                        </div>
                    </div>
                    {(ai.ai_executive_summary.protective_factors?.length > 0 || ai.ai_executive_summary.concern_factors?.length > 0) && (
                        <div className="ai-narrative-grid" style={{ marginTop: '18px' }}>
                            {ai.ai_executive_summary.protective_factors?.length > 0 && (
                                <div className="ai-narrative-item">
                                    <span className="ai-narrative-label" style={{ color: '#2e7d32' }}>Protective Factors</span>
                                    <ul>{asList(ai.ai_executive_summary.protective_factors).map((f, i) => <li key={i}>{f}</li>)}</ul>
                                </div>
                            )}
                            {ai.ai_executive_summary.concern_factors?.length > 0 && (
                                <div className="ai-narrative-item">
                                    <span className="ai-narrative-label" style={{ color: '#b71c1c' }}>Concern Factors</span>
                                    <ul>{asList(ai.ai_executive_summary.concern_factors).map((f, i) => <li key={i}>{f}</li>)}</ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

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

            {/* Section 1b: Environmental Deep-Dive (AI) */}
            {(isReal(ai.ai_air_quality_analysis) || isReal(ai.ai_water_quality_analysis) || isReal(ai.ai_soil_analysis) || isReal(ai.ai_noise_radiation) || isReal(ai.ai_climate_analysis) || isReal(ai.ai_indoor_air_quality)) && (
                <>
                    <h2 className="section-title">Section 1b: Environmental Deep-Dive</h2>

                    {isReal(ai.ai_air_quality_analysis) && (
                        <div className="deepdive-card">
                            <h3 className="deepdive-title"><Wind size={18} /> Air Quality — Full Analysis</h3>
                            <p className="deepdive-assessment">{ai.ai_air_quality_analysis.overall_assessment}</p>
                            {ai.ai_air_quality_analysis.pollutant_breakdown && (
                                <table className="pollutant-table">
                                    <thead>
                                        <tr><th>Pollutant</th><th>Reading</th><th>WHO Limit</th><th>Status</th><th>Impact on You</th></tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(ai.ai_air_quality_analysis.pollutant_breakdown).map(([key, p]) => (
                                            <tr key={key}>
                                                <td className="pollutant-name">{key.toUpperCase()}</td>
                                                <td>{p.reading}</td>
                                                <td>{p.who_limit}</td>
                                                <td><span className={`status-chip ${(p.status || '').toLowerCase().includes('above') ? 'status-bad' : 'status-ok'}`}>{p.status}</span></td>
                                                <td>{p.body_impact}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            <div className="deepdive-grid">
                                {ai.ai_air_quality_analysis.personal_inhaled_dose && (
                                    <div className="deepdive-item"><span className="deepdive-label">Your Inhaled Dose</span><p>{ai.ai_air_quality_analysis.personal_inhaled_dose}</p></div>
                                )}
                                {ai.ai_air_quality_analysis.peak_hours_warning && (
                                    <div className="deepdive-item"><span className="deepdive-label">Peak Hours</span><p>{ai.ai_air_quality_analysis.peak_hours_warning}</p></div>
                                )}
                                {ai.ai_air_quality_analysis.indoor_outdoor_split && (
                                    <div className="deepdive-item"><span className="deepdive-label">Indoor / Outdoor Balance</span><p>{ai.ai_air_quality_analysis.indoor_outdoor_split}</p></div>
                                )}
                                {ai.ai_air_quality_analysis.seasonal_trajectory && (
                                    <div className="deepdive-item"><span className="deepdive-label">Seasonal Trajectory</span><p>{ai.ai_air_quality_analysis.seasonal_trajectory}</p></div>
                                )}
                            </div>
                            {ai.ai_air_quality_analysis.condition_interactions?.length > 0 && (
                                <div className="deepdive-sublist">
                                    <span className="deepdive-label">Your Condition Interactions</span>
                                    <ul>{asList(ai.ai_air_quality_analysis.condition_interactions).map((c, i) => <li key={i}>{c}</li>)}</ul>
                                </div>
                            )}
                        </div>
                    )}

                    {isReal(ai.ai_water_quality_analysis) && (
                        <div className="deepdive-card">
                            <h3 className="deepdive-title"><Droplets size={18} /> Water Reliability &amp; Access — Full Analysis</h3>
                            <p className="deepdive-assessment">{ai.ai_water_quality_analysis.overall_assessment}</p>
                            <div className="deepdive-grid">
                                {ai.ai_water_quality_analysis.supply_reliability && (
                                    <div className="deepdive-item"><span className="deepdive-label">Supply Reliability</span><p>{ai.ai_water_quality_analysis.supply_reliability}</p></div>
                                )}
                                {ai.ai_water_quality_analysis.source_specific_context && (
                                    <div className="deepdive-item"><span className="deepdive-label">Source Context</span><p>{ai.ai_water_quality_analysis.source_specific_context}</p></div>
                                )}
                                {ai.ai_water_quality_analysis.groundwater_trend_note && (
                                    <div className="deepdive-item"><span className="deepdive-label">Groundwater Trend</span><p>{ai.ai_water_quality_analysis.groundwater_trend_note}</p></div>
                                )}
                                {ai.ai_water_quality_analysis.drought_preparedness && (
                                    <div className="deepdive-item"><span className="deepdive-label">Drought Preparedness</span><p>{ai.ai_water_quality_analysis.drought_preparedness}</p></div>
                                )}
                            </div>
                            {ai.ai_water_quality_analysis.filtration_recommendation && (
                                <div className="deepdive-callout"><strong>Filtration:</strong> {ai.ai_water_quality_analysis.filtration_recommendation}</div>
                            )}
                            {ai.ai_water_quality_analysis.condition_interactions?.length > 0 && (
                                <div className="deepdive-sublist">
                                    <span className="deepdive-label">Your Condition Interactions</span>
                                    <ul>{asList(ai.ai_water_quality_analysis.condition_interactions).map((c, i) => <li key={i}>{c}</li>)}</ul>
                                </div>
                            )}
                        </div>
                    )}

                    {isReal(ai.ai_soil_analysis) && (
                        <div className="deepdive-card">
                            <h3 className="deepdive-title"><Sprout size={18} /> Soil Safety — Full Analysis</h3>
                            <p className="deepdive-assessment">{ai.ai_soil_analysis.overall_assessment}</p>
                            <div className="deepdive-grid">
                                {ai.ai_soil_analysis.ph_heavy_metal_risk && (
                                    <div className="deepdive-item"><span className="deepdive-label">pH & Heavy Metal Risk</span><p>{ai.ai_soil_analysis.ph_heavy_metal_risk}</p></div>
                                )}
                                {ai.ai_soil_analysis.soil_type_specific_risks && (
                                    <div className="deepdive-item"><span className="deepdive-label">Soil Type Risks</span><p>{ai.ai_soil_analysis.soil_type_specific_risks}</p></div>
                                )}
                                {ai.ai_soil_analysis.dust_inhalation_link && (
                                    <div className="deepdive-item"><span className="deepdive-label">Dust Inhalation Link</span><p>{ai.ai_soil_analysis.dust_inhalation_link}</p></div>
                                )}
                                {ai.ai_soil_analysis.gardening_outdoor_safety && (
                                    <div className="deepdive-item"><span className="deepdive-label">Gardening Safety</span><p>{ai.ai_soil_analysis.gardening_outdoor_safety}</p></div>
                                )}
                                {ai.ai_soil_analysis.fertility_context && (
                                    <div className="deepdive-item"><span className="deepdive-label">Fertility &amp; Buffering Capacity</span><p>{ai.ai_soil_analysis.fertility_context}</p></div>
                                )}
                            </div>
                            {ai.ai_soil_analysis.exposure_pathways?.length > 0 && (
                                <div className="deepdive-sublist">
                                    <span className="deepdive-label">Your Exposure Pathways</span>
                                    <ul>{asList(ai.ai_soil_analysis.exposure_pathways).map((p, i) => <li key={i}>{p}</li>)}</ul>
                                </div>
                            )}
                            {ai.ai_soil_analysis.practical_remediation && (
                                <div className="deepdive-callout"><strong>Practical Remediation:</strong> {ai.ai_soil_analysis.practical_remediation}</div>
                            )}
                        </div>
                    )}

                    {isReal(ai.ai_noise_radiation) && (
                        <div className="deepdive-card">
                            <h3 className="deepdive-title"><Volume2 size={18} /> Noise, UV &amp; Radiation — Full Analysis</h3>
                            {ai.ai_noise_radiation.noise && (
                                <>
                                    <div className="deepdive-callout"><strong>Noise:</strong> {ai.ai_noise_radiation.noise.level_context}</div>
                                    <div className="deepdive-grid">
                                        {ai.ai_noise_radiation.noise.cardiovascular_impact && (
                                            <div className="deepdive-item"><span className="deepdive-label">Cardiovascular Impact</span><p>{ai.ai_noise_radiation.noise.cardiovascular_impact}</p></div>
                                        )}
                                        {ai.ai_noise_radiation.noise.sleep_disruption_risk && (
                                            <div className="deepdive-item"><span className="deepdive-label">Sleep Disruption Risk</span><p>{ai.ai_noise_radiation.noise.sleep_disruption_risk}</p></div>
                                        )}
                                        {ai.ai_noise_radiation.noise.cognitive_impact && (
                                            <div className="deepdive-item"><span className="deepdive-label">Cognitive Impact</span><p>{ai.ai_noise_radiation.noise.cognitive_impact}</p></div>
                                        )}
                                        {ai.ai_noise_radiation.noise.hearing_accumulation && (
                                            <div className="deepdive-item"><span className="deepdive-label">Hearing Accumulation Risk</span><p>{ai.ai_noise_radiation.noise.hearing_accumulation}</p></div>
                                        )}
                                    </div>
                                    {ai.ai_noise_radiation.noise.mitigation_steps?.length > 0 && (
                                        <div className="deepdive-sublist">
                                            <span className="deepdive-label">Noise Mitigation Steps</span>
                                            <ul>{asList(ai.ai_noise_radiation.noise.mitigation_steps).map((s, i) => <li key={i}>{s}</li>)}</ul>
                                        </div>
                                    )}
                                </>
                            )}
                            {ai.ai_noise_radiation.uv_radiation && (
                                <>
                                    <div className="deepdive-callout" style={{ marginTop: '15px' }}><strong>UV:</strong> {ai.ai_noise_radiation.uv_radiation.index_assessment}</div>
                                    <div className="deepdive-grid">
                                        {ai.ai_noise_radiation.uv_radiation.daily_dose_calculation && (
                                            <div className="deepdive-item"><span className="deepdive-label">Daily UV Dose</span><p>{ai.ai_noise_radiation.uv_radiation.daily_dose_calculation}</p></div>
                                        )}
                                        {ai.ai_noise_radiation.uv_radiation.skin_cancer_risk && (
                                            <div className="deepdive-item"><span className="deepdive-label">Skin Risk</span><p>{ai.ai_noise_radiation.uv_radiation.skin_cancer_risk}</p></div>
                                        )}
                                        {ai.ai_noise_radiation.uv_radiation.vitamin_d_balance && (
                                            <div className="deepdive-item"><span className="deepdive-label">Vitamin D Balance</span><p>{ai.ai_noise_radiation.uv_radiation.vitamin_d_balance}</p></div>
                                        )}
                                        {ai.ai_noise_radiation.uv_radiation.eye_risk && (
                                            <div className="deepdive-item"><span className="deepdive-label">Eye Risk</span><p>{ai.ai_noise_radiation.uv_radiation.eye_risk}</p></div>
                                        )}
                                    </div>
                                    {ai.ai_noise_radiation.uv_radiation.protection_protocol?.length > 0 && (
                                        <div className="deepdive-sublist">
                                            <span className="deepdive-label">Protection Protocol</span>
                                            <ul>{asList(ai.ai_noise_radiation.uv_radiation.protection_protocol).map((s, i) => <li key={i}>{s}</li>)}</ul>
                                        </div>
                                    )}
                                </>
                            )}
                            {ai.ai_noise_radiation.background_radiation && (
                                <div className="deepdive-callout" style={{ marginTop: '15px' }}>
                                    <strong>Background Radiation:</strong> {ai.ai_noise_radiation.background_radiation.level_context}
                                    {ai.ai_noise_radiation.background_radiation.annual_dose_estimate && (
                                        <> — {ai.ai_noise_radiation.background_radiation.annual_dose_estimate}</>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {isReal(ai.ai_climate_analysis) && (
                        <div className="deepdive-card">
                            <h3 className="deepdive-title"><Sun size={18} /> Weather &amp; Climate — Full Analysis</h3>
                            <p className="deepdive-assessment">{ai.ai_climate_analysis.overall_assessment}</p>
                            <div className="deepdive-grid">
                                {ai.ai_climate_analysis.heat_stress_risk && (
                                    <div className="deepdive-item"><span className="deepdive-label">Heat Stress Risk</span><p>{ai.ai_climate_analysis.heat_stress_risk}</p></div>
                                )}
                                {ai.ai_climate_analysis.humidity_mold_risk && (
                                    <div className="deepdive-item"><span className="deepdive-label">Humidity &amp; Mold Risk</span><p>{ai.ai_climate_analysis.humidity_mold_risk}</p></div>
                                )}
                                {ai.ai_climate_analysis.pressure_migraine_link && (
                                    <div className="deepdive-item"><span className="deepdive-label">Pressure Effects</span><p>{ai.ai_climate_analysis.pressure_migraine_link}</p></div>
                                )}
                                {ai.ai_climate_analysis.wind_dispersal_note && (
                                    <div className="deepdive-item"><span className="deepdive-label">Wind &amp; Pollutant Dispersal</span><p>{ai.ai_climate_analysis.wind_dispersal_note}</p></div>
                                )}
                            </div>
                            {ai.ai_climate_analysis.comfort_index && (
                                <div className="deepdive-callout"><strong>Outdoor Comfort Right Now:</strong> {ai.ai_climate_analysis.comfort_index}</div>
                            )}
                            {ai.ai_climate_analysis.condition_interactions?.length > 0 && (
                                <div className="deepdive-sublist">
                                    <span className="deepdive-label">Your Condition Interactions</span>
                                    <ul>{asList(ai.ai_climate_analysis.condition_interactions).map((c, i) => <li key={i}>{c}</li>)}</ul>
                                </div>
                            )}
                        </div>
                    )}

                    {isReal(ai.ai_indoor_air_quality) && (
                        <div className="deepdive-card">
                            <h3 className="deepdive-title"><Home size={18} /> Indoor Air Quality — Full Analysis</h3>
                            <p className="deepdive-assessment">{ai.ai_indoor_air_quality.overall_assessment}</p>
                            <div className="deepdive-grid">
                                {ai.ai_indoor_air_quality.cooking_pollutant_profile && (
                                    <div className="deepdive-item"><span className="deepdive-label">Cooking Pollutant Profile</span><p>{ai.ai_indoor_air_quality.cooking_pollutant_profile}</p></div>
                                )}
                                {ai.ai_indoor_air_quality.ventilation_recommendation && (
                                    <div className="deepdive-item"><span className="deepdive-label">Ventilation Recommendation</span><p>{ai.ai_indoor_air_quality.ventilation_recommendation}</p></div>
                                )}
                                {ai.ai_indoor_air_quality.indoor_vs_outdoor_comparison && (
                                    <div className="deepdive-item"><span className="deepdive-label">Indoor vs Outdoor</span><p>{ai.ai_indoor_air_quality.indoor_vs_outdoor_comparison}</p></div>
                                )}
                                {ai.ai_indoor_air_quality.mitigation_priority && (
                                    <div className="deepdive-item"><span className="deepdive-label">Mitigation Priority</span><p style={{ textTransform: 'uppercase', fontWeight: 700 }}>{ai.ai_indoor_air_quality.mitigation_priority}</p></div>
                                )}
                            </div>
                            {ai.ai_indoor_air_quality.condition_interactions?.length > 0 && (
                                <div className="deepdive-sublist">
                                    <span className="deepdive-label">Your Condition Interactions</span>
                                    <ul>{asList(ai.ai_indoor_air_quality.condition_interactions).map((c, i) => <li key={i}>{c}</li>)}</ul>
                                </div>
                            )}
                            {ai.ai_indoor_air_quality.upgrade_suggestion && (
                                <div className="deepdive-callout"><strong>Upgrade Path:</strong> {ai.ai_indoor_air_quality.upgrade_suggestion}</div>
                            )}
                        </div>
                    )}
                </>
            )}

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

            {/* Section 2b: Personal Vulnerability Deep-Dive (AI) */}
            {isReal(ai.ai_personal_vulnerability) && (
                <>
                    <h2 className="section-title">Section 2b: Personal Vulnerability Deep-Dive</h2>
                    <div className="deepdive-card">
                        <p className="deepdive-assessment">{ai.ai_personal_vulnerability.vulnerability_score_explanation}</p>

                        {ai.ai_personal_vulnerability.age_group_profile && (
                            <div className="deepdive-callout">
                                <strong>Age Group Profile:</strong> {ai.ai_personal_vulnerability.age_group_profile.developmental_or_degenerative_note}
                                {ai.ai_personal_vulnerability.age_group_profile.safe_aqi_threshold && (
                                    <> — Recommended AQI ceiling: {ai.ai_personal_vulnerability.age_group_profile.safe_aqi_threshold}</>
                                )}
                                {ai.ai_personal_vulnerability.age_group_profile.key_organs_at_risk?.length > 0 && (
                                    <div style={{ marginTop: '8px' }}>
                                        <strong>Organs at risk:</strong> {ai.ai_personal_vulnerability.age_group_profile.key_organs_at_risk.join(', ')}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="deepdive-grid" style={{ marginTop: '18px' }}>
                            {ai.ai_personal_vulnerability.smoking_multiplier_analysis && (
                                <div className="deepdive-item"><span className="deepdive-label">Smoking Multiplier</span><p>{ai.ai_personal_vulnerability.smoking_multiplier_analysis}</p></div>
                            )}
                            {ai.ai_personal_vulnerability.stress_immune_link && (
                                <div className="deepdive-item"><span className="deepdive-label">Stress &amp; Immune Response</span><p>{ai.ai_personal_vulnerability.stress_immune_link}</p></div>
                            )}
                            {ai.ai_personal_vulnerability.diet_detox_capacity && (
                                <div className="deepdive-item"><span className="deepdive-label">Diet &amp; Detox Capacity</span><p>{ai.ai_personal_vulnerability.diet_detox_capacity}</p></div>
                            )}
                            {ai.ai_personal_vulnerability.sleep_pollution_recovery && (
                                <div className="deepdive-item"><span className="deepdive-label">Sleep &amp; Recovery</span><p>{ai.ai_personal_vulnerability.sleep_pollution_recovery}</p></div>
                            )}
                            {ai.ai_personal_vulnerability.chronic_exposure_burden && (
                                <div className="deepdive-item"><span className="deepdive-label">Chronic Exposure Burden</span><p>{ai.ai_personal_vulnerability.chronic_exposure_burden}</p></div>
                            )}
                        </div>

                        {ai.ai_personal_vulnerability.activity_exposure_math && (
                            <div className="exposure-math-box">
                                <span className="deepdive-label">Your Activity × Exposure Math</span>
                                <div className="exposure-math-grid">
                                    <div><strong>{ai.ai_personal_vulnerability.activity_exposure_math.daily_outdoor_minutes}</strong><span>min/day outdoors</span></div>
                                    <div><strong>{ai.ai_personal_vulnerability.activity_exposure_math.extra_air_volume_vs_sedentary}</strong><span>extra air vs sedentary</span></div>
                                    <div><strong>{ai.ai_personal_vulnerability.activity_exposure_math.optimal_exercise_window}</strong><span>optimal window</span></div>
                                </div>
                                {ai.ai_personal_vulnerability.activity_exposure_math.weekly_cumulative_impact && (
                                    <p style={{ marginTop: '10px' }}>{ai.ai_personal_vulnerability.activity_exposure_math.weekly_cumulative_impact}</p>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Section 2c: Medical Conditions & Environmental Interaction (AI) */}
            {isReal(ai.ai_medical_conditions) && (
                <>
                    <h2 className="section-title">Section 2c: Medical Conditions &amp; Environmental Interaction</h2>
                    <div className="deepdive-card">
                        <p className="deepdive-assessment">{ai.ai_medical_conditions.profile_summary}</p>

                        {ai.ai_medical_conditions.condition_analyses?.map((c, idx) => (
                            <div className="condition-analysis-card" key={idx}>
                                <div className="condition-analysis-name">{c.condition}</div>
                                {c.specific_pollutant_triggers && <p><strong>Triggers:</strong> {c.specific_pollutant_triggers}</p>}
                                {c.current_risk_level && <p><strong>Current Risk:</strong> {c.current_risk_level}</p>}
                                {c.early_warning_signs?.length > 0 && (
                                    <p><strong>Watch for:</strong> {c.early_warning_signs.join(', ')}</p>
                                )}
                                {c.targeted_actions?.length > 0 && (
                                    <ul>{c.targeted_actions.map((a, i) => <li key={i}>{a}</li>)}</ul>
                                )}
                                {c.medication_environment_interactions && (
                                    <p className="condition-med-note"><strong>Medication note:</strong> {c.medication_environment_interactions}</p>
                                )}
                            </div>
                        ))}

                        {ai.ai_medical_conditions.synergistic_compound_risks?.length > 0 && (
                            <div className="deepdive-callout deepdive-callout-warning">
                                <strong>Compounding Risks:</strong>
                                <ul>{asList(ai.ai_medical_conditions.synergistic_compound_risks).map((r, i) => <li key={i}>{r}</li>)}</ul>
                            </div>
                        )}
                        {ai.ai_medical_conditions.priority_screenings && (
                            <div className="deepdive-callout"><strong>Priority Screenings:</strong> {ai.ai_medical_conditions.priority_screenings}</div>
                        )}
                    </div>
                </>
            )}

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

            {isReal(ai.ai_mental_health) && (
                <div className="deepdive-card">
                    <p className="deepdive-assessment">{ai.ai_mental_health.pollution_mental_health_link}</p>
                    <div className="deepdive-grid">
                        {ai.ai_mental_health.stress_pollution_cycle && (
                            <div className="deepdive-item"><span className="deepdive-label">Stress-Pollution Cycle</span><p>{ai.ai_mental_health.stress_pollution_cycle}</p></div>
                        )}
                        {ai.ai_mental_health.cognitive_environmental_impact && (
                            <div className="deepdive-item"><span className="deepdive-label">Cognitive Impact</span><p>{ai.ai_mental_health.cognitive_environmental_impact}</p></div>
                        )}
                        {ai.ai_mental_health.sleep_mental_resilience && (
                            <div className="deepdive-item"><span className="deepdive-label">Sleep &amp; Resilience</span><p>{ai.ai_mental_health.sleep_mental_resilience}</p></div>
                        )}
                    </div>
                    {ai.ai_mental_health.condition_environment_analysis?.length > 0 && (
                        <div className="deepdive-sublist">
                            <span className="deepdive-label">Your Condition-Environment Analysis</span>
                            <ul>{asList(ai.ai_mental_health.condition_environment_analysis).map((c, i) => <li key={i}>{c}</li>)}</ul>
                        </div>
                    )}
                    {ai.ai_mental_health.protective_strategies?.length > 0 && (
                        <div className="deepdive-sublist">
                            <span className="deepdive-label">Protective Strategies</span>
                            <ul>{asList(ai.ai_mental_health.protective_strategies).map((s, i) => <li key={i}>{s}</li>)}</ul>
                        </div>
                    )}
                </div>
            )}

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

            {/* Section 5b: Children & Family Protection (AI) */}
            {isReal(ai.ai_children_family) && (
                <>
                    <h2 className="section-title">Section 5b: Children &amp; Family Protection</h2>
                    <div className="deepdive-card">
                        <p className="deepdive-assessment">{ai.ai_children_family.child_vulnerability_science}</p>

                        {ai.ai_children_family.age_band_thresholds && (
                            <table className="pollutant-table">
                                <thead><tr><th>Age Band</th><th>Safe AQI</th><th>Key Risk</th></tr></thead>
                                <tbody>
                                    {Object.entries(ai.ai_children_family.age_band_thresholds).map(([band, info]) => (
                                        <tr key={band}>
                                            <td className="pollutant-name">{band.replace(/_/g, ' ')}</td>
                                            <td>{info.safe_aqi}</td>
                                            <td>{info.key_risk}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <div className="deepdive-grid" style={{ marginTop: '15px' }}>
                            {ai.ai_children_family.safe_outdoor_windows && (
                                <div className="deepdive-item"><span className="deepdive-label">Safe Outdoor Windows</span><p>{ai.ai_children_family.safe_outdoor_windows}</p></div>
                            )}
                            {ai.ai_children_family.school_sports_guidance && (
                                <div className="deepdive-item"><span className="deepdive-label">School &amp; Sports Guidance</span><p>{ai.ai_children_family.school_sports_guidance}</p></div>
                            )}
                            {ai.ai_children_family.pregnancy_or_infant_note && (
                                <div className="deepdive-item"><span className="deepdive-label">Pregnancy / Infant Note</span><p>{ai.ai_children_family.pregnancy_or_infant_note}</p></div>
                            )}
                        </div>

                        {ai.ai_children_family.home_clean_air_zone?.length > 0 && (
                            <div className="deepdive-sublist">
                                <span className="deepdive-label">Home Clean-Air Zone Checklist</span>
                                <ul>{asList(ai.ai_children_family.home_clean_air_zone).map((s, i) => <li key={i}>{s}</li>)}</ul>
                            </div>
                        )}
                        {ai.ai_children_family.developmental_health_markers?.length > 0 && (
                            <div className="deepdive-sublist">
                                <span className="deepdive-label">Developmental Markers to Monitor</span>
                                <ul>{asList(ai.ai_children_family.developmental_health_markers).map((m, i) => <li key={i}>{m}</li>)}</ul>
                            </div>
                        )}
                    </div>
                </>
            )}

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
            {isReal(ai.ai_seasonal_daily_guide) ? (
                (() => {
                    const cs = ai.ai_seasonal_daily_guide.current_season || {};
                    return (
                        <div className="seasonal-section">
                            <div className="season-header-display">
                                <span className="season-icon">
                                    {cs.name === 'Winter' ? '❄️' : cs.name === 'Spring' ? '🌸' : cs.name === 'Summer' ? '☀️' : '🍂'}
                                </span>
                                <span className="season-name">{cs.name || 'Current Season'}</span>
                            </div>
                            <div className="deepdive-grid">
                                {cs.location_specific_risks && (
                                    <div className="deepdive-item"><span className="deepdive-label">Location-Specific Risks</span><p>{cs.location_specific_risks}</p></div>
                                )}
                                {cs.pollutant_seasonal_shifts && (
                                    <div className="deepdive-item"><span className="deepdive-label">Pollutant Shifts</span><p>{cs.pollutant_seasonal_shifts}</p></div>
                                )}
                                {cs.condition_season_impact && (
                                    <div className="deepdive-item"><span className="deepdive-label">Impact on Your Conditions</span><p>{cs.condition_season_impact}</p></div>
                                )}
                                {ai.ai_seasonal_daily_guide.next_season_prep && (
                                    <div className="deepdive-item"><span className="deepdive-label">Next Season Prep</span><p>{ai.ai_seasonal_daily_guide.next_season_prep}</p></div>
                                )}
                            </div>
                            {cs.action_items?.length > 0 && (
                                <div className="seasonal-card tips-card" style={{ marginTop: '18px' }}>
                                    <h4>This Season's Action Items</h4>
                                    <ul>{cs.action_items.map((a, i) => <li key={i}>{a}</li>)}</ul>
                                </div>
                            )}
                            {ai.ai_seasonal_daily_guide.annual_health_calendar && (
                                <table className="pollutant-table" style={{ marginTop: '20px' }}>
                                    <thead><tr><th>Period</th><th>Key Risks &amp; Priority Actions</th></tr></thead>
                                    <tbody>
                                        {Object.entries(ai.ai_seasonal_daily_guide.annual_health_calendar).map(([period, info]) => (
                                            <tr key={period}>
                                                <td className="pollutant-name">{period.replace(/_/g, '-')}</td>
                                                <td>{info}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    );
                })()
            ) : (
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
            )}

            {/* Section 10: Daily Pattern Suggestion */}
            <h2 className="section-title">Section 10: Daily Pattern Suggestion</h2>
            {report.daily_pattern_suggestion?.early_morning_5_to_8 ? (
                <div className="daily-pattern-grid four-slot">
                    {[
                        { period: 'Early Morning', time: '5 – 8 AM', icon: '🌄', key: 'early_morning_5_to_8' },
                        { period: 'Morning', time: '8 AM – 12 PM', icon: '🌅', key: 'morning_8_to_12' },
                        { period: 'Afternoon', time: '12 – 5 PM', icon: '☀️', key: 'afternoon_12_to_5' },
                        { period: 'Evening', time: '5 – 10 PM', icon: '🌙', key: 'evening_5_to_10' },
                    ].map((slot) => {
                        const info = report.daily_pattern_suggestion[slot.key] || {};
                        const isWarning = (info.avoid || '').length > 0;
                        return (
                            <div key={slot.key} className={`daily-pattern-card ${isWarning ? 'pattern-caution' : 'pattern-safe'}`}>
                                <div className="pattern-icon">{slot.icon}</div>
                                <div className="pattern-period">{slot.period}</div>
                                <div className="pattern-time">{slot.time}</div>
                                {info.aqi_pattern && <div className="pattern-aqi">AQI: {info.aqi_pattern}</div>}
                                {info.recommended && <div className="pattern-suggestion"><strong>Do:</strong> {info.recommended}</div>}
                                {info.avoid && <div className="pattern-suggestion pattern-avoid"><strong>Avoid:</strong> {info.avoid}</div>}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="daily-pattern-grid">
                    {[
                        { period: 'Morning', time: '6 AM – 12 PM', icon: '🌅', key: 'morning' },
                        { period: 'Afternoon', time: '12 PM – 5 PM', icon: '☀️', key: 'afternoon' },
                        { period: 'Evening', time: '5 PM – 10 PM', icon: '🌙', key: 'evening' },
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
            )}

            {/* Section 11: Health Professional Discussion Guide */}
            <h2 className="section-title">Section 11: Health Professional Discussion Guide</h2>
            <div className="professional-guide">
                <div className="guide-header">
                    <strong>📋 Take this to your next doctor's appointment</strong>
                </div>
                {isReal(ai.ai_doctor_guide) && ai.ai_doctor_guide.why_share && (
                    <p className="guide-why-share">{ai.ai_doctor_guide.why_share}</p>
                )}
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

                {isReal(ai.ai_doctor_guide) && (
                    <>
                        {ai.ai_doctor_guide.red_flag_symptoms?.length > 0 && (
                            <div className="deepdive-callout deepdive-callout-warning" style={{ marginTop: '20px' }}>
                                <strong>Watch for these red-flag symptoms:</strong>
                                <ul>{asList(ai.ai_doctor_guide.red_flag_symptoms).map((s, i) => <li key={i}>{s}</li>)}</ul>
                            </div>
                        )}
                        <div className="deepdive-grid" style={{ marginTop: '18px' }}>
                            {ai.ai_doctor_guide.specialist_referrals?.length > 0 && (
                                <div className="deepdive-item">
                                    <span className="deepdive-label">Specialist Referrals to Discuss</span>
                                    <ul>{asList(ai.ai_doctor_guide.specialist_referrals).map((r, i) => <li key={i}><strong>{r.specialist}</strong> ({r.urgency}) — {r.reason}</li>)}</ul>
                                </div>
                            )}
                            {ai.ai_doctor_guide.tests_to_request?.length > 0 && (
                                <div className="deepdive-item">
                                    <span className="deepdive-label">Tests to Request</span>
                                    <ul>{asList(ai.ai_doctor_guide.tests_to_request).map((t, i) => <li key={i}><strong>{t.test}</strong> ({t.frequency}) — {t.reason}</li>)}</ul>
                                </div>
                            )}
                        </div>
                        {ai.ai_doctor_guide.key_data_to_share?.length > 0 && (
                            <div className="deepdive-sublist">
                                <span className="deepdive-label">Key Numbers to Bring</span>
                                <ul>{asList(ai.ai_doctor_guide.key_data_to_share).map((d, i) => <li key={i}>{d}</li>)}</ul>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Section 12: Support & Resources */}
            <h2 className="section-title">Section 12: Support &amp; Resources</h2>

            {report.emergency_contacts && (
                <div className={`emergency-box ${report.emergency_contacts.is_specific ? '' : 'emergency-box-unverified'}`}>
                    <div className="emergency-header">
                        <AlertTriangle size={20} />
                        <strong>In a health emergency{report.emergency_contacts.country_name ? ` in ${report.emergency_contacts.country_name}` : ''}</strong>
                    </div>
                    {report.emergency_contacts.is_specific ? (
                        <div className="emergency-grid">
                            {report.emergency_contacts.emergency && (
                                <div className="emergency-item"><span className="emergency-label">Emergency</span><span className="emergency-number">{report.emergency_contacts.emergency}</span></div>
                            )}
                            {report.emergency_contacts.ambulance && (
                                <div className="emergency-item"><span className="emergency-label">Ambulance</span><span className="emergency-number">{report.emergency_contacts.ambulance}</span></div>
                            )}
                            {report.emergency_contacts.poison_control && (
                                <div className="emergency-item"><span className="emergency-label">Poison Control</span><span className="emergency-number">{report.emergency_contacts.poison_control}</span></div>
                            )}
                            {report.emergency_contacts.non_emergency_health && (
                                <div className="emergency-item"><span className="emergency-label">Health Helpline</span><span className="emergency-number">{report.emergency_contacts.non_emergency_health}</span></div>
                            )}
                        </div>
                    ) : (
                        <p className="emergency-fallback-note">{report.emergency_contacts.note}</p>
                    )}
                    {report.emergency_contacts.is_specific && report.emergency_contacts.note && (
                        <p className="emergency-fallback-note">{report.emergency_contacts.note}</p>
                    )}
                </div>
            )}

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

            {isReal(ai.ai_action_plan) && (
                <>
                    <div className="subtitle" style={{ marginTop: '30px' }}>Personalized Action Detail:</div>
                    <div className="action-plan-grid">
                        <div className="action-plan-col">
                            <div className="management-header">This Week</div>
                            <div className="management-card green-theme">
                                {ai.ai_action_plan.this_week?.exercise_guidance && (
                                    <p style={{ marginBottom: '12px' }}><strong>Exercise:</strong> {ai.ai_action_plan.this_week.exercise_guidance}</p>
                                )}
                                {ai.ai_action_plan.this_week?.nutrition_protocol?.length > 0 && (
                                    <>
                                        <h4>Nutrition Protocol</h4>
                                        <ul>{asList(ai.ai_action_plan.this_week.nutrition_protocol).map((n, i) => <li key={i}>{n}</li>)}</ul>
                                    </>
                                )}
                                {ai.ai_action_plan.this_week?.daily_monitoring?.length > 0 && (
                                    <>
                                        <h4>Daily Monitoring</h4>
                                        <ul>{asList(ai.ai_action_plan.this_week.daily_monitoring).map((n, i) => <li key={i}>{n}</li>)}</ul>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="action-plan-col">
                            <div className="management-header">This Month</div>
                            <div className="management-card grey-theme">
                                {ai.ai_action_plan.this_month?.medical_appointments?.length > 0 && (
                                    <>
                                        <h4>Medical Appointments</h4>
                                        <ul>{asList(ai.ai_action_plan.this_month.medical_appointments).map((a, i) => <li key={i}><strong>{a.specialist}</strong> ({a.urgency}) — {a.reason}</li>)}</ul>
                                    </>
                                )}
                                {ai.ai_action_plan.this_month?.testing_to_do?.length > 0 && (
                                    <>
                                        <h4>Testing To Do</h4>
                                        <ul>{asList(ai.ai_action_plan.this_month.testing_to_do).map((t, i) => <li key={i}>{t}</li>)}</ul>
                                    </>
                                )}
                                {ai.ai_action_plan.this_month?.behavioral_shifts?.length > 0 && (
                                    <>
                                        <h4>Behavioral Shifts</h4>
                                        <ul>{asList(ai.ai_action_plan.this_month.behavioral_shifts).map((b, i) => <li key={i}>{b}</li>)}</ul>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="action-plan-col">
                            <div className="management-header">This Year</div>
                            <div className="management-card grey-theme">
                                {ai.ai_action_plan.this_year?.infrastructure_investments?.length > 0 && (
                                    <>
                                        <h4>Infrastructure Investments</h4>
                                        <ul>{asList(ai.ai_action_plan.this_year.infrastructure_investments).map((inv, i) => <li key={i}><strong>{inv.item}</strong> ({inv.approx_cost_inr}) — {inv.reason}</li>)}</ul>
                                    </>
                                )}
                                {ai.ai_action_plan.this_year?.annual_screenings?.length > 0 && (
                                    <>
                                        <h4>Annual Screenings</h4>
                                        <ul>{asList(ai.ai_action_plan.this_year.annual_screenings).map((s, i) => <li key={i}>{s}</li>)}</ul>
                                    </>
                                )}
                                {ai.ai_action_plan.this_year?.cumulative_health_tracking && (
                                    <p style={{ marginTop: '12px' }}>{ai.ai_action_plan.this_year.cumulative_health_tracking}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

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

                /* AI Deep-Dive (executive summary narrative, air/water/soil/vulnerability/
                   medical/noise/mental/children sections powered by ai_report) */
                .ai-narrative-box { background: #f0f7f4; border: 1px solid #d7e9e1; border-left: 6px solid #1b4d3e; border-radius: 8px; padding: 28px; margin-bottom: 40px; }
                .ai-narrative-text { font-size: 1.05rem; line-height: 1.7; color: #1a1a1a; margin: 0 0 18px 0; font-weight: 500; }
                .ai-narrative-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
                .ai-narrative-item { background: #fff; border-radius: 6px; padding: 16px 18px; border: 1px solid #e0ddd0; }
                .ai-narrative-item.priority-item { background: #fff8e1; border-color: #ffe082; }
                .ai-narrative-item p { margin: 0; font-size: 0.9rem; line-height: 1.5; color: #333; }
                .ai-narrative-item ul { margin: 0; padding-left: 18px; font-size: 0.9rem; line-height: 1.6; color: #333; }
                .ai-narrative-label { display: block; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #1b4d3e; margin-bottom: 8px; }

                .deepdive-card { background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 30px; margin-bottom: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); page-break-inside: avoid; }
                .deepdive-title { display: flex; align-items: center; gap: 10px; font-size: 1.25rem; margin: 0 0 15px 0; }
                .deepdive-assessment { font-size: 0.98rem; line-height: 1.65; color: #222; margin: 0 0 20px 0; }
                .deepdive-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
                .deepdive-item { background: #fafaf8; border: 1px solid #eee; border-radius: 6px; padding: 15px 18px; }
                .deepdive-item p { margin: 0; font-size: 0.88rem; line-height: 1.55; color: #333; }
                .deepdive-label { display: block; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #1b4d3e; margin-bottom: 6px; }
                .deepdive-sublist { margin-top: 20px; }
                .deepdive-sublist ul { margin: 8px 0 0 0; padding-left: 20px; font-size: 0.9rem; line-height: 1.6; color: #333; }
                .deepdive-callout { background: #f3f1e9; border-left: 4px solid #1b4d3e; border-radius: 4px; padding: 14px 18px; margin-top: 18px; font-size: 0.9rem; line-height: 1.6; color: #333; }
                .deepdive-callout-warning { background: #fff5f5; border-left-color: #b71c1c; }
                .deepdive-callout-warning ul { margin: 8px 0 0 0; padding-left: 20px; }

                .pollutant-table { width: 100%; border-collapse: collapse; margin: 10px 0 20px 0; font-size: 0.85rem; }
                .pollutant-table th { text-align: left; background: #f8f9fa; padding: 10px 12px; border-bottom: 2px solid #eee; font-weight: 700; }
                .pollutant-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
                .pollutant-name { font-weight: 800; color: #1b4d3e; white-space: nowrap; text-transform: capitalize; }
                .status-chip { padding: 3px 10px; border-radius: 10px; font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
                .status-chip.status-bad { background: #ffebee; color: #b71c1c; }
                .status-chip.status-ok { background: #e8f5e9; color: #2e7d32; }

                .condition-analysis-card { background: #fffcf9; border-left: 6px solid #e65100; border-radius: 4px; padding: 20px; margin-top: 15px; font-size: 0.9rem; line-height: 1.6; color: #333; }
                .condition-analysis-name { font-weight: 800; font-size: 1rem; color: #e65100; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
                .condition-analysis-card ul { margin: 10px 0; padding-left: 20px; }
                .condition-med-note { font-size: 0.85rem; color: #666; margin-top: 10px; }

                .exposure-math-box { background: #f0f7f4; border-radius: 8px; padding: 20px; margin-top: 18px; }
                .exposure-math-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 10px; }
                .exposure-math-grid > div { text-align: center; background: #fff; border-radius: 6px; padding: 14px; border: 1px solid #e0ddd0; }
                .exposure-math-grid strong { display: block; font-size: 1rem; color: #1b4d3e; margin-bottom: 4px; }
                .exposure-math-grid span { font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.3px; }

                .daily-pattern-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 50px; }
                .daily-pattern-grid.four-slot { grid-template-columns: repeat(4, 1fr); }
                .daily-pattern-card { border-radius: 8px; padding: 20px; border: 2px solid; }
                .daily-pattern-card.pattern-safe { background: #f1f8f1; border-color: #a5d6a7; }
                .daily-pattern-card.pattern-caution { background: #fff8e1; border-color: #ffe082; }
                .pattern-icon { font-size: 1.6rem; margin-bottom: 8px; }
                .pattern-period { font-weight: 800; font-size: 0.95rem; color: #1b4d3e; }
                .pattern-time { font-size: 0.75rem; color: #666; margin-bottom: 10px; }
                .pattern-suggestion { font-size: 0.85rem; line-height: 1.5; color: #333; }
                .pattern-aqi { font-size: 0.75rem; font-weight: 700; color: #1b4d3e; margin-bottom: 6px; }
                .pattern-suggestion.pattern-avoid { color: #b71c1c; margin-top: 6px; }

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
                /* Emergency contacts (verified, non-AI lookup) */
                .emergency-box { background: #fff5f5; border: 2px solid #ffcdd2; border-left: 6px solid #b71c1c; border-radius: 8px; padding: 24px 28px; margin-bottom: 30px; }
                .emergency-box.emergency-box-unverified { background: #f8f9fa; border-color: #e0e0e0; border-left-color: #999; }
                .emergency-header { display: flex; align-items: center; gap: 10px; color: #b71c1c; margin-bottom: 16px; font-size: 1.05rem; }
                .emergency-box-unverified .emergency-header { color: #666; }
                .emergency-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
                .emergency-item { background: #fff; border-radius: 6px; padding: 12px 16px; text-align: center; border: 1px solid #ffcdd2; }
                .emergency-label { display: block; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px; }
                .emergency-number { display: block; font-size: 1.3rem; font-weight: 800; color: #b71c1c; }
                .emergency-fallback-note { font-size: 0.85rem; color: #666; margin: 12px 0 0 0; line-height: 1.5; }

                /* Seasonal awareness (previously unstyled) */
                .seasonal-section { background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 30px; margin-bottom: 50px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
                .season-header-display { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; }
                .season-icon { font-size: 2.2rem; }
                .season-name { font-family: 'Merriweather', serif; font-size: 1.4rem; font-weight: 700; color: #1b4d3e; }
                .seasonal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
                .seasonal-card { background: #fafaf8; border: 1px solid #eee; border-radius: 6px; padding: 20px; }
                .seasonal-card h4 { margin: 0 0 12px 0; font-size: 0.95rem; }
                .seasonal-card ul { margin: 0; padding-left: 18px; font-size: 0.9rem; line-height: 1.6; color: #333; }
                .seasonal-card.risk-card { border-left: 4px solid #fbc02d; }
                .seasonal-card.tips-card { border-left: 4px solid #1b4d3e; }

                /* Doctor discussion guide (previously unstyled) */
                .professional-guide { background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 30px; margin-bottom: 50px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
                .guide-header { font-size: 1.05rem; color: #1b4d3e; margin-bottom: 10px; }
                .guide-why-share { font-size: 0.9rem; color: #555; font-style: italic; margin: 0 0 18px 0; }
                .guide-checklist { display: flex; flex-direction: column; gap: 10px; }
                .checklist-item { display: flex; align-items: start; gap: 10px; font-size: 0.92rem; line-height: 1.5; color: #333; }
                .checkbox-char { font-size: 1.1rem; color: #1b4d3e; flex-shrink: 0; }

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
                    .exposure-card, .management-card, .interaction-box, .water-uv-card, .mental-condition-card, .timeline-col, .resource-card, .summary-left, .summary-right, tr {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    /* CSS Grid containers can overlap/split unpredictably across a print page
                       break in Chromium. Keeping each grid intact (moved whole to the next
                       page when it doesn't fit) avoids that rather than letting rows split. */
                    .summary-container, .exposure-grid, .interactions-grid, .ai-narrative-grid,
                    .deepdive-grid, .exposure-math-grid, .daily-pattern-grid, .management-grid,
                    .action-plan-grid, .guidance-grid, .emergency-grid, .seasonal-grid,
                    .resources-grid, .water-uv-grid, .mental-conditions-grid, .timeline-grid,
                    .resource-cards-grid {
                        page-break-inside: avoid;
                        break-inside: avoid;
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
