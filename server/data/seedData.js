// DOCBEE MediFlow - Extended Seed Data
// Includes multiple doctors per specialty across 5 cities, seeded users with bcrypt hashes,
// queue tracking, structured consultation reports, and health records.

const locations = [
  { id: "loc-chennai", name: "Chennai", state: "Tamil Nadu", popularAreas: ["Greams Road", "Anna Nagar", "T. Nagar", "Adyar", "Velachery"] },
  { id: "loc-bangalore", name: "Bangalore", state: "Karnataka", popularAreas: ["Indiranagar", "Koramangala", "Bellandur", "Whitefield", "HSR Layout"] },
  { id: "loc-hyderabad", name: "Hyderabad", state: "Telangana", popularAreas: ["Banjara Hills", "Jubilee Hills", "Gachibowli", "Hitec City", "Madhapur"] },
  { id: "loc-coimbatore", name: "Coimbatore", state: "Tamil Nadu", popularAreas: ["RS Puram", "Gandhipuram", "Race Course", "Peelamedu"] },
  { id: "loc-madurai", name: "Madurai", state: "Tamil Nadu", popularAreas: ["KK Nagar", "Anna Nagar", "Simmakkal", "SS Colony"] }
];

// Seeded Users (Passwords hashed with bcryptjs salt rounds = 10, never plain text)
// Demo Credentials:
// Patient Demo: patient@mediflow.demo / Patient@123
// Doctor Demo: doctor@mediflow.demo / Doctor@123
const users = [
  {
    id: "usr-patient-1",
    email: "patient@mediflow.demo",
    phone: "+91 98765 00001",
    passwordHash: "$2b$10$SNAskFFPO4Dx04crv5JaxOKl9IyEKDFFJ0S0hdyyxSeiSqW6tMo1G", // Patient@123
    role: "patient",
    name: "Rahul Sharma",
    patientId: "pat-1",
    createdAt: "2026-09-01T08:00:00Z"
  },
  {
    id: "usr-doctor-1",
    email: "doctor@mediflow.demo",
    phone: "+91 98765 00002",
    passwordHash: "$2b$10$1Ec1YlB5BRTap8emDBSnbOpyIw/niawOJkTYYPxpGE16uq/Gouspy", // Doctor@123
    role: "doctor",
    name: "Dr. Priya Sharma",
    doctorId: "doc-1",
    createdAt: "2026-09-01T08:00:00Z"
  },
  {
    id: "usr-patient-2",
    email: "rahul.sharma@mediflow.io",
    phone: "+91 98765 43210",
    passwordHash: "$2b$10$.0IUn/Abv2HZ0LTSCgmDoerCw.BY7zFobixJXQXthYYDdGSBwKzKW", // Rahul@123
    role: "patient",
    name: "Rahul Sharma",
    patientId: "pat-1",
    createdAt: "2026-09-01T08:00:00Z"
  },
  {
    id: "usr-doctor-2",
    email: "priya.sharma@mediflow.io",
    phone: "+91 98765 00003",
    passwordHash: "$2b$10$9Vzcg4qNcqyYnLKWV.0u7ueCkoCC1dIrSUJkk5O2a73BoaQnVMwtG", // Priya@123
    role: "doctor",
    name: "Dr. Priya Sharma",
    doctorId: "doc-1",
    createdAt: "2026-09-01T08:00:00Z"
  },
  {
    id: "usr-patient-3",
    email: "meera.sharma@mediflow.io",
    phone: "+91 98123 45678",
    passwordHash: "$2b$10$Dm7IguEhpB1sOqII3G8mme8Jjc3NJeoY2Ih.68xGKuClNOeGpG03y", // Meera@123
    role: "patient",
    name: "Meera",
    patientId: "pat-2",
    createdAt: "2026-09-01T08:00:00Z"
  }
];

