// DOCBEE Seed Data matching prompt specifications

const doctors = [
  {
    id: "doc-1",
    name: "Dr. Priya Sharma",
    specialty: "Cardiologist",
    qualification: "MD, DM (Cardiology) - AIIMS",
    experienceYears: 12,
    rating: 4.8,
    reviewCount: 342,
    consultationFee: 1200,
    languages: ["English", "Hindi", "Telugu"],
    hospital: "Apollo Heart & Vascular Institute, Metro Wing",
    avatar: "https://images.unsplash.com/photo-1594824813515-998858348b6c?auto=format&fit=crop&q=80&w=400",
    bio: "Senior Interventional Cardiologist specializing in preventive cardiology, hypertension, arrhythmia management, and non-invasive coronary diagnostics.",
    averageDurationMinutes: 18, // 18 minutes for Cardiologist
    workingHours: "09:00 AM - 06:00 PM",
    availableToday: true,
    badges: ["Top Rated", "Gold Specialist", "Echo Certified"],
    nextAvailableSlot: "04:00 PM Today",
    keywords: ["heart", "chest pain", "hypertension", "bp", "blood pressure", "palpitations", "cardiac", "cholesterol", "ecg"],
    slots: [
      { id: "s1", time: "10:00 AM", status: "completed" },
      { id: "s2", time: "10:30 AM", status: "completed" },
      { id: "s3", time: "11:00 AM", status: "completed" },
      { id: "s4", time: "02:00 PM", status: "booked" },
      { id: "s5", time: "02:30 PM", status: "booked" },
      { id: "s6", time: "03:15 PM", status: "booked" },
      { id: "s7", time: "04:00 PM", status: "available" },
      { id: "s8", time: "04:30 PM", status: "available" },
      { id: "s9", time: "05:00 PM", status: "available" },
      { id: "s10", time: "05:30 PM", status: "available" }
    ]
  },
  {
    id: "doc-2",
    name: "Dr. Arjun Kumar",
    specialty: "Dermatologist",
    qualification: "MD (Dermatology, Venereology & Leprosy)",
    experienceYears: 9,
    rating: 4.9,
    reviewCount: 289,
    consultationFee: 800,
    languages: ["English", "Hindi", "Kannada"],
    hospital: "Skin & Aesthetic Laser Centre, Indiranagar",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    bio: "Consultant Dermatologist & Trichologist with extensive expertise in chronic eczema, acne therapies, allergic skin conditions, and clinical dermoscopy.",
    averageDurationMinutes: 12, // 12 minutes for Dermatologist
    workingHours: "10:00 AM - 07:00 PM",
    availableToday: true,
    badges: ["Laser Specialist", "Allergy Care"],
    nextAvailableSlot: "03:45 PM Today",
    keywords: ["skin", "acne", "hair fall", "rash", "dermatology", "allergy", "eczema", "laser"],
    slots: [
      { id: "s201", time: "11:00 AM", status: "completed" },
      { id: "s202", time: "11:30 AM", status: "completed" },
      { id: "s203", time: "03:45 PM", status: "available" },
      { id: "s204", time: "04:15 PM", status: "available" },
      { id: "s205", time: "04:45 PM", status: "available" }
    ]
  },
  {
    id: "doc-3",
    name: "Dr. Meera Rao",
    specialty: "General Physician",
    qualification: "MBBS, MD (General Medicine)",
    experienceYears: 15,
    rating: 4.7,
    reviewCount: 512,
    consultationFee: 500,
    languages: ["English", "Hindi", "Marathi"],
    hospital: "City Care Family Hospital & Wellness Clinic",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    bio: "Senior Consultant in Internal Medicine focusing on seasonal infections, diabetes management, metabolic syndromes, and geriatric comprehensive care.",
    averageDurationMinutes: 8, // 8 minutes for General Physician
    workingHours: "08:30 AM - 04:30 PM",
    availableToday: true,
    badges: ["Family Physician", "Diabetes Educator"],
    nextAvailableSlot: "02:30 PM Today",
    keywords: ["fever", "cough", "cold", "general", "physician", "diabetes", "infection", "headache", "weakness"],
    slots: [
      { id: "s301", time: "09:00 AM", status: "completed" },
      { id: "s302", time: "02:30 PM", status: "available" },
      { id: "s303", time: "03:00 PM", status: "available" },
      { id: "s304", time: "03:30 PM", status: "available" }
    ]
  },
  {
    id: "doc-4",
    name: "Dr. Rahul Verma",
    specialty: "Orthopedic",
    qualification: "MS (Orthopedics), MCh (Joint Replacement)",
    experienceYears: 11,
    rating: 4.8,
    reviewCount: 240,
    consultationFee: 1000,
    languages: ["English", "Hindi", "Punjabi"],
    hospital: "Apex Bone & Joint Specialty Hospital",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    bio: "Orthopedic surgeon specializing in sports injuries, knee and hip arthroplasty, spine pain rehabilitation, and musculoskeletal trauma care.",
    averageDurationMinutes: 15, // 15 minutes for Orthopedic
    workingHours: "09:30 AM - 05:30 PM",
    availableToday: true,
    badges: ["Joint Replacement", "Sports Med"],
    nextAvailableSlot: "04:15 PM Today",
    keywords: ["bone", "joint", "knee pain", "back pain", "fracture", "spine", "arthritis", "orthopedic"],
    slots: [
      { id: "s401", time: "10:00 AM", status: "completed" },
      { id: "s402", time: "04:15 PM", status: "available" },
      { id: "s403", time: "05:00 PM", status: "available" }
    ]
  },
  {
    id: "doc-5",
    name: "Dr. Ananya Iyer",
    specialty: "Neurologist",
    qualification: "MD (Medicine), DM (Neurology) - NIMHANS",
    experienceYears: 14,
    rating: 4.9,
    reviewCount: 198,
    consultationFee: 1500,
    languages: ["English", "Hindi", "Tamil"],
    hospital: "NeuroLife Brain & Spine Centre",
    avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400",
    bio: "Senior Neurologist with specialized training in migraine management, stroke prevention, peripheral neuropathies, sleep disorders, and epilepsy.",
    averageDurationMinutes: 20, // 20 minutes for Neurologist
    workingHours: "10:00 AM - 05:00 PM",
    availableToday: true,
    badges: ["NIMHANS Fellow", "Headache Specialist"],
    nextAvailableSlot: "05:00 PM Today",
    keywords: ["brain", "neurology", "headache", "migraine", "nerve", "stroke", "dizziness", "seizure", "sleep"],
    slots: [
      { id: "s501", time: "11:00 AM", status: "completed" },
      { id: "s502", time: "05:00 PM", status: "available" },
      { id: "s503", time: "05:45 PM", status: "available" }
    ]
  },
  {
    id: "doc-6",
    name: "Dr. Karthik Menon",
    specialty: "Pediatrician",
    qualification: "MBBS, MD (Pediatrics), DCH",
    experienceYears: 8,
    rating: 4.8,
    reviewCount: 420,
    consultationFee: 700,
    languages: ["English", "Hindi", "Malayalam"],
    hospital: "Rainbow Children & Neonatal Clinic",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
    bio: "Child care specialist expert in pediatric developmental milestones, vaccination schedules, infant nutrition, and childhood asthma.",
    averageDurationMinutes: 10, // 10 minutes for Pediatrician
    workingHours: "09:00 AM - 06:00 PM",
    availableToday: true,
    badges: ["Child Friendly", "Vaccination Pro"],
    nextAvailableSlot: "03:30 PM Today",
    keywords: ["child", "pediatric", "baby", "infant", "vaccine", "vaccination", "kids fever", "growth"],
    slots: [
      { id: "s601", time: "09:30 AM", status: "completed" },
      { id: "s602", time: "03:30 PM", status: "available" },
      { id: "s603", time: "04:00 PM", status: "available" }
    ]
  },
  {
    id: "doc-7",
    name: "Dr. Sneha Reddy",
    specialty: "Dentist",
    qualification: "BDS, MDS (Conservative Dentistry & Endodontics)",
    experienceYears: 10,
    rating: 4.7,
    reviewCount: 310,
    consultationFee: 600,
    languages: ["English", "Hindi", "Telugu"],
    hospital: "SmileCraft Dental & Maxillofacial Care",
    avatar: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=400",
    bio: "Cosmetic & restorative dentist specializing in painless root canal treatments, teeth whitening, smile design, and pediatric dental hygiene.",
    averageDurationMinutes: 15,
    workingHours: "10:00 AM - 07:00 PM",
    availableToday: true,
    badges: ["Painless RCT", "Smile Aesthetic"],
    nextAvailableSlot: "04:30 PM Today",
    keywords: ["teeth", "dental", "toothache", "dentist", "cavity", "root canal", "gums", "whitening"],
    slots: [
      { id: "s701", time: "11:00 AM", status: "completed" },
      { id: "s702", time: "04:30 PM", status: "available" },
      { id: "s703", time: "05:15 PM", status: "available" }
    ]
  },
  {
    id: "doc-8",
    name: "Dr. Vikram Singh",
    specialty: "ENT Specialist",
    qualification: "MS (Otorhinolaryngology) - Gold Medalist",
    experienceYears: 13,
    rating: 4.8,
    reviewCount: 275,
    consultationFee: 850,
    languages: ["English", "Hindi", "Gujarati"],
    hospital: "Sound & Sinus Advanced ENT Care",
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400",
    bio: "Ear, Nose, and Throat surgeon with precision focus on chronic sinusitis, endoscopic sinus procedures, hearing impairment, and snoring/apnea solutions.",
    averageDurationMinutes: 12,
    workingHours: "09:00 AM - 05:00 PM",
    availableToday: true,
    badges: ["Sinus Expert", "Audiology Lead"],
    nextAvailableSlot: "03:15 PM Today",
    keywords: ["ear", "nose", "throat", "ent", "sinus", "hearing", "tinnitus", "tonsil", "snoring"],
    slots: [
      { id: "s801", time: "10:00 AM", status: "completed" },
      { id: "s802", time: "03:15 PM", status: "available" },
      { id: "s803", time: "04:00 PM", status: "available" }
    ]
  }
];

