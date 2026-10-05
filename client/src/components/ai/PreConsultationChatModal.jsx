import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../utils/api';
import { useQueue } from '../../context/QueueContext';
import { soundFx } from '../../utils/sound';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Activity,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Stethoscope,
  Info
} from 'lucide-react';

const QUESTIONS = [
  {
    id: 1,
    key: 'chiefComplaint',
    title: 'Chief Complaint',
    text: "What brings you in today?",
    placeholder: "E.g., Severe headache and eye strain since yesterday...",
    suggestions: [
      "I have a persistent headache and eye fatigue.",
      "Experiencing chest tightness and mild palpitations.",
      "Skin rash with itching on my forearms.",
      "Routine checkup & blood pressure review."
    ]
  },
  {
    id: 2,
    key: 'duration',
    title: 'Onset & Duration',
    text: "When did it start?",
    placeholder: "E.g., Started 2 days ago, worse in the evening...",
    suggestions: [
      "Started yesterday morning.",
      "About 2 to 3 days ago.",
      "For the past week.",
      "Started suddenly a few hours ago."
    ]
  },
  {
    id: 3,
    key: 'location',
    title: 'Location',
    text: "Where is the problem located?",
    placeholder: "E.g., Frontal head and temples, neck area...",
    suggestions: [
      "Frontal head and temple areas.",
      "Upper chest and radiating to shoulders.",
      "Lower back and spine.",
      "Left arm and wrist."
    ]
  },
  {
    id: 4,
    key: 'severity',
    title: 'Severity Level',
    text: "How severe is it from 1–10?",
    hasSlider: true
  },
  {
    id: 5,
    key: 'associatedSymptoms',
    title: 'Other Symptoms',
    text: "Are you experiencing any other symptoms?",
    placeholder: "E.g., Mild nausea, dizziness, fatigue...",
    suggestions: [
      "Mild dizziness and general fatigue.",
      "Nausea and sensitivity to bright light.",
      "Slight fever and body chills.",
      "No other associated symptoms."
    ]
  },
  {
    id: 6,
    key: 'priorHistory',
    title: 'Previous Consultation',
    text: "Have you consulted a doctor about this before?",
    placeholder: "E.g., First time experiencing this, no prior medication...",
    suggestions: [
      "No, this is my first consultation for this issue.",
      "Yes, diagnosed with hypertension 2 years ago.",
      "Taking over-the-counter paracetamol with temporary relief.",
      "Had similar episodes last year."
    ]
  }
];

function getNowFormatted() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const URGENT_KEYWORDS = [
  'chest pain', 'crushing', 'cannot breathe', 'difficulty breathing', 
  'unconscious', 'passed out', 'stroke', 'bleeding heavily', 'paralyzed', 
  'suicidal', 'heart attack', 'severe trauma'
];

