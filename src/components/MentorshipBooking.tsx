import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  QrCode,
  Copy,
  Check,
  Phone,
  User,
  Calendar,
  CreditCard,
  Printer,
  ExternalLink,
  MessageSquare,
  Award,
} from 'lucide-react';
import { MentorshipToken, ExamTarget } from '../types';
import { saveMentorshipToken } from '../lib/firebase';

interface MentorshipBookingProps {
  initialStudentName: string;
  initialExamTarget: ExamTarget;
}

export const MentorshipBooking: React.FC<MentorshipBookingProps> = ({
  initialStudentName,
  initialExamTarget,
}) => {
  const [durationMinutes, setDurationMinutes] = useState(30);
  const ratePerMinute = 5;
  const totalAmount = durationMinutes * ratePerMinute;

  // Student Details
  const [studentName, setStudentName] = useState(initialStudentName === 'Aspirant' ? '' : initialStudentName);
  const [phone, setPhone] = useState('');
  const [targetExam, setTargetExam] = useState<ExamTarget>(initialExamTarget || 'JEE Main');
  const [timeSlot, setTimeSlot] = useState('Evening (6:00 PM - 8:00 PM)');
  const [doubtTopic, setDoubtTopic] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

  // Flow step: 'configure' | 'payment' | 'confirmed_pass'
  const [bookingStep, setBookingStep] = useState<'configure' | 'payment' | 'confirmed_pass'>('configure');
  const [generatedPass, setGeneratedPass] = useState<MentorshipToken | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const upiId = 'prepskm@upi';
  const upiName = 'Prepskm Mentorship';
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`Prepskm Mentorship ${durationMinutes}m`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiUrl)}&size=200x200&margin=4`;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !phone.trim()) return;
    setBookingStep('payment');
  };

  const handleConfirmPayment = async () => {
    // Generate unique token code e.g. PSKM-JEE-84920-VERIFIED
    const examCode = targetExam.includes('NEET') ? 'NEET' : targetExam.includes('JEE') ? 'JEE' : 'BRD';
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const tokenCode = `PSKM-${examCode}-${randomDigits}-VERIFIED`;

    const tokenData: MentorshipToken = {
      tokenCode,
      studentName: studentName.trim() || 'Aspirant',
      phoneOrWhatsApp: phone.trim(),
      targetExam,
      minutesBooked: durationMinutes,
      amountPaid: totalAmount,
      timeSlot,
      doubtTopic: doubtTopic.trim() || 'General Strategy & Backlog Guidance',
      transactionId: utrNumber.trim() || `UPI-TXN-${Date.now().toString().slice(-6)}`,
      status: 'verified',
      issuedAt: new Date().toISOString(),
    };

    await saveMentorshipToken(tokenData);
    setGeneratedPass(tokenData);
    setBookingStep('confirmed_pass');
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const getTelegramShareUrl = (pass: MentorshipToken) => {
    const text = `Hey Sumit Bhaiya! I have booked a 1:1 Mentorship Session on Prepskm.

Pass Code: ${pass.tokenCode}
Student Name: ${pass.studentName}
Exam: ${pass.targetExam}
Duration: ${pass.minutesBooked} Minutes
Amount Paid: ₹${pass.amountPaid}
Time Slot: ${pass.timeSlot}
Doubt/Topic: ${pass.doubtTopic}