const patientProfile = {
  id: "pat-1",
  name: "Meera",
  age: 28,
  gender: "Female",
  phone: "+91 98765 43210",
  email: "meera.sharma@mediflow.io",
  bloodGroup: "O+Positive",
  address: "Flat 402, Green Glen Layout, Bellandur, Bangalore",
  emergencyContact: "Sunita Sharma (Mother) - +91 98123 45678",
  medicalAlerts: ["Mild Penicillin Allergy", "Family History of Hypertension"]
};

const familyMembers = [
  { id: "fam-1", name: "Meera (Me)", relation: "Self", age: 28, gender: "Female", bloodGroup: "O+" },
  { id: "fam-2", name: "Ramesh Sharma", relation: "Father", age: 62, gender: "Male", bloodGroup: "B+" },
  { id: "fam-3", name: "Sunita Sharma", relation: "Mother", age: 58, gender: "Female", bloodGroup: "O+" },
  { id: "fam-4", name: "Pooja Sharma", relation: "Sister", age: 24, gender: "Female", bloodGroup: "A+" }
];

const medicalDocuments = [
  {
    id: "doc-vault-1",
    title: "Complete Blood Count & Lipid Profile",
    category: "Blood Test",
    date: "2026-09-15",
    doctor: "Dr. Meera Rao",
    hospital: "City Care Labs",
    fileSize: "1.4 MB",
    status: "Normal with elevated Triglycerides (170 mg/dL)",
    isSharedWithDoctor: true,
    type: "pdf"
  },
  {
    id: "doc-vault-2",
    title: "12-Lead Resting ECG Report",
    category: "Cardiology",
    date: "2026-08-10",
    doctor: "Dr. Priya Sharma",
    hospital: "Apollo Heart Centre",
    fileSize: "2.1 MB",
    status: "Normal Sinus Rhythm, HR 74 bpm, No ST elevation",
    isSharedWithDoctor: true,
    type: "pdf"
  },
  {
    id: "doc-vault-3",
    title: "Chest X-Ray PA View",
    category: "Radiology Scan",
    date: "2026-05-20",
    doctor: "Dr. Vikram Singh",
    hospital: "MedRay Diagnostics",
    fileSize: "4.8 MB",
    status: "Clear lung fields, normal cardiothoracic ratio",
    isSharedWithDoctor: false,
    type: "image"
  },
  {
    id: "doc-vault-4",
    title: "Dermatology Allergy Panel & Skin Prick Test",
    category: "Dermatology",
    date: "2026-03-12",
    doctor: "Dr. Arjun Kumar",
    hospital: "Skin Laser Centre",
    fileSize: "980 KB",
    status: "Dust mite hypersensitivity identified",
    isSharedWithDoctor: true,
    type: "pdf"
  }
];