const doctors = [
  // --- CHENNAI DOCTORS ---
  {
    id: "doc-1",
    name: "Dr. Priya Sharma",
    specialty: "Cardiologist",
    qualification: "MD, DM (Cardiology) - AIIMS",
    experienceYears: 12,
    rating: 4.8,
    reviewCount: 342,
    consultationFee: 1200,
    languages: ["English", "Hindi", "Tamil"],
    hospital: "Apollo Heart & Vascular Institute, Greams Road",
    location: "Chennai",
    locationId: "loc-chennai",
    area: "Greams Road",
    distance: "2.4 km",
    avatar: "https://images.unsplash.com/photo-1594824813515-998858348b6c?auto=format&fit=crop&q=80&w=400",
    bio: "Senior Interventional Cardiologist specializing in preventive cardiology, hypertension, arrhythmia management, and non-invasive coronary diagnostics.",
    averageDurationMinutes: 18,
    workingHours: "09:00 AM - 06:00 PM",
    availableToday: true,
    badges: ["Top Rated", "Gold Specialist", "Echo Certified"],
    nextAvailableSlot: "04:00 PM Today",
    keywords: ["heart", "chest pain", "hypertension", "bp", "blood pressure", "palpitations", "cardiac", "cholesterol", "ecg", "chennai"],
    slots: [
      { id: "s1", time: "10:00 AM", status: "completed" },
      { id: "s2", time: "10:30 AM", status: "completed" },
      { id: "s3", time: "11:00 AM", status: "completed" },
      { id: "s4", time: "02:00 PM", status: "booked" },
      { id: "s5", time: "02:30 PM", status: "booked" },
      { id: "s6", time: "03:15 PM", status: "booked" },
      { id: "s7", time: "04:00 PM", status: "available" },
      { id: "s8", time: "04:30 PM", status: "available" },
      { id: "s9", time: "05:00 PM", status: "available" }
    ]
  },
  {
    id: "doc-2",
    name: "Dr. Arun Kumar",
    specialty: "Cardiologist",
    qualification: "MBBS, MD (General Medicine), DM (Cardiology)",
    experienceYears: 14,
    rating: 4.9,
    reviewCount: 418,
    consultationFee: 1100,
    languages: ["English", "Tamil", "Telugu"],
    hospital: "Madras Heart & Vascular Clinic, Anna Nagar",
    location: "Chennai",
    locationId: "loc-chennai",
    area: "Anna Nagar",
    distance: "5.1 km",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    bio: "Consultant Cardiologist specializing in adult congenital heart diseases, lipid disorders, heart failure management, and cardiac stress testing.",
    averageDurationMinutes: 16,
    workingHours: "10:00 AM - 07:00 PM",
    availableToday: true,
    badges: ["Senior Cardiologist", "Heart Failure Lead"],
    nextAvailableSlot: "04:45 PM Today",
    keywords: ["heart", "cardio", "chest pain", "cholesterol", "heart failure", "ecg", "tmt", "chennai"],
    slots: [
      { id: "s201", time: "11:00 AM", status: "completed" },
      { id: "s202", time: "04:45 PM", status: "available" },
      { id: "s203", time: "05:15 PM", status: "available" }
    ]
  },
  {
    id: "doc-3",
    name: "Dr. Ananya Rao",
    specialty: "Dermatologist",
    qualification: "MD (DVL) - Madras Medical College",
    experienceYears: 10,
    rating: 4.9,
    reviewCount: 310,
    consultationFee: 850,
    languages: ["English", "Tamil", "Hindi"],
    hospital: "Chennai Skin & Laser Institute, T. Nagar",
    location: "Chennai",
    locationId: "loc-chennai",
    area: "T. Nagar",
    distance: "3.8 km",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    bio: "Clinical and aesthetic dermatologist specializing in acne scar remodeling, chronic eczema, scalp disorders, and laser dermatological therapies.",
    averageDurationMinutes: 12,
    workingHours: "09:30 AM - 05:30 PM",
    availableToday: true,
    badges: ["Laser Pro", "Aesthetic Fellow"],
    nextAvailableSlot: "03:30 PM Today",
    keywords: ["skin", "acne", "hair fall", "rash", "dermatology", "allergy", "eczema", "laser", "chennai"],
    slots: [
      { id: "s301", time: "10:00 AM", status: "completed" },
      { id: "s302", time: "03:30 PM", status: "available" },
      { id: "s303", time: "04:00 PM", status: "available" }
    ]
  },
  {
    id: "doc-4",
    name: "Dr. Rahul Verma",
    specialty: "Orthopedic",
    qualification: "MS (Ortho), MCh (Joint Replacement)",
    experienceYears: 11,
    rating: 4.8,
    reviewCount: 240,
    consultationFee: 1000,
    languages: ["English", "Hindi", "Tamil"],
    hospital: "Apex Bone & Joint Specialty Hospital, Adyar",
    location: "Chennai",
    locationId: "loc-chennai",
    area: "Adyar",
    distance: "4.2 km",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    bio: "Orthopedic surgeon specializing in sports injuries, knee and hip arthroplasty, spine pain rehabilitation, and musculoskeletal trauma care.",
    averageDurationMinutes: 15,
    workingHours: "09:30 AM - 05:30 PM",
    availableToday: true,
    badges: ["Joint Replacement", "Sports Med"],
    nextAvailableSlot: "04:15 PM Today",
    keywords: ["bone", "joint", "knee pain", "back pain", "fracture", "spine", "arthritis", "orthopedic", "chennai"],
    slots: [
      { id: "s401", time: "10:00 AM", status: "completed" },
      { id: "s402", time: "04:15 PM", status: "available" },
      { id: "s403", time: "05:00 PM", status: "available" }
    ]
  },
  {
    id: "doc-5",
    name: "Dr. Nisha Kapoor",
    specialty: "Pediatrician",
    qualification: "MBBS, MD (Pediatrics), DCH",
    experienceYears: 9,
    rating: 4.9,
    reviewCount: 380,
    consultationFee: 750,
    languages: ["English", "Tamil", "Hindi"],
    hospital: "Little Stars Child Care Clinic, Velachery",
    location: "Chennai",
    locationId: "loc-chennai",
    area: "Velachery",
    distance: "6.0 km",
    avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400",
    bio: "Pediatric specialist expert in infant immunization, developmental screening, childhood allergy management, and adolescent healthcare.",
    averageDurationMinutes: 10,
    workingHours: "09:00 AM - 06:00 PM",
    availableToday: true,
    badges: ["Child Friendly", "Vaccine Pro"],
    nextAvailableSlot: "03:15 PM Today",
    keywords: ["child", "pediatric", "baby", "infant", "vaccine", "vaccination", "kids fever", "growth", "chennai"],
    slots: [
      { id: "s501", time: "09:30 AM", status: "completed" },
      { id: "s502", time: "03:15 PM", status: "available" },
      { id: "s503", time: "03:45 PM", status: "available" }
    ]
  },

  // --- BANGALORE DOCTORS ---
  {
    id: "doc-6",
    name: "Dr. Arjun Kumar",
    specialty: "Dermatologist",
    qualification: "MD (Dermatology, Venereology & Leprosy)",
    experienceYears: 9,
    rating: 4.9,
    reviewCount: 289,
    consultationFee: 800,
    languages: ["English", "Hindi", "Kannada"],
    hospital: "Skin & Aesthetic Laser Centre, Indiranagar",
    location: "Bangalore",
    locationId: "loc-bangalore",
    area: "Indiranagar",
    distance: "3.2 km",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    bio: "Consultant Dermatologist & Trichologist with extensive expertise in chronic eczema, acne therapies, allergic skin conditions, and clinical dermoscopy.",
    averageDurationMinutes: 12,
    workingHours: "10:00 AM - 07:00 PM",
    availableToday: true,
    badges: ["Laser Specialist", "Allergy Care"],
    nextAvailableSlot: "03:45 PM Today",
    keywords: ["skin", "acne", "hair fall", "rash", "dermatology", "allergy", "eczema", "laser", "bangalore"],
    slots: [
      { id: "s601", time: "11:00 AM", status: "completed" },
      { id: "s602", time: "03:45 PM", status: "available" },
      { id: "s603", time: "04:15 PM", status: "available" }
    ]
  },
  {
    id: "doc-7",
    name: "Dr. Meera Rao",
    specialty: "General Physician",
    qualification: "MBBS, MD (General Medicine)",
    experienceYears: 15,
    rating: 4.7,
    reviewCount: 512,
    consultationFee: 500,
    languages: ["English", "Hindi", "Kannada", "Marathi"],
    hospital: "City Care Family Hospital & Wellness Clinic, Bellandur",
    location: "Bangalore",
    locationId: "loc-bangalore",
    area: "Bellandur",
    distance: "1.8 km",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    bio: "Senior Consultant in Internal Medicine focusing on seasonal infections, diabetes management, metabolic syndromes, and geriatric comprehensive care.",
    averageDurationMinutes: 8,
    workingHours: "08:30 AM - 04:30 PM",
    availableToday: true,
    badges: ["Family Physician", "Diabetes Educator"],
    nextAvailableSlot: "02:30 PM Today",
    keywords: ["fever", "cough", "cold", "general", "physician", "diabetes", "infection", "headache", "bangalore"],
    slots: [
      { id: "s701", time: "09:00 AM", status: "completed" },
      { id: "s702", time: "02:30 PM", status: "available" },
      { id: "s703", time: "03:00 PM", status: "available" }
    ]
  },
  {
    id: "doc-8",
    name: "Dr. Karthik Menon",
    specialty: "Cardiologist",
    qualification: "MD (Med), DM (Cardio), FACC",
    experienceYears: 13,
    rating: 4.8,
    reviewCount: 320,
    consultationFee: 1300,
    languages: ["English", "Kannada", "Malayalam"],
    hospital: "Silicon Heart Institute, Whitefield",
    location: "Bangalore",
    locationId: "loc-bangalore",
    area: "Whitefield",
    distance: "7.5 km",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
    bio: "Cardiovascular specialist focusing on coronary artery interventions, cardiac rehabilitation, cholesterol management, and pacemaker evaluations.",
    averageDurationMinutes: 18,
    workingHours: "10:00 AM - 06:00 PM",
    availableToday: true,
    badges: ["FACC Certified", "Interventional Lead"],
    nextAvailableSlot: "04:30 PM Today",
    keywords: ["heart", "cardio", "chest pain", "angina", "ecg", "bp", "bangalore"],
    slots: [
      { id: "s801", time: "11:30 AM", status: "completed" },
      { id: "s802", time: "04:30 PM", status: "available" },
      { id: "s803", time: "05:00 PM", status: "available" }
    ]
  },
  {
    id: "doc-9",
    name: "Dr. Ananya Iyer",
    specialty: "Neurologist",
    qualification: "MD (Medicine), DM (Neurology) - NIMHANS",
    experienceYears: 14,
    rating: 4.9,
    reviewCount: 198,
    consultationFee: 1500,
    languages: ["English", "Hindi", "Kannada", "Tamil"],
    hospital: "NeuroLife Brain & Spine Centre, Koramangala",
    location: "Bangalore",
    locationId: "loc-bangalore",
    area: "Koramangala",
    distance: "4.0 km",
    avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400",
    bio: "Senior Neurologist with specialized training in migraine management, stroke prevention, peripheral neuropathies, sleep disorders, and epilepsy.",
    averageDurationMinutes: 20,
    workingHours: "10:00 AM - 05:00 PM",
    availableToday: true,
    badges: ["NIMHANS Fellow", "Headache Specialist"],
    nextAvailableSlot: "05:00 PM Today",
    keywords: ["brain", "neurology", "headache", "migraine", "nerve", "stroke", "dizziness", "seizure", "sleep", "bangalore"],
    slots: [
      { id: "s901", time: "11:00 AM", status: "completed" },
      { id: "s902", time: "05:00 PM", status: "available" },
      { id: "s903", time: "05:45 PM", status: "available" }
    ]
  },
  {
    id: "doc-10",
    name: "Dr. Sneha Reddy",
    specialty: "Dentist",
    qualification: "BDS, MDS (Conservative Dentistry & Endodontics)",
    experienceYears: 10,
    rating: 4.7,
    reviewCount: 310,
    consultationFee: 600,
    languages: ["English", "Hindi", "Kannada", "Telugu"],
    hospital: "SmileCraft Dental & Maxillofacial Care, HSR Layout",
    location: "Bangalore",
    locationId: "loc-bangalore",
    area: "HSR Layout",
    distance: "2.8 km",
    avatar: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=400",
    bio: "Cosmetic & restorative dentist specializing in painless root canal treatments, teeth whitening, smile design, and pediatric dental hygiene.",
    averageDurationMinutes: 15,
    workingHours: "10:00 AM - 07:00 PM",
    availableToday: true,
    badges: ["Painless RCT", "Smile Aesthetic"],
    nextAvailableSlot: "04:30 PM Today",
    keywords: ["teeth", "dental", "toothache", "dentist", "cavity", "root canal", "gums", "whitening", "bangalore"],
    slots: [
      { id: "s1001", time: "11:00 AM", status: "completed" },
      { id: "s1002", time: "04:30 PM", status: "available" }
    ]
  },

  // --- HYDERABAD DOCTORS ---
  {
    id: "doc-11",
    name: "Dr. Vikram Singh",
    specialty: "ENT Specialist",
    qualification: "MS (Otorhinolaryngology) - Gold Medalist",
    experienceYears: 13,
    rating: 4.8,
    reviewCount: 275,
    consultationFee: 850,
    languages: ["English", "Hindi", "Telugu"],
    hospital: "Sound & Sinus Advanced ENT Care, Jubilee Hills",
    location: "Hyderabad",
    locationId: "loc-hyderabad",
    area: "Jubilee Hills",
    distance: "3.5 km",
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400",
    bio: "Ear, Nose, and Throat surgeon with precision focus on chronic sinusitis, endoscopic sinus procedures, hearing impairment, and snoring/apnea solutions.",
    averageDurationMinutes: 12,
    workingHours: "09:00 AM - 05:00 PM",
    availableToday: true,
    badges: ["Sinus Expert", "Audiology Lead"],
    nextAvailableSlot: "03:15 PM Today",
    keywords: ["ear", "nose", "throat", "ent", "sinus", "hearing", "tinnitus", "tonsil", "snoring", "hyderabad"],
    slots: [
      { id: "s1101", time: "10:00 AM", status: "completed" },
      { id: "s1102", time: "03:15 PM", status: "available" },
      { id: "s1103", time: "04:00 PM", status: "available" }
    ]
  },
  {
    id: "doc-12",
    name: "Dr. Suresh Varma",
    specialty: "General Medicine",
    qualification: "MD (Internal Medicine) - Osmania",
    experienceYears: 16,
    rating: 4.9,
    reviewCount: 460,
    consultationFee: 550,
    languages: ["English", "Telugu", "Hindi"],
    hospital: "Hyderabad Care Wellness Clinic, Banjara Hills",
    location: "Hyderabad",
    locationId: "loc-hyderabad",
    area: "Banjara Hills",
    distance: "2.1 km",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    bio: "Senior Consultant in Internal Medicine with comprehensive expertise in metabolic disorders, thyroid conditions, hypertension, and preventive health screenings.",
    averageDurationMinutes: 10,
    workingHours: "08:30 AM - 04:30 PM",
    availableToday: true,
    badges: ["Senior Consultant", "Preventive Care"],
    nextAvailableSlot: "03:00 PM Today",
    keywords: ["fever", "diabetes", "general", "physician", "thyroid", "hypertension", "checkup", "hyderabad"],
    slots: [
      { id: "s1201", time: "09:00 AM", status: "completed" },
      { id: "s1202", time: "03:00 PM", status: "available" },
      { id: "s1203", time: "03:30 PM", status: "available" }
    ]
  },
  {
    id: "doc-13",
    name: "Dr. Divya Shah",
    specialty: "Dermatologist",
    qualification: "MBBS, MD (DVL), Fellow in Dermatosurgery",
    experienceYears: 11,
    rating: 4.8,
    reviewCount: 295,
    consultationFee: 900,
    languages: ["English", "Hindi", "Telugu", "Gujarati"],
    hospital: "Gachibowli Derma Clinic & Skin Studio",
    location: "Hyderabad",
    locationId: "loc-hyderabad",
    area: "Gachibowli",
    distance: "5.4 km",
    avatar: "https://images.unsplash.com/photo-1594824813515-998858348b6c?auto=format&fit=crop&q=80&w=400",
    bio: "Consultant Dermatologist specializing in hair restoration, psoriasis management, clinical phototherapy, and skin allergy panels.",
    averageDurationMinutes: 14,
    workingHours: "10:00 AM - 06:30 PM",
    availableToday: true,
    badges: ["Skin Specialist", "Hair Restoration"],
    nextAvailableSlot: "04:15 PM Today",
    keywords: ["skin", "derma", "hair", "acne", "psoriasis", "allergy", "rash", "hyderabad"],
    slots: [
      { id: "s1301", time: "11:00 AM", status: "completed" },
      { id: "s1302", time: "04:15 PM", status: "available" }
    ]
  },

  // --- COIMBATORE DOCTORS ---
  {
    id: "doc-14",
    name: "Dr. Rajesh Nair",
    specialty: "Orthopedic",
    qualification: "MS (Ortho), DNB (Ortho), Fellowship in Arthroscopy",
    experienceYears: 12,
    rating: 4.8,
    reviewCount: 220,
    consultationFee: 900,
    languages: ["English", "Tamil", "Malayalam"],
    hospital: "Kovai Ortho & Trauma Care, RS Puram",
    location: "Coimbatore",
    locationId: "loc-coimbatore",
    area: "RS Puram",
    distance: "1.9 km",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    bio: "Senior orthopedic consultant specializing in keyhole knee surgeries, shoulder dislocations, joint arthritis, and fracture rehabilitation.",
    averageDurationMinutes: 15,
    workingHours: "09:30 AM - 05:30 PM",
    availableToday: true,
    badges: ["Arthroscopy Lead", "Joint Care"],
    nextAvailableSlot: "03:45 PM Today",
    keywords: ["bone", "joint", "knee", "shoulder", "ortho", "arthritis", "fracture", "coimbatore"],
    slots: [
      { id: "s1401", time: "10:00 AM", status: "completed" },
      { id: "s1402", time: "03:45 PM", status: "available" }
    ]
  },
  {
    id: "doc-15",
    name: "Dr. Deepa Sundaram",
    specialty: "General Medicine",
    qualification: "MBBS, MD (General Medicine) - PSG IMS&R",
    experienceYears: 10,
    rating: 4.8,
    reviewCount: 310,
    consultationFee: 450,
    languages: ["English", "Tamil"],
    hospital: "Coimbatore City Wellness Centre, Gandhipuram",
    location: "Coimbatore",
    locationId: "loc-coimbatore",
    area: "Gandhipuram",
    distance: "2.7 km",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    bio: "Dedicated physician treating infectious fevers, lifestyle conditions, hypertension, diabetes mellitus, and annual executive wellness checkups.",
    averageDurationMinutes: 8,
    workingHours: "09:00 AM - 05:00 PM",
    availableToday: true,
    badges: ["Wellness Lead", "General Health"],
    nextAvailableSlot: "02:45 PM Today",
    keywords: ["fever", "cold", "diabetes", "general", "checkup", "coimbatore"],
    slots: [
      { id: "s1501", time: "09:30 AM", status: "completed" },
      { id: "s1502", time: "02:45 PM", status: "available" }
    ]
  },

  // --- MADURAI DOCTORS ---
  {
    id: "doc-16",
    name: "Dr. K. Meenakshi",
    specialty: "Gynecology",
    qualification: "MBBS, MD (OG), DGO - Madurai Medical College",
    experienceYears: 17,
    rating: 4.9,
    reviewCount: 530,
    consultationFee: 800,
    languages: ["English", "Tamil"],
    hospital: "Meenakshi Women's Speciality Clinic, KK Nagar",
    location: "Madurai",
    locationId: "loc-madurai",
    area: "KK Nagar",
    distance: "1.5 km",
    avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400",
    bio: "Senior Obstetrician and Gynecologist specializing in high-risk pregnancy monitoring, PCOS management, adolescent reproductive health, and menopausal care.",
    averageDurationMinutes: 15,
    workingHours: "09:00 AM - 05:00 PM",
    availableToday: true,
    badges: ["Women's Health Lead", "High-Risk Pregnancy"],
    nextAvailableSlot: "03:30 PM Today",
    keywords: ["women", "gynecology", "pcos", "pregnancy", "maternal", "madurai"],
    slots: [
      { id: "s1601", time: "10:00 AM", status: "completed" },
      { id: "s1602", time: "03:30 PM", status: "available" }
    ]
  },
  {
    id: "doc-17",
    name: "Dr. Selvam Raman",
    specialty: "Pediatrician",
    qualification: "MBBS, DCH, MD (Pediatrics)",
    experienceYears: 12,
    rating: 4.8,
    reviewCount: 390,
    consultationFee: 600,
    languages: ["English", "Tamil"],
    hospital: "Temple City Child Care, Anna Nagar",
    location: "Madurai",
    locationId: "loc-madurai",
    area: "Anna Nagar",
    distance: "2.3 km",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
    bio: "Child specialist focusing on childhood asthma, newborn neonatal care, pediatric infections, and dietary guidance for growing children.",
    averageDurationMinutes: 10,
    workingHours: "09:30 AM - 06:00 PM",
    availableToday: true,
    badges: ["Child Specialist", "Pediatric Care"],
    nextAvailableSlot: "04:00 PM Today",
    keywords: ["child", "pediatric", "infant", "vaccine", "kids", "fever", "madurai"],
    slots: [
      { id: "s1701", time: "10:30 AM", status: "completed" },
      { id: "s1702", time: "04:00 PM", status: "available" }
    ]
  }
];