export default function PreConsultationChatModal({ appointment, onClose, onSuccess }) {
  const { setActiveAppointment } = useQueue();
  const [stepIndex, setStepIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sliderVal, setSliderVal] = useState(6);
  const [isTyping, setIsTyping] = useState(false);
  const [hasUrgentTrigger, setHasUrgentTrigger] = useState(false);
  
  const [answers, setAnswers] = useState({
    chiefComplaint: '',
    duration: '',
    location: '',
    severity: '6/10',
    associatedSymptoms: '',
    priorHistory: '',
    patientDescription: ''
  });

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summaryStage, setSummaryStage] = useState('chat'); // 'chat' | 'ready_to_generate' | 'review' | 'submitted'
  const [summary, setSummary] = useState(appointment?.aiPreConsultation?.completed ? appointment.aiPreConsultation : null);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (appointment?.aiPreConsultation?.completed) {
      setSummary(appointment.aiPreConsultation);
      setSummaryStage('submitted');
    } else {
      const introTime = getNowFormatted();
      setMessages([
        {
          id: 'intro',
          sender: 'ai',
          text: "Hi! I'm MediFlow's consultation assistant. I'll collect a few basic details to help your doctor prepare for your consultation.",
          timestamp: introTime
        },
        {
          id: 'q-1',
          sender: 'ai',
          text: QUESTIONS[0].text,
          stepIndex: 0,
          suggestions: QUESTIONS[0].suggestions,
          timestamp: introTime
        }
      ]);
    }
  }, [appointment]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, summaryStage]);

  const checkUrgentSymptoms = (text) => {
    const lower = text.toLowerCase();
    return URGENT_KEYWORDS.some(k => lower.includes(k));
  };

  const handleSend = (customText) => {
    const text = (customText !== undefined ? customText : inputText).trim();
    if (!text && !QUESTIONS[stepIndex]?.hasSlider) return;

    const currentQ = QUESTIONS[stepIndex];
    const val = text || `${sliderVal}/10`;
    
    if (checkUrgentSymptoms(val)) {
      setHasUrgentTrigger(true);
    }

    const updatedAnswers = { 
      ...answers, 
      [currentQ.key]: val,
      patientDescription: currentQ.key === 'chiefComplaint' ? val : (answers.patientDescription || val)
    };
    setAnswers(updatedAnswers);

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: val,
      timestamp: getNowFormatted()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    if (stepIndex < QUESTIONS.length - 1) {
      const nextIdx = stepIndex + 1;
      setStepIndex(nextIdx);
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: QUESTIONS[nextIdx].text,
            stepIndex: nextIdx,
            hasSlider: QUESTIONS[nextIdx].hasSlider,
            suggestions: QUESTIONS[nextIdx].suggestions,
            timestamp: getNowFormatted()
          }
        ]);
        soundFx.playChime();
      }, 500);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: `ai-done-${Date.now()}`,
            sender: 'ai',
            text: "Thank you! I have gathered all necessary intake details. Please click below to generate and review your pre-consultation summary before sending it to your doctor.",
            timestamp: getNowFormatted()
          }
        ]);
        setSummaryStage('ready_to_generate');
        soundFx.playChime();
      }, 500);
    }
  };

  const handleGenerateSummary = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      const structuredSummary = {
        chiefComplaint: answers.chiefComplaint || "Routine consultation",
        duration: answers.duration || "2 days",
        location: answers.location || "Head and temple area",
        severity: answers.severity || `${sliderVal}/10`,
        associatedSymptoms: answers.associatedSymptoms || "None reported",
        priorHistory: answers.priorHistory || "No prior consultation reported",
        patientDescription: answers.patientDescription || answers.chiefComplaint || "Patient reported symptoms during pre-consultation intake",
        status: "Review"
      };
      setSummary(structuredSummary);
      setIsSynthesizing(false);
      setSummaryStage('review');
      soundFx.playSuccessAlert();
    }, 600);
  };

  const handleSendToDoctor = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        appointmentId: appointment.id,
        chiefComplaint: summary.chiefComplaint,
        duration: summary.duration,
        location: summary.location,
        severity: summary.severity,
        associatedSymptoms: summary.associatedSymptoms,
        priorHistory: summary.priorHistory,
        patientDescription: summary.patientDescription
      };

      const res = await api.submitPreConsultation(payload);
      if (res.success) {
        soundFx.playSuccessAlert();
        setSummary(res.data);
        setSummaryStage('submitted');
        setActiveAppointment(prev => prev ? { ...prev, aiPreConsultation: res.data } : null);
        onSuccess && onSuccess(res.data);
      }
    } catch (err) {
      console.error('Error submitting pre-consultation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = Math.min(100, Math.round(((stepIndex + (summaryStage !== 'chat' ? 1 : 0)) / QUESTIONS.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col relative shadow-xl overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  PRE-CONSULTATION
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                  Intake
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Dr. {appointment?.doctorName} • {appointment?.time || '11:30 AM Today'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {summaryStage === 'chat' && (
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>Question {stepIndex + 1} of {QUESTIONS.length}: <strong>{QUESTIONS[stepIndex]?.title}</strong></span>
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-teal-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <span className="text-teal-700 font-bold text-[10px]">{progressPercent}%</span>
            </div>
          </div>
        )}

        {/* Medical Safety Disclaimer Banner */}
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200/80 flex items-start gap-2 text-[11px] text-amber-800">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <span>
            <strong>Medical Notice:</strong> This assistant collects information for your doctor. It does not provide a medical diagnosis or replace professional medical advice.
          </span>
        </div>

        {/* Emergency Trigger Warning */}
        {hasUrgentTrigger && (
          <div className="px-4 py-2 bg-rose-50 border-b border-rose-200 flex items-start gap-2 text-[11px] text-rose-800 animate-pulse">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>
              <strong>Emergency Advisory:</strong> If you are experiencing an emergency (such as severe crushing chest pain, difficulty breathing, or acute weakness), please seek immediate emergency care.
            </span>
          </div>
        )}

        {/* Chat / Review Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          
          {/* CHAT STAGE */}
          {(summaryStage === 'chat' || summaryStage === 'ready_to_generate') && (
            <>
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 animate-fade-in ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                  )}

                  <div className="max-w-[85%] space-y-1">
                    <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-teal-600 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-line">{m.text}</p>

                      {/* Suggestion Chips */}
                      {m.suggestions && (
                        <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {m.suggestions.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSend(s)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 text-[11px] text-left transition-all"
                            >
                              "{s}"
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Severity Slider */}
                      {m.hasSlider && (
                        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-2">
                            <span>Rate Severity (1–10):</span>
                            <span className="px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800 font-extrabold text-sm">
                              {sliderVal} / 10
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={sliderVal}
                            onChange={(e) => setSliderVal(parseInt(e.target.value))}
                            className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                            <span>1 (Mild)</span>
                            <span>5 (Moderate)</span>
                            <span>10 (Severe)</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSend(`${sliderVal}/10`)}
                            className="mt-3 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all"
                          >
                            Submit Severity Level ({sliderVal}/10)
                          </button>
                        </div>
                      )}
                    </div>

                    <span className={`text-[10px] text-slate-400 px-1 block ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {m.timestamp}
                    </span>
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 items-center text-xs text-slate-500 animate-fade-in">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-[11px] text-slate-500 ml-1">Assistant is typing...</span>
                  </div>
                </div>
              )}

              {/* Ready to generate summary */}
              {summaryStage === 'ready_to_generate' && (
                <div className="p-5 rounded-3xl bg-white border border-teal-200 text-center space-y-3 shadow-sm animate-scale-in">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Intake Questions Completed</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ready to synthesize structured clinical intake notes for Dr. {appointment?.doctorName}.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isSynthesizing}
                    className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 mx-auto transition-all"
                  >
                    <Sparkles className={`w-4 h-4 ${isSynthesizing ? 'animate-spin' : ''}`} />
                    <span>{isSynthesizing ? 'Synthesizing...' : '[ Generate Pre-Consultation Summary ]'}</span>
                  </button>
                </div>
              )}

              <div ref={scrollRef} />
            </>
          )}

          {/* STRUCTURED SUMMARY REVIEW & SUBMIT STAGE */}
          {(summaryStage === 'review' || summaryStage === 'submitted') && summary && (
            <div className="space-y-4 animate-scale-in text-left">
              
              {summaryStage === 'submitted' ? (
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-teal-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Pre-Consultation Summary Submitted</h4>
                    <p className="text-xs text-teal-800">
                      Dr. {appointment?.doctorName} can now view your intake details directly in their clinical station.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 flex items-center justify-between gap-2 text-xs text-teal-900">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>Please review your intake details before transmitting to your doctor.</span>
                  </div>
                  <button
                    onClick={() => setSummaryStage('chat')}
                    className="text-teal-700 hover:underline font-bold text-xs shrink-0 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
              )}

              {/* Exact Structured Format matching prompt */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-teal-700 block">
                    PRE-CONSULTATION SUMMARY
                  </span>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                    summaryStage === 'submitted' 
                      ? 'bg-teal-50 text-teal-700 border border-teal-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {summaryStage === 'submitted' ? '✓ Submitted' : 'Pending Review'}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs text-slate-800">
                  <div>
                    <span className="text-slate-500 font-bold block">Chief complaint:</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{summary.chiefComplaint}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 font-bold block">Duration:</span>
                      <p className="text-xs font-semibold text-slate-900 mt-0.5">{summary.duration}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-bold block">Location:</span>
                      <p className="text-xs font-semibold text-slate-900 mt-0.5">{summary.location || "Head & temples"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 font-bold block">Severity:</span>
                      <p className="text-xs font-semibold text-amber-700 mt-0.5">{summary.severity}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-bold block">Other symptoms:</span>
                      <p className="text-xs font-semibold text-slate-900 mt-0.5">{summary.associatedSymptoms || "None reported"}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 font-bold block">Previous consultation:</span>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{summary.priorHistory || "No prior consultation reported"}</p>
                  </div>

                  <div>
                    <span className="text-slate-500 font-bold block">Patient's own description:</span>
                    <p className="text-xs text-slate-700 mt-0.5 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                      "{summary.patientDescription || summary.chiefComplaint}"
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    This summary is based on information provided by the patient and is not a medical diagnosis.
                  </span>
                </div>
              </div>

              {/* Actions */}
              {summaryStage === 'review' && (
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() => setSummaryStage('chat')}
                    className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Edit Responses</span>
                  </button>

                  <button
                    onClick={handleSendToDoctor}
                    disabled={isSubmitting}
                    className="w-full flex-1 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Send className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                    <span>{isSubmitting ? 'Transmitting to Doctor...' : '[ Send to Doctor ]'}</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Input Bar */}
        {summaryStage === 'chat' && (
          <div className="p-3 sm:p-4 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={QUESTIONS[stepIndex]?.placeholder || "Type your response..."}
                className="flex-1 px-4 py-3 rounded-2xl glass-input text-xs sm:text-sm text-slate-900 placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Return Button */}
        {summaryStage === 'submitted' && (
          <div className="p-4 border-t border-slate-100 bg-white text-right">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm"
            >
              Done & Return to Waiting Room
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