// Seed appointments matching the prompt queue example exactly:
// #1 Rahul — Consulting
// #2 Ananya — Waiting
// #3 Karthik — Waiting
// (#4 Meera — Current patient upon booking 4:00 PM)
let appointments = [
  {
    id: "apt-101",
    tokenNumber: "Q-01",
    doctorId: "doc-1",
    doctorName: "Dr. Priya Sharma",
    doctorSpecialty: "Cardiologist",
    doctorAvatar: "https://images.unsplash.com/photo-1594824813515-998858348b6c?auto=format&fit=crop&q=80&w=400",
    patientId: "pat-991",
    patientName: "Rahul",
    patientAge: 54,
    patientGender: "Male",
    date: "2026-10-05",
    time: "02:00 PM",
    consultationType: "In-Clinic",
    reason: "Quarterly hypertension review & blood pressure check",
    status: "now_consulting",
    queuePosition: 1,
    aiPreConsultation: {
      completed: true,
      chiefComplaint: "Mild chest tightness and high BP readings at home (145/95)",
      duration: "3 days",
      severity: "5/10",
      associatedSymptoms: "Light morning dizziness, mild fatigue",
      priorHistory: "Diagnosed with primary hypertension in 2022; on Telmisartan 40mg",
      summaryText: "54 y/o Male with 3-day history of BP elevation (145/95) and intermittent chest heaviness on exertion. Reports good medication compliance."
    },
    doctorNotes: "Examined patient. BP 142/90 mmHg. Heart sounds S1 S2 normal. ECG shows sinus rhythm.",
    consultationSummary: null,
    createdAt: "2026-10-05T08:30:00Z"
  },
  {
    id: "apt-102",
    tokenNumber: "Q-02",
    doctorId: "doc-1",
    doctorName: "Dr. Priya Sharma",
    doctorSpecialty: "Cardiologist",
    doctorAvatar: "https://images.unsplash.com/photo-1594824813515-998858348b6c?auto=format&fit=crop&q=80&w=400",
    patientId: "pat-992",
    patientName: "Ananya",
    patientAge: 29,
    patientGender: "Female",
    date: "2026-10-05",
    time: "02:30 PM",
    consultationType: "In-Clinic",
    reason: "Frequent palpitations while climbing stairs",
    status: "waiting",
    queuePosition: 2,
    aiPreConsultation: {
      completed: true,
      chiefComplaint: "Racing heartbeat episodes triggered after caffeine or climbing 2 flights",
      duration: "2 weeks",
      severity: "4/10",
      associatedSymptoms: "Mild anxiety, shortness of breath on stairs",
      priorHistory: "No prior cardiac illness; high stress work schedule",
      summaryText: "29 y/o Female experiencing paroxysmal palpitations lasting 5-10 minutes. No syncope or chest pain."
    },
    doctorNotes: "",
    consultationSummary: null,
    createdAt: "2026-10-05T09:15:00Z"
  },
  {
    id: "apt-103",
    tokenNumber: "Q-03",
    doctorId: "doc-1",
    doctorName: "Dr. Priya Sharma",
    doctorSpecialty: "Cardiologist",
    doctorAvatar: "https://images.unsplash.com/photo-1594824813515-998858348b6c?auto=format&fit=crop&q=80&w=400",
    patientId: "pat-993",
    patientName: "Karthik",
    patientAge: 46,
    patientGender: "Male",
    date: "2026-10-05",
    time: "03:15 PM",
    consultationType: "In-Clinic",
    reason: "Post-treadmill stress test review",
    status: "waiting",
    queuePosition: 3,
    aiPreConsultation: {
      completed: true,
      chiefComplaint: "TMT test follow up; feeling intermittent calf cramps and breathlessness",
      duration: "1 week",
      severity: "3/10",
      associatedSymptoms: "Mild fatigue",
      priorHistory: "Smoker (10 pack-years); dyslipidemia",
      summaryText: "46 y/o Male presenting for post-TMT evaluation. Reports occasional shortness of breath with physical exercise."
    },
    doctorNotes: "",
    consultationSummary: null,
    createdAt: "2026-10-05T10:00:00Z"
  }
];

let notifications = [
  {
    id: "notif-1",
    title: "Appointment Reminder",
    message: "Dr. Priya Sharma's clinic starts at 02:00 PM today. Live queue is now active.",
    time: "1:30 PM",
    read: false,
    type: "info"
  },
  {
    id: "notif-2",
    title: "Lab Report Uploaded",
    message: "Your Blood Test Panel from City Care Labs has been synced with your Vault.",
    time: "Yesterday",
    read: true,
    type: "success"
  }
];

module.exports = {
  doctors,
  patientProfile,
  familyMembers,
  medicalDocuments,
  appointments,
  notifications
};