const patientProfile = {
  id: "pat-1",
  userId: "usr-patient-1",
  name: "Rahul Sharma",
  age: 31,
  gender: "Male",
  phone: "+91 98765 00001",
  email: "patient@mediflow.demo",
  bloodGroup: "O+Positive",
  address: "Flat 402, Green Glen Layout, Bellandur, Bangalore",
  emergencyContact: "Sunita Sharma (Mother) - +91 98123 45678",
  medicalAlerts: ["Mild Penicillin Allergy", "Family History of Hypertension"]
};

const familyMembers = [
  { id: "fam-1", patientId: "pat-1", name: "Rahul Sharma (Self)", relation: "Self", age: 31, gender: "Male", bloodGroup: "O+" },
  { id: "fam-2", patientId: "pat-1", name: "Ramesh Sharma", relation: "Father", age: 62, gender: "Male", bloodGroup: "B+" },
  { id: "fam-3", patientId: "pat-1", name: "Sunita Sharma", relation: "Mother", age: 58, gender: "Female", bloodGroup: "O+" },
  { id: "fam-4", patientId: "pat-1", name: "Pooja Sharma", relation: "Sister", age: 24, gender: "Female", bloodGroup: "A+" }
];

// Structured Consultation Reports
const consultationReports = [
  {
    id: "rep-101",
    appointmentId: "apt-past-1",
    patientId: "pat-1",
    patientName: "Rahul Sharma",
    patientAge: 31,
    patientGender: "Male",
    doctorId: "doc-1",
    doctorName: "Dr. Priya Sharma",
    doctorSpecialty: "Cardiologist",
    hospital: "Apollo Heart & Vascular Institute, Greams Road",
    location: "Chennai",
    date: "2026-09-20",
    time: "02:30 PM",
    chiefComplaint: "Quarterly hypertension review and resting ECG evaluation",
    symptomsReported: "Occasional mild morning headache, no chest pain, no palpitations",
    patientProvidedInfo: "Compliant with Telmisartan 40mg. Home BP logs average 128/84 mmHg.",
    doctorObservations: "Blood pressure 126/82 mmHg. Pulse 72 bpm, regular. Heart sounds S1 S2 normal, no murmurs. Lungs clear to auscultation bilaterally.",
    doctorNotes: "Cardiovascular examination within target therapeutic limits. Good lifestyle adherence.",
    clinicalSummary: "Stage 1 Essential Hypertension (Well Controlled). Resting 12-lead ECG demonstrates normal sinus rhythm with no ischemic changes.",
    advice: "1. Continue Tab Telmisartan 40mg once daily after breakfast.\n2. Maintain low sodium diet (<2g/day) and 30 mins brisk walking.\n3. Repeat serum electrolytes and lipid profile in 3 months.",
    followUp: {
      recommended: true,
      recommendedDate: "2026-12-20",
      reason: "Routine quarterly cardiovascular review"
    },
    status: "Completed",
    createdAt: "2026-09-20T09:30:00Z"
  },
  {
    id: "rep-102",
    appointmentId: "apt-past-2",
    patientId: "pat-1",
    patientName: "Rahul Sharma",
    patientAge: 31,
    patientGender: "Male",
    doctorId: "doc-6",
    doctorName: "Dr. Arjun Kumar",
    doctorSpecialty: "Dermatologist",
    hospital: "Skin & Aesthetic Laser Centre, Indiranagar",
    location: "Bangalore",
    date: "2026-08-15",
    time: "11:00 AM",
    chiefComplaint: "Contact dermatitis and itching on forearms after garden work",
    symptomsReported: "Erythematous papules, localized pruritus for 4 days",
    patientProvidedInfo: "No prior drug allergies reported. Used over-the-counter moisturizer without relief.",
    doctorObservations: "Multiple discrete erythematous papules on bilateral extensor forearm surfaces. No secondary infection.",
    doctorNotes: "Classic allergic contact dermatitis presentation. Advised protective clothing.",
    clinicalSummary: "Acute Contact Dermatitis (Resolved with topical corticosteroids).",
    advice: "1. Apply Mometasone Furoate 0.1% cream sparingly twice daily for 5 days.\n2. Tab Levocetirizine 5mg at bedtime for 3 days.\n3. Avoid direct contact with suspected botanical allergens.",
    followUp: {
      recommended: false,
      recommendedDate: null,
      reason: "SOS if rash spreads or persists beyond 7 days"
    },
    status: "Completed",
    createdAt: "2026-08-15T06:00:00Z"
  }
];

