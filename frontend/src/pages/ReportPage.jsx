import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Download, Loader, Share2, Lock, CreditCard, AlertCircle, X } from 'lucide-react';
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
            navigate('/assessment');
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
                setError("Failed to generate report.");
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
            // Call backend which proxies POST to Airpay and returns HTML
            const res = await api.post('/create-airpay-order', {
                report_id: report.report_id,
                ...paymentDetails
            }, { responseType: 'text' });  // Expect text/HTML, not JSON

            const data = res.data;

            // Check if it's a JSON bypass response
            try {
                const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
                if (jsonData.is_bypassed) {
                    alert("Welcome back! Your report has been automatically unlocked.");
                    fetchReport();
                    setShowPaymentModal(false);
                    return;
                }
            } catch (parseErr) {
                // Not JSON — it's the Airpay payment page HTML
            }

            // Render the Airpay payment page HTML
            document.open();
            document.write(data);
            document.close();

        } catch (err) {
            console.error("Payment initiation failed", err);
            alert("Failed to start payment process. Please try again.");
        }
    };

    const handleDownloadPdf = async () => {
        if (!report.is_paid) {
            alert("Please unlock the full report to download PDF.");
            return;
        }
        const element = printRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowedTaint: true,
                scrollY: -window.scrollY,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.scrollHeight
            });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            // First page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Add new pages if the content is longer than one page
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`Childsaveenviro_Report_${report.report_id}.pdf`);
        } catch (err) {
            console.error("PDF generation failed", err);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    if (loading || verifyingPayment) return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 gap-4">
            <Loader className="animate-spin text-green-600" size={40} />
            <p className="text-gray-500 font-medium">
                {verifyingPayment ? 'Verifying secure payment...' : 'Generating your comprehensive health report...'}
            </p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen pt-24 px-4 flex justify-center bg-gray-50">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-lg w-full h-fit flex gap-4">
                <AlertCircle className="text-red-600 shrink-0" />
                <div>
                    <h3 className="font-bold text-red-900">Unable to Load Report</h3>
                    <p className="text-red-700 mt-1">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold text-sm">
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );

    if (!report) return null;

    return (
        <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4">
            {/* Toolbar */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-end gap-3">
                <button
                    onClick={handleDownloadPdf}
                    disabled={!report.is_paid}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${report.is_paid
                        ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    <Download size={18} /> Download PDF
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm">
                    <Share2 size={18} /> Share
                </button>
            </div>

            {/* Printable Area - Centered Paper */}
            <div className="relative max-w-[210mm] mx-auto bg-white shadow-xl min-h-[297mm]">
                {/* Blurring effect if not paid */}
                <div
                    className={`transition-all duration-500 ${!report.is_paid ? 'blur-sm select-none pointer-events-none' : ''}`}
                >
                    <ReportTemplate ref={printRef} report={report} user={user} />
                </div>

                {/* Payment Overlay */}
                {!report.is_paid && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md w-full border border-gray-100"
                        >
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Lock size={40} className="text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Unlock Full Report</h2>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                Your personalized environmental health risk assessment is ready.
                                Unlock the full detailed report, including all recommendations and analysis.
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                                >
                                    <CreditCard size={22} /> Pay ₹80 to Unlock
                                </button>
                                <p className="text-xs text-gray-400 font-medium">
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
                            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                        >
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 text-lg">Payment Details</h3>
                                <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAirpayPayment} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={paymentDetails.buyerFirstName}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, buyerFirstName: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={paymentDetails.buyerLastName}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, buyerLastName: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                        <input
                                            required
                                            type="email"
                                            value={paymentDetails.buyerEmail}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, buyerEmail: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                                        <input
                                            required
                                            type="tel"
                                            value={paymentDetails.buyerPhone}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, buyerPhone: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                                    <input
                                        required
                                        type="text"
                                        value={paymentDetails.buyerAddress}
                                        onChange={(e) => setPaymentDetails({ ...paymentDetails, buyerAddress: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City</label>
                                        <input
                                            required
                                            type="text"
                                            value={paymentDetails.buyerCity}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, buyerCity: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">State</label>
                                        <input
                                            required
                                            type="text"
                                            value={paymentDetails.buyerState}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, buyerState: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pin Code</label>
                                        <input
                                            required
                                            type="text"
                                            value={paymentDetails.buyerPinCode}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, buyerPinCode: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg mt-4 transition-all"
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
