import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Download, Loader, Share2, Lock, CreditCard, AlertCircle, X, CheckCircle, Printer } from 'lucide-react';
import ReportTemplate from '../components/dashboard/ReportTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';

const ReportPage = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifyingPayment, setVerifyingPayment] = useState(false);
    const [error, setError] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
        buyerEmail: '',
        buyerPhone: '',
        buyerFirstName: '',
        buyerLastName: '',
        buyerAddress: '',
        buyerCity: '',
        buyerState: '',
        buyerCountry: 'India',
        buyerPinCode: ''
    });

    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const printRef = useRef();

    useEffect(() => {
        // Update payment details with user info when available
        if (user) {
            setPaymentDetails(prev => ({
                ...prev,
                buyerEmail: user.email || '',
                buyerFirstName: user.username || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('payment') === 'success') {
            alert("Payment successful! Your report is now unlocked.");
            // Refresh report to show paid status
            fetchReport();
        } else if (queryParams.get('payment') === 'failed') {
            alert("Payment failed. Please try again.");
        }
    }, [location]);

    const fetchReport = async () => {
        const lifestyleId = localStorage.getItem('lifestyleId');
        if (!lifestyleId) {
            setError("complete the assesment first");
            setLoading(false);
            return;
        }

        if (!navigator.geolocation) {
            setError("Geolocation needed for report.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;

            try {
                const response = await api.post('/health-report', {
                    latitude,
                    longitude,
                    lifestyle_data_id: parseInt(lifestyleId)
                });

                setReport(response.data);
            } catch (err) {
                console.error("Report generation failed", err);
                setError("complete the assesment first");
            } finally {
                setLoading(false);
            }
        }, (err) => {
            setError("Location access denied.");
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchReport();
    }, [navigate]);

    const handleAirpayPayment = async (e) => {
        e.preventDefault();
        try {
            // Get signed Airpay payload from backend.
            const res = await api.post('/create-airpay-order', {
                report_id: report.report_id,
                ...paymentDetails
            });

            const data = res.data || {};
            const transactionId = data.transaction_id;
            if (transactionId) {
                localStorage.setItem('lastAirpayTransactionId', transactionId);
                localStorage.setItem('lastAirpayReportId', String(report.report_id));
                console.info('Airpay transaction id:', transactionId);
            }

            if (data.is_bypassed) {
                alert("Welcome back! Your report has been automatically unlocked.");
                fetchReport();
                setShowPaymentModal(false);
                return;
            }

            if (!data.post_url || !data.form_fields) {
                throw new Error('Invalid payment initiation response from server.');
            }

            // Stable payment redirect: top-level form POST directly to Airpay.
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = data.post_url;
            form.style.display = 'none';

            Object.entries(data.form_fields).forEach(([key, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value == null ? '' : String(value);
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();

        } catch (err) {
            console.error("Payment initiation failed", err);
            const detailObj = err?.response?.data?.detail;
            const txFromServer = err?.response?.data?.transaction_id || detailObj?.transaction_id;
            const txFromStorage = localStorage.getItem('lastAirpayTransactionId');
            const txId = txFromServer || txFromStorage;

            const backendMessage = typeof detailObj === 'string'
                ? detailObj
                : detailObj?.message || err?.response?.data?.message;
            const domainsTried = Array.isArray(detailObj?.domains_tried)
                ? ` Domains tried: ${detailObj.domains_tried.join(', ')}`
                : '';

            if (backendMessage && txId) {
                alert(`Failed to start payment process. ${backendMessage}${domainsTried} Transaction ID: ${txId}. Please share this ID with support.`);
            } else if (backendMessage) {
                alert(`Failed to start payment process. ${backendMessage}${domainsTried}`);
            } else if (txId) {
                alert(`Failed to start payment process. Transaction ID: ${txId}. Please share this ID with support.`);
            } else {
                alert("Failed to start payment process. Please try again.");
            }
        }
    };

    const handlePrint = () => {
        if (!report.is_paid && user?.email !== 'abhyammath78@gmail.com') {
            alert("Please unlock the full report to print.");
            return;
        }
        window.print();
    };

    const handleDownloadPdf = async () => {
        if (!report.is_paid && user?.email !== 'abhyammath78@gmail.com') {
            alert("Please unlock the full report to download PDF.");
            return;
        }
        const element = printRef.current;
        if (!element) return;

        // Visual feedback
        const btn = document.activeElement;
        const originalText = btn.innerHTML;
        btn.innerHTML = "Generating...";
        btn.disabled = true;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: 794, // A4 width at 96 DPI
            });
            const imgData = canvas.toDataURL('image/png', 1.0);

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            // First page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pdfHeight;

            // Add new pages if the content is longer than one page
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
                heightLeft -= pdfHeight;
            }

            pdf.save(`Childsafeenvirons_Report_${report.report_id}.pdf`);
        } catch (err) {
            console.error("PDF generation failed", err);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    };

    if (loading || verifyingPayment) return (
        <div className="min-h-screen relative z-10 flex flex-col justify-center items-center gap-4 text-white">
            <Loader className="animate-spin text-emerald-400" size={40} />
            <p className="text-emerald-100/70 font-medium">
                {verifyingPayment ? 'Verifying secure payment...' : 'Generating your comprehensive health report...'}
            </p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen relative z-10 pt-24 px-4 flex justify-center text-white">
            <div className="bg-red-900/30 backdrop-blur-md border border-red-500/50 p-6 rounded-2xl max-w-lg w-full h-fit flex gap-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <AlertCircle className="text-red-400 shrink-0" />
                <div>
                    <h3 className="font-bold text-red-200">
                        {error === "complete the assesment first" ? "Incomplete Assessment" : "Unable to Load Report"}
                    </h3>
                    <p className="text-red-100/70 mt-1">{error}</p>
                    <button 
                        onClick={() => error === "complete the assesment first" ? navigate('/assessment') : window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-red-500/20 text-red-100 rounded-lg hover:bg-red-500/40 transition-colors font-semibold text-sm border border-red-500/30"
                    >
                        {error === "complete the assesment first" ? "Go to Assessment" : "Try Again"}
                    </button>
                </div>
            </div>
        </div>
    );

    if (!report) return null;

    return (
        <div className="min-h-screen relative z-10 text-white pt-24 pb-12 px-4">
            {/* Toolbar */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center no-print">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">C</div>
                    <div className="hidden sm:block">
                        <h1 className="text-lg font-bold leading-none">Childsafeenvirons</h1>
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Environmental</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        disabled={!report.is_paid && user?.email !== 'abhyammath78@gmail.com'}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${(report.is_paid || user?.email === 'abhyammath78@gmail.com')
                            ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/30'
                            : 'bg-white/10 text-white/50 cursor-not-allowed border border-white/10'
                            }`}
                    >
                        <Printer size={18} /> <span className="hidden xs:inline">Print</span>
                    </button>
                    <button
                        onClick={handleDownloadPdf}
                        disabled={!report.is_paid && user?.email !== 'abhyammath78@gmail.com'}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${(report.is_paid || user?.email === 'abhyammath78@gmail.com')
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-emerald-500/30'
                            : 'bg-white/10 text-white/50 cursor-not-allowed border border-white/10'
                            }`}
                    >
                        <Download size={18} /> <span className="hidden xs:inline">PDF</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors font-medium shadow-sm">
                        <Share2 size={18} /> <span className="hidden xs:inline">Share</span>
                    </button>
                </div>
            </div>

            {/* Printable Area - Centered Paper */}
            <div className="relative max-w-[210mm] mx-auto bg-white shadow-xl min-h-[297mm]">
                {/* Blurring effect if not paid and not admin */}
                <div
                    className={`transition-all duration-500 ${(!report.is_paid && user?.email !== 'abhyammath78@gmail.com') ? 'blur-sm select-none pointer-events-none' : ''}`}
                >
                    <ReportTemplate ref={printRef} report={report} user={user} />
                </div>

                {/* Payment Overlay */}
                {(!report.is_paid && user?.email !== 'abhyammath78@gmail.com') && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass-panel text-center max-w-md w-full"
                        >
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                                <Lock size={40} className="text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3 shimmer-text">Unlock Full Report</h2>
                            <p className="text-emerald-100/70 mb-6 leading-relaxed">
                                Your personalized environmental health risk assessment is ready. Unlock the full detailed report to access:
                            </p>
                            
                            <div className="text-left space-y-3 mb-8 bg-black/20 p-4 rounded-xl border border-white/5">
                                <div className="flex items-start gap-3">
                                    <CheckCircle size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                                    <span className="text-emerald-50/90 text-sm">Comprehensive environmental risk analysis</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                                    <span className="text-emerald-50/90 text-sm">Personalized health & lifestyle recommendations</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                                    <span className="text-emerald-50/90 text-sm">Detailed breakdown of air, water, and soil hazards</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                                    <span className="text-emerald-50/90 text-sm">Actionable steps to protect your child's well-being</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="btn-modern !py-4 flex items-center justify-center gap-3 text-lg"
                                >
                                    <CreditCard size={22} /> Pay ₹95 to Unlock
                                </button>
                                <p className="text-xs text-white/60 font-medium">
                                    Secure payment via Airpay. One-time fee.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Airpay Details Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="glass-panel !p-0 max-w-lg w-full overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h3 className="font-bold text-white text-lg shimmer-text">Payment Details</h3>
                                <button onClick={() => setShowPaymentModal(false)} className="text-white/60 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAirpayPayment} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-100/70 uppercase mb-1">First Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={paymentDetails.buyerFirstName}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, buyerFirstName: e.target.value })}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none placeholder-white/40"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-100/70 uppercase mb-1">Last Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={paymentDetails.buyerLastName}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, buyerLastName: e.target.value })}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none placeholder-white/40"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-100/70 uppercase mb-1">Email</label>
                                        <input
                                            required
                                            type="email"
                                            value={paymentDetails.buyerEmail}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, buyerEmail: e.target.value })}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none placeholder-white/40"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-100/70 uppercase mb-1">Phone</label>
                                        <input
                                            required
                                            type="tel"
                                            value={paymentDetails.buyerPhone}
                                            inputMode="numeric"
                                            pattern="[0-9]{10}"
                                            maxLength={10}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, buyerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none placeholder-white/40"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-emerald-100/70 uppercase mb-1">Address</label>
                                    <input
                                        required
                                        type="text"
                                        value={paymentDetails.buyerAddress}
                                        onChange={(e) => setPaymentDetails({ ...paymentDetails, buyerAddress: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none placeholder-white/40"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-100/70 uppercase mb-1">City</label>
                                        <input
                                            required
                                            type="text"
                                            value={paymentDetails.buyerCity}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, buyerCity: e.target.value })}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none placeholder-white/40"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-100/70 uppercase mb-1">State</label>
                                        <input
                                            required
                                            type="text"
                                            value={paymentDetails.buyerState}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, buyerState: e.target.value })}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none placeholder-white/40"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-100/70 uppercase mb-1">Pin Code</label>
                                        <input
                                            required
                                            type="text"
                                            value={paymentDetails.buyerPinCode}
                                            inputMode="numeric"
                                            pattern="[0-9]{6}"
                                            maxLength={6}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, buyerPinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none placeholder-white/40"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-modern !py-4 mt-4 transition-all w-full"
                                >
                                    Proceed to Airpay
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReportPage;