const medicalDocuments = [
  {
    id: "doc-vault-1",
    patientId: "pat-1",
    title: "Complete Blood Count & Lipid Profile",
    category: "Blood Test",
    date: "2026-09-15",
    doctor: "Dr. Meera Rao",
    hospital: "City Care Labs, Bangalore",
    fileSize: "1.4 MB",
    status: "Normal with elevated Triglycerides (170 mg/dL)",
    isSharedWithDoctor: true,
    type: "pdf",
    reportId: "rep-101"
  },
  {
    id: "doc-vault-2",
    patientId: "pat-1",
    title: "12-Lead Resting ECG Report",
    category: "Cardiology",
    date: "2026-08-10",
    doctor: "Dr. Priya Sharma",
    hospital: "Apollo Heart Centre, Chennai",
    fileSize: "2.1 MB",
    status: "Normal Sinus Rhythm, HR 74 bpm, No ST elevation",
    isSharedWithDoctor: true,
    type: "pdf",
    reportId: "rep-101"
  },
  {
    id: "doc-vault-3",
    patientId: "pat-1",
    title: "Chest X-Ray PA View",
    category: "Radiology Scan",
    date: "2026-05-20",
    doctor: "Dr. Vikram Singh",
    hospital: "MedRay Diagnostics, Hyderabad",
    fileSize: "4.8 MB",
    status: "Clear lung fields, normal cardiothoracic ratio",
    isSharedWithDoctor: false,
    type: "image",
    reportId: null
  },
  {
    id: "doc-vault-4",
    patientId: "pat-1",
    title: "Dermatology Allergy Panel & Skin Prick Test",
    category: "Dermatology",
    date: "2026-03-12",
    doctor: "Dr. Arjun Kumar",
    hospital: "Skin Laser Centre, Bangalore",
    fileSize: "980 KB",
    status: "Dust mite hypersensitivity identified",
    isSharedWithDoctor: true,
    type: "pdf",
    reportId: "rep-102"
  }
];