Please verify my pass and confirm my meeting link!`;
    return `https://t.me/unfiltreddsumit?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> 1:1 Direct Guidance with @unfiltereddsumit
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Personal Mentorship at Flat ₹5 Per Minute
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            No expensive yearly coaching fees. Book exact minutes for real-world strategy, daily timetable fixing,
            mock analysis, and personal reality checks.
          </p>
        </div>
      </div>

      {/* STEP 1: CONFIGURE & STUDENT FORM */}
      {bookingStep === 'configure' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" /> Student & Session Details
            </h3>

            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    WhatsApp / Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Target Exam
                  </label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value as ExamTarget)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="JEE Main">JEE Main</option>
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="NEET">NEET</option>
                    <option value="Class 12">Class 12 Boards</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Dropper">Dropper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Preferred Time Window
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Morning (9:00 AM - 11:00 AM)">Morning (9:00 AM - 11:00 AM)</option>
                    <option value="Afternoon (2:00 PM - 4:00 PM)">Afternoon (2:00 PM - 4:00 PM)</option>
                    <option value="Evening (6:00 PM - 8:00 PM)">Evening (6:00 PM - 8:00 PM)</option>
                    <option value="Late Night (9:00 PM - 11:00 PM)">Late Night (9:00 PM - 11:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Primary Issue to Solve in Call
                </label>
                <textarea
                  rows={2}
                  value={doubtTopic}
                  onChange={(e) => setDoubtTopic(e.target.value)}
                  placeholder="e.g. Physics mechanics backlog, low test scores in mock, or severe procrastination"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Duration Interactive Slider */}
              <div className="pt-2 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300 uppercase">
                    Select Call Duration
                  </label>
                  <span className="text-xs font-bold text-indigo-400">
                    Flat ₹5 / minute rate
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`p-3 rounded-xl border text-center transition ${
                        durationMinutes === mins
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <p className="font-bold text-sm">{mins} Mins</p>
                      <p className="text-[11px] opacity-80">₹{mins * 5}</p>
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={15}
                  max={90}
                  step={5}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition transform active:scale-98"
              >
                Proceed to UPI Payment (₹{totalAmount})
              </button>
            </form>
          </div>

          {/* Right Summary Card */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">
                Booking Summary
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Mentor:</span>
                  <span className="text-white font-bold">Sumit (@unfiltereddsumit)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Selected Duration:</span>
                  <span className="text-white font-bold">{durationMinutes} Minutes</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Rate:</span>
                  <span className="text-white font-bold">₹5 / Minute</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Platform:</span>
                  <span className="text-white font-bold">Google Meet / Telegram Call</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between text-sm">
                  <span className="font-bold text-white">Total Amount:</span>
                  <span className="font-black text-emerald-400 text-lg">₹{totalAmount}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <p className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Digital Pass Guaranteed
                </p>
                <p>
                  You will receive an official verifiable Prepskm pass card with token code immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: ONLINE UPI PAYMENT */}
      {bookingStep === 'payment' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold">
              Step 2 of 2: Online UPI Payment
            </span>
            <h3 className="text-2xl font-black text-white">Scan & Pay ₹{totalAmount}</h3>
            <p className="text-xs text-slate-400">
              Pay via Google Pay, PhonePe, Paytm, BHIM, or any UPI App to lock your {durationMinutes} min slot.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center space-y-4">
            {/* Dynamic QR Code */}
            <div className="p-3 bg-white rounded-2xl shadow-lg shadow-black/40">
              <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 block" />
            </div>

            {/* UPI ID Display & Copy */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400">UPI ID:</span>
              <span className="font-mono font-bold text-white">{upiId}</span>
              <button
                type="button"
                onClick={handleCopyUPI}
                className="text-indigo-400 hover:text-indigo-300 ml-1 p-1"
                title="Copy UPI ID"
              >
                {copiedUpi ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Direct UPI Intent Link for Mobile */}
            <a
              href={upiUrl}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> Open in UPI App (GPay / PhonePe / Paytm)
            </a>
          </div>

          {/* UTR / Transaction Input Form */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              UPI Reference / UTR Number (Optional for Instant Verification)
            </label>
            <input
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="e.g. 429381749120"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-500">
              After paying ₹{totalAmount}, enter your 12-digit UPI UTR or tap confirm to immediately generate your verified pass card.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setBookingStep('configure')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Back to Details
            </button>
            <button
              type="button"
              onClick={handleConfirmPayment}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition active:scale-95 flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> I Have Completed Payment - Generate Pass Card
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: OFFICIAL PREPSKM MENTORSHIP PASS CARD */}
      {bookingStep === 'confirmed_pass' && generatedPass && (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
          {/* Holographic Digital Pass */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 shadow-2xl shadow-indigo-500/10 relative overflow-hidden">
            {/* Holographic background sheen */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl" />

            <div className="relative z-10 space-y-6">
              {/* Pass Header */}
              <div className="flex items-center justify-between pb-4 border-b border-indigo-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-black">
                    P
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg tracking-wider">PREPSKM</h3>
                    <p className="text-[10px] text-indigo-300 font-semibold tracking-widest uppercase">
                      Official Mentorship Pass
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED PASS
                </div>
              </div>

              {/* Cryptographic Token Code Box */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 text-center space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
                  Cryptographic Token Code
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-emerald-300 select-all">
                  {generatedPass.tokenCode}
                </span>
              </div>

              {/* Pass Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Aspirant Name</span>
                  <span className="font-bold text-white text-sm">{generatedPass.studentName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Target Exam</span>
                  <span className="font-bold text-white text-sm">{generatedPass.targetExam}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Duration Booked</span>
                  <span className="font-bold text-white text-sm">{generatedPass.minutesBooked} Minutes</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Amount Paid</span>
                  <span className="font-bold text-emerald-400 text-sm">₹{generatedPass.amountPaid}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Time Slot</span>
                  <span className="font-semibold text-slate-200">{generatedPass.timeSlot}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Issued At</span>
                  <span className="font-semibold text-slate-200">
                    {new Date(generatedPass.issuedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Founder Signoff Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Verified by Sumit (@unfiltereddsumit)</span>
                <span className="font-mono text-[10px] text-indigo-400">PREPSKM CLOUD SECURE</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <a
              href={getTelegramShareUrl(generatedPass)}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-sky-500/20 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send Pass to Telegram Chat (@unfiltreddsumit)
            </a>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" /> Print / Save Pass
              </button>

              <button
                type="button"
                onClick={() => {
                  setBookingStep('configure');
                  setGeneratedPass(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Book Another Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