// Seed appointments matching the live queue state demo:
// #1 Rahul — now_consulting
// #2 Ananya — waiting
// #3 Karthik — waiting
// (#4 Meera — joins as waiting)
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
    queueState: "IN_CONSULTATION", // WAITING | NEAR_TURN | CALLED | IN_CONSULTATION | COMPLETED
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
    queueState: "NEAR_TURN",
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
    queueState: "WAITING",
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
    userId: "usr-patient-1",
    patientId: "pat-1",
    title: "Appointment Reminder",
    message: "Dr. Priya Sharma's clinic starts at 02:00 PM today. Live queue is now active.",
    time: "1:30 PM",
    read: false,
    type: "Reminder", // Appointment | Queue | Consultation | Report | Reminder | System
    relatedId: "apt-101"
  },
  {
    id: "notif-2",
    userId: "usr-patient-1",
    patientId: "pat-1",
    title: "Consultation Report Ready",
    message: "Your Cardiology consultation report with Dr. Priya Sharma is now available for download.",
    time: "Yesterday",
    read: true,
    type: "Report",
    relatedId: "rep-101"
  },
  {
    id: "notif-3",
    userId: "usr-patient-1",
    patientId: "pat-1",
    title: "Lab Report Uploaded",
    message: "Your Blood Test Panel from City Care Labs has been synced with your Vault.",
    time: "2 days ago",
    read: true,
    type: "System",
    relatedId: "doc-vault-1"
  }
];

module.exports = {
  locations,
  users,
  doctors,
  patientProfile,
  familyMembers,
  consultationReports,
  medicalDocuments,
  appointments,
  notifications
};
