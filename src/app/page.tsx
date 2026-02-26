
"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { MessageSquare, BookOpen, Scale, FileText, Users, Shield, Home, Car, Briefcase, Heart, GraduationCap, Building } from 'lucide-react';
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import ChatInterface from '@/components/ChatInterface';
import LanguageToggle from '@/components/LanguageToggle';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : 'http://127.0.0.1:8000');

type Language = 'en' | 'ta';

interface LegalCategory {
  id: number;
  icon: ReactNode;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  overviewEn: string;
  overviewTa: string;
  learnEn: string[];
  learnTa: string[];
  referencesEn: string[];
  referencesTa: string[];
}

interface BackendCategoryStudy {
  id: number;
  title_en: string;
  title_ta: string;
  description_en: string;
  description_ta: string;
  overview: string;
  learn_points: string[];
  references: string[];
  source_count: number;
  source_type: string;
}

function isPdfLikeReference(value: string) {
  return /(^|[\\/])[^\\/\s]+\.pdf($|[?#\s])/i.test((value || '').trim());
}

// Tamil Nadu legal categories with study-focused details
const legalCategories: LegalCategory[] = [
  {
    id: 1,
    icon: <Home className="w-6 h-6" />,
    titleEn: "Property & Land Laws",
    titleTa: "சொத்து & நிலச் சட்டங்கள்",
    descriptionEn: "Land disputes, property registration, tenant rights",
    descriptionTa: "நில விவகாரங்கள், சொத்து பதிவு, குடியிருப்பாளர் உரிமைகள்",
    overviewEn: "This section helps you understand land ownership documents, property transfer steps, and tenant-landlord rights commonly used in Tamil Nadu.",
    overviewTa: "இந்த பகுதி தமிழ்நாட்டில் பொதுவாக பயன்படுத்தப்படும் நில உரிமை ஆவணங்கள், சொத்து மாற்ற நடைமுறைகள், வீட்டுவாடகையாளர் உரிமைகள் ஆகியவற்றை விளக்குகிறது.",
    learnEn: [
      "Land records: Patta, Chitta, Adangal, Field Measurement Book",
      "Property registration workflow and stamp duty basics",
      "Tenant protections and eviction-related legal principles",
    ],
    learnTa: [
      "நில ஆவணங்கள்: பட்டா, சிட்டா, அடங்கல், FMB",
      "சொத்து பதிவு நடைமுறை மற்றும் முத்திரை கட்டண அடிப்படை",
      "வாடகையாளர் பாதுகாப்பு மற்றும் வெளியேற்றம் தொடர்பான சட்டக் கருத்துக்கள்",
    ],
    referencesEn: [
      "Registration Act procedures (state implementation)",
      "Tamil Nadu land revenue record process",
      "Tenant protection principles used in TN courts",
    ],
    referencesTa: [
      "பதிவு சட்ட நடைமுறைகள் (மாநில அமலாக்கம்)",
      "தமிழ்நாடு நில வருவாய் பதிவுகள் தொடர்பான நடைமுறை",
      "தமிழ்நாடு நீதிமன்றங்களில் பயன்படும் வாடகையாளர் பாதுகாப்பு கோட்பாடுகள்",
    ],
  },
  {
    id: 2,
    icon: <Car className="w-6 h-6" />,
    titleEn: "Accident & Motor Vehicle",
    titleTa: "விபத்து & மோட்டார் வாகனம்",
    descriptionEn: "Road accidents, insurance claims, traffic violations",
    descriptionTa: "சாலை விபத்துகள், காப்பீட்டு கோரிக்கைகள், போக்குவரத்து மீறல்கள்",
    overviewEn: "Focus on immediate legal steps after road accidents, compensation claims, and interaction with police and insurance companies.",
    overviewTa: "சாலை விபத்துக்குப் பிறகு உடனடி சட்ட நடவடிக்கைகள், இழப்பீடு கோரிக்கை, போலீஸ் மற்றும் காப்பீட்டு நிறுவனங்களுடன் செயல்படும் விதம் ஆகியவற்றில் இந்த பகுதி கவனம் செலுத்துகிறது.",
    learnEn: [
      "How FIR, accident report, and medical records support a claim",
      "Motor Accident Claims Tribunal process",
      "Insurance timelines, documentation, and common rejection reasons",
    ],
    learnTa: [
      "FIR, விபத்து அறிக்கை, மருத்துவ ஆவணங்கள் கோரிக்கையில் எப்படி உதவுகின்றன",
      "மோட்டார் விபத்து கோரிக்கை தீர்ப்பாய நடைமுறை",
      "காப்பீட்டு காலவரம்பு, ஆவணங்கள், நிராகரிப்பின் பொதுவான காரணங்கள்",
    ],
    referencesEn: [
      "Motor Vehicles Act claim framework",
      "MACT filing flow and evidence checklist",
      "Traffic violation and penalty principles",
    ],
    referencesTa: [
      "மோட்டார் வாகன சட்டத்தின் கோரிக்கை அமைப்பு",
      "MACT மனுத் தாக்கல் நடைமுறை மற்றும் சான்றுகள் பட்டியல்",
      "போக்குவரத்து மீறல் மற்றும் அபராத அடிப்படை விதிகள்",
    ],
  },
  {
    id: 3,
    icon: <Briefcase className="w-6 h-6" />,
    titleEn: "Employment & Labor",
    titleTa: "வேலைவாய்ப்பு & தொழிலாளர்",
    descriptionEn: "Workplace rights, wages, termination disputes",
    descriptionTa: "பணியிட உரிமைகள், ஊதியங்கள், பணிநீக்கம் விவகாரங்கள்",
    overviewEn: "Covers wage rights, termination disputes, workplace harassment safeguards, and formal complaint routes for workers and employees.",
    overviewTa: "ஊதிய உரிமைகள், பணிநீக்கம் தொடர்பான பிரச்சினைகள், பணியிட துன்புறுத்தல் பாதுகாப்பு மற்றும் உத்தியோகப்பூர்வ புகார் நடைமுறைகள் ஆகியவற்றை இந்த பகுதி விளக்குகிறது.",
    learnEn: [
      "Minimum wages, overtime, and salary deduction rules",
      "Domestic inquiry and principles of fair termination",
      "How to approach labor office, conciliation, and labor courts",
    ],
    learnTa: [
      "குறைந்தபட்ச ஊதியம், ஓவர் டைம், சம்பளக் கழிவு விதிகள்",
      "உள்கட்டளை விசாரணை மற்றும் நியாயமான பணிநீக்க அடிப்படைகள்",
      "தொழிலாளர் அலுவலகம், சமரசம், தொழிலாளர் நீதிமன்றம் அணுகும் நடைமுறை",
    ],
    referencesEn: [
      "Shops and Establishments compliance in TN",
      "Industrial dispute handling steps",
      "Workplace harassment complaint process",
    ],
    referencesTa: [
      "தமிழ்நாட்டில் கடைகள் மற்றும் நிறுவனங்கள் இணக்கம்",
      "தொழில்துறைத் தகராறு தீர்வு நடவடிக்கைகள்",
      "பணியிட துன்புறுத்தல் புகார் நடைமுறை",
    ],
  },
  {
    id: 4,
    icon: <Heart className="w-6 h-6" />,
    titleEn: "Family & Marriage",
    titleTa: "குடும்பம் & திருமணம்",
    descriptionEn: "Divorce, maintenance, child custody, inheritance",
    descriptionTa: "விவாகரத்து, பராமரிப்பு, குழந்தை வளர்ப்பு, பாரம்பரியம்",
    overviewEn: "Designed for understanding marriage-related rights, maintenance claims, custody standards, and family settlement pathways.",
    overviewTa: "திருமணம் தொடர்பான உரிமைகள், பராமரிப்பு கோரிக்கை, குழந்தை காவல் அளவுகோல்கள் மற்றும் குடும்ப சமரச நடைமுறைகளை புரிய இந்த பகுதி உதவும்.",
    learnEn: [
      "Grounds and process for divorce and judicial separation",
      "Maintenance calculation factors for spouse, child, and parents",
      "Child custody: welfare principle and visitation arrangements",
    ],
    learnTa: [
      "விவாகரத்து மற்றும் நீதிமன்ற பிரிவிற்கான காரணங்கள், நடைமுறை",
      "மனைவி, குழந்தை, பெற்றோர் பராமரிப்பு தொகை கணக்கீட்டு காரணிகள்",
      "குழந்தை காவல்: குழந்தை நலன் அடிப்படை மற்றும் சந்திப்பு உரிமை",
    ],
    referencesEn: [
      "Family court filing and mediation route",
      "Domestic violence protection framework",
      "Succession and inheritance basics",
    ],
    referencesTa: [
      "குடும்ப நீதிமன்ற மனு மற்றும் சமரச நடைமுறை",
      "குடும்ப வன்முறை பாதுகாப்பு சட்ட அமைப்பு",
      "பாரம்பரிய உரிமை அடிப்படை கோட்பாடுகள்",
    ],
  },
  {
    id: 5,
    icon: <Scale className="w-6 h-6" />,
    titleEn: "Civil Disputes",
    titleTa: "சிவில் வழக்குகள்",
    descriptionEn: "Consumer complaints, contract issues, monetary disputes",
    descriptionTa: "நுகர்வோர் புகார்கள், ஒப்பந்த பிரச்சனைகள், பண விவகாரங்கள்",
    overviewEn: "This category gives practical understanding of civil suits, recovery claims, contract breach remedies, and consumer complaint channels.",
    overviewTa: "சிவில் வழக்கு, பண மீட்பு மனு, ஒப்பந்த மீறல் தீர்வு மற்றும் நுகர்வோர் புகார் வழிமுறைகள் பற்றிய நடைமுறை புரிதலை இந்த பகுதி வழங்குகிறது.",
    learnEn: [
      "How to issue legal notice before filing a suit",
      "Cause of action, limitation period, and court fee basics",
      "Consumer commission vs civil court selection guidance",
    ],
    learnTa: [
      "வழக்கு முன் சட்ட நோட்டீஸ் அனுப்பும் நடைமுறை",
      "Cause of action, limitation period, court fee அடிப்படை",
      "நுகர்வோர் ஆணையம் மற்றும் சிவில் நீதிமன்றம் தேர்வு வழிகாட்டல்",
    ],
    referencesEn: [
      "Civil Procedure Code fundamentals",
      "Contract enforcement pathways",
      "Consumer Protection complaint workflow",
    ],
    referencesTa: [
      "சிவில் நடைமுறைச் சட்ட அடிப்படை",
      "ஒப்பந்த அமலாக்க நடவடிக்கைகள்",
      "நுகர்வோர் பாதுகாப்பு புகார் நடைமுறை",
    ],
  },
  {
    id: 6,
    icon: <Shield className="w-6 h-6" />,
    titleEn: "Criminal Laws",
    titleTa: "குற்றவியல் சட்டங்கள்",
    descriptionEn: "FIR procedures, bail, court proceedings",
    descriptionTa: "FIR நடைமுறைகள், ஜாமீன், நீதிமன்ற நடைமுறைகள்",
    overviewEn: "Helps you study complaint registration, arrest protections, bail process, and key stages of criminal trial in plain language.",
    overviewTa: "புகார் பதிவு, கைது பாதுகாப்பு உரிமைகள், ஜாமீன் நடைமுறை மற்றும் குற்றவியல் விசாரணையின் முக்கிய கட்டங்களை எளிய முறையில் இந்த பகுதி விளக்குகிறது.",
    learnEn: [
      "Difference between complaint, CSR, and FIR",
      "Anticipatory bail, regular bail, and conditions",
      "Charge sheet timeline and trial stage overview",
    ],
    learnTa: [
      "Complaint, CSR, FIR இன் வேறுபாடு",
      "முன்ஜாமீன், சாதாரண ஜாமீன் மற்றும் நிபந்தனைகள்",
      "Charge sheet காலவரம்பு மற்றும் விசாரணை கட்டங்கள்",
    ],
    referencesEn: [
      "BNS/BNSS procedural framework",
      "Rights of accused and victim support process",
      "Police complaint escalation pathways",
    ],
    referencesTa: [
      "BNS/BNSS நடைமுறை சட்ட அமைப்பு",
      "குற்றம் சாட்டப்பட்டவர் மற்றும் பாதிக்கப்பட்டவர் உரிமைகள்",
      "போலீஸ் புகார் மேல்முறையீட்டு வழிகள்",
    ],
  },
  {
    id: 7,
    icon: <BookOpen className="w-6 h-6" />,
    titleEn: "Education Rights",
    titleTa: "கல்வி உரிமைகள்",
    descriptionEn: "Admission issues, reservation policies, fee structure",
    descriptionTa: "சேர்க்கை பிரச்சனைகள், இடஒதுக்கீடு கொள்கைகள், கட்டண அமைப்பு",
    overviewEn: "Use this section to understand admission rules, scholarship eligibility, reservation policy basics, and grievance mechanisms.",
    overviewTa: "சேர்க்கை விதிகள், உதவித்தொகை தகுதி, இடஒதுக்கீட்டு கொள்கை அடிப்படை மற்றும் புகார் தீர்வு அமைப்புகளை இந்த பகுதி அறிமுகப்படுத்துகிறது.",
    learnEn: [
      "School and college admission documentation standards",
      "Reservation matrix and certificate validation basics",
      "Fee regulation and student grievance channels",
    ],
    learnTa: [
      "பள்ளி மற்றும் கல்லூரி சேர்க்கை ஆவணத் தரநிலைகள்",
      "இடஒதுக்கீடு அமைப்பு மற்றும் சான்றிதழ் சரிபார்ப்பு அடிப்படை",
      "கட்டண கட்டுப்பாடு மற்றும் மாணவர் புகார் வழிகள்",
    ],
    referencesEn: [
      "State education department grievance route",
      "Scholarship process and common rejection reasons",
      "Student rights in private institutions",
    ],
    referencesTa: [
      "மாநிலக் கல்வித்துறை புகார் தீர்வு வழிகள்",
      "உதவித்தொகை நடைமுறை மற்றும் நிராகரிப்பு காரணங்கள்",
      "தனியார் கல்வி நிறுவனங்களில் மாணவர் உரிமைகள்",
    ],
  },
  {
    id: 8,
    icon: <Building className="w-6 h-6" />,
    titleEn: "Government Schemes",
    titleTa: "அரசு திட்டங்கள்",
    descriptionEn: "TN welfare schemes, subsidies, application procedures",
    descriptionTa: "தமிழ்நாடு நலத்திட்டங்கள், மானியங்கள், விண்ணப்ப நடைமுறைகள்",
    overviewEn: "Covers welfare eligibility checks, document readiness, benefit tracking, and appeal options if a scheme request is rejected.",
    overviewTa: "நலத்திட்ட தகுதி சரிபார்ப்பு, ஆவணத் தயாரிப்பு, பயன் நிலை கண்காணிப்பு, விண்ணப்பம் நிராகரிக்கப்பட்டால் மேல்முறையீட்டு வழிகள் ஆகியவற்றை இந்த பகுதி விளக்குகிறது.",
    learnEn: [
      "How to verify eligibility before applying",
      "Common document checklist for welfare applications",
      "How to track status and escalate delays",
    ],
    learnTa: [
      "விண்ணப்பிக்கும் முன் தகுதியை சரிபார்ப்பது எப்படி",
      "நலத்திட்ட விண்ணப்பங்களுக்கு பொதுவான ஆவணப் பட்டியல்",
      "நிலை கண்காணிப்பு மற்றும் தாமதத்திற்கு மேல்முறையீட்டு நடைமுறை",
    ],
    referencesEn: [
      "e-Sevai and district office process",
      "Subsidy and beneficiary verification workflow",
      "Appeal route for rejected applications",
    ],
    referencesTa: [
      "e-Sevai மற்றும் மாவட்ட அலுவலக நடைமுறை",
      "மானியம் மற்றும் பயனாளி சரிபார்ப்பு நடைமுறை",
      "நிராகரிக்கப்பட்ட விண்ணப்பங்களுக்கான மேல்முறையீட்டு வழி",
    ],
  },
  {
    id: 9,
    icon: <FileText className="w-6 h-6" />,
    titleEn: "RTI & Official Matters",
    titleTa: "RTI & அதிகாரப்பூர்வ விஷயங்கள்",
    descriptionEn: "Right to Information, official document procedures",
    descriptionTa: "தகவல் அறியும் உரிமை, அதிகாரப்பூர்வ ஆவண நடைமுறைகள்",
    overviewEn: "Learn how to draft RTI requests, follow statutory timelines, and approach first/second appeals for delayed or denied information.",
    overviewTa: "RTI மனு வடிவமைப்பு, சட்ட காலவரம்புகள், தகவல் தாமதம்/நிராகரிப்பு ஏற்பட்டால் முதல் மற்றும் இரண்டாம் மேல்முறையீட்டு நடைமுறைகளை இந்த பகுதி அறிய உதவும்.",
    learnEn: [
      "Correct format for RTI application and fee requirements",
      "PIO response timeline and exemptions overview",
      "First appeal and information commission escalation flow",
    ],
    learnTa: [
      "RTI மனு வடிவம் மற்றும் கட்டண நிபந்தனைகள்",
      "PIO பதில் காலவரம்பு மற்றும் விலக்கு விதிகள்",
      "முதல் மேல்முறையீடு மற்றும் தகவல் ஆணைய மேல்முறையீட்டு நடைமுறை",
    ],
    referencesEn: [
      "RTI Act process map",
      "Public record request best practices",
      "Appeal drafting checklist",
    ],
    referencesTa: [
      "RTI சட்ட நடைமுறை வரைபடம்",
      "பொது பதிவுகள் கோரிக்கை செய்யும் சிறந்த நடைமுறைகள்",
      "மேல்முறையீட்டு மனு தயாரிப்பு பட்டியல்",
    ],
  },
  {
    id: 10,
    icon: <Users className="w-6 h-6" />,
    titleEn: "Women & Child Rights",
    titleTa: "பெண்கள் & குழந்தை உரிமைகள்",
    descriptionEn: "Protection laws, harassment, child welfare",
    descriptionTa: "பாதுகாப்பு சட்டங்கள், துன்புறுத்தல், குழந்தை நலன்",
    overviewEn: "Explains legal protection against abuse, immediate safety options, support services, and child welfare complaint pathways.",
    overviewTa: "துன்புறுத்தலுக்கு எதிரான சட்ட பாதுகாப்பு, உடனடி பாதுகாப்பு நடவடிக்கைகள், ஆதரவு சேவைகள் மற்றும் குழந்தை நல புகார் வழிமுறைகள் ஆகியவற்றை இந்த பகுதி விளக்குகிறது.",
    learnEn: [
      "Domestic violence remedies and protection orders",
      "Sexual harassment complaint systems and timelines",
      "Child safety reporting and Child Welfare Committee role",
    ],
    learnTa: [
      "குடும்ப வன்முறைக்கான சட்ட நிவாரணங்கள் மற்றும் பாதுகாப்பு ஆணைகள்",
      "பாலியல் துன்புறுத்தல் புகார் அமைப்பு மற்றும் காலவரம்புகள்",
      "குழந்தை பாதுகாப்பு புகார் மற்றும் Child Welfare Committee பங்கு",
    ],
    referencesEn: [
      "POCSO and women protection legal framework",
      "One-stop center and helpline support options",
      "Compensation and rehabilitation support process",
    ],
    referencesTa: [
      "POCSO மற்றும் பெண்கள் பாதுகாப்பு சட்ட அமைப்பு",
      "One-stop center மற்றும் உதவி எண் சேவைகள்",
      "இழப்பீடு மற்றும் மீளமைப்பு உதவி நடைமுறை",
    ],
  },
  {
    id: 11,
    icon: <GraduationCap className="w-6 h-6" />,
    titleEn: "Professional Regulations",
    titleTa: "தொழில்முறை விதிமுறைகள்",
    descriptionEn: "Medical, legal, engineering professional conduct",
    descriptionTa: "மருத்துவ, சட்ட, பொறியியல் தொழில்முறை நடத்தை",
    overviewEn: "For professionals and clients to understand licensing norms, disciplinary action process, and complaint filing before regulatory bodies.",
    overviewTa: "தொழில்முறை நிபுணர்கள் மற்றும் பொதுமக்கள் உரிமைகளுக்காக உரிமம் விதிகள், ஒழுங்கு நடவடிக்கை நடைமுறை மற்றும் கட்டுப்பாட்டு அமைப்புகளில் புகார் அளிக்கும் முறைகளை இந்த பகுதி விளக்குகிறது.",
    learnEn: [
      "Registration and license renewal expectations",
      "Code of conduct and professional negligence basics",
      "Disciplinary inquiry and appeal routes",
    ],
    learnTa: [
      "பதிவு மற்றும் உரிமம் புதுப்பிப்பு நிபந்தனைகள்",
      "நடத்தை விதிமுறை மற்றும் தொழில்முறை அலட்சியம் அடிப்படை",
      "ஒழுங்கு விசாரணை மற்றும் மேல்முறையீட்டு வழிகள்",
    ],
    referencesEn: [
      "Council complaint filing sequence",
      "Documenting misconduct with evidence",
      "Sanctions and remediation options",
    ],
    referencesTa: [
      "கவுன்சில் புகார் அளிக்கும் படிநிலை நடைமுறை",
      "சான்றுகளுடன் தவறான செயல்களை பதிவு செய்வது",
      "தண்டனை மற்றும் திருத்த நடவடிக்கை வாய்ப்புகள்",
    ],
  },
  {
    id: 12,
    icon: <MessageSquare className="w-6 h-6" />,
    titleEn: "Cyber & Digital Laws",
    titleTa: "சைபர் & டிஜிட்டல் சட்டங்கள்",
    descriptionEn: "Online fraud, data privacy, digital signatures",
    descriptionTa: "ஆன்லைன் மோசடி, தரவு தனியுரிமை, டிஜிட்டல் கையொப்பங்கள்",
    overviewEn: "Covers cyber fraud reporting, social media abuse response, digital evidence preservation, and privacy-related legal actions.",
    overviewTa: "சைபர் மோசடி புகார், சமூக ஊடக துன்புறுத்தல் எதிர்வினை, டிஜிட்டல் சான்றுகள் பாதுகாப்பு மற்றும் தனியுரிமை தொடர்பான சட்ட நடவடிக்கைகளை இந்த பகுதி விளக்குகிறது.",
    learnEn: [
      "Immediate steps for online payment fraud and account compromise",
      "How to preserve screenshots, logs, and transaction records",
      "Cybercrime portal, police complaint, and follow-up process",
    ],
    learnTa: [
      "ஆன்லைன் பணமோசடி மற்றும் கணக்கு ஹேக் ஏற்பட்டால் உடனடி நடவடிக்கைகள்",
      "ஸ்கிரீன் ஷாட், லாக், பரிவர்த்தனை ஆவணங்கள் பாதுகாப்பு நடைமுறை",
      "சைபர் குற்ற தளம், போலீஸ் புகார் மற்றும் தொடர்ந்து கண்காணிக்கும் முறை",
    ],
    referencesEn: [
      "IT Act and digital evidence principles",
      "Cyber complaint filing checklist",
      "Platform reporting and grievance escalation steps",
    ],
    referencesTa: [
      "IT Act மற்றும் டிஜிட்டல் சான்றுகள் பற்றிய அடிப்படை",
      "சைபர் புகார் மனுத் தாக்கல் சரிபார்ப்பு பட்டியல்",
      "தள (platform) புகார் மற்றும் மேல்முறையீட்டு நடைமுறைகள்",
    ],
  }
];

export default function Page() {
  const { isLoaded, userId } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [chatCategory, setChatCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LegalCategory | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [studyByCategoryId, setStudyByCategoryId] = useState<Record<number, BackendCategoryStudy>>({});
  const [isStudyLoading, setIsStudyLoading] = useState(false);
  const [studyError, setStudyError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!isLoaded || !userId) {
      return () => {
        cancelled = true;
      };
    }

    const fetchCategoryStudy = async () => {
      setIsStudyLoading(true);
      setStudyError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/categories/study?language=${language}&k=8`,
          { cache: 'no-store' }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch category study (${response.status})`);
        }

        const data = await response.json() as BackendCategoryStudy[];
        const map: Record<number, BackendCategoryStudy> = {};
        for (const item of data || []) {
          if (typeof item.id === 'number') {
            map[item.id] = item;
          }
        }
        if (!cancelled) {
          setStudyByCategoryId(map);
        }
      } catch (error) {
        if (!cancelled) {
          setStudyError(error instanceof Error ? error.message : 'Failed to load category study data');
          setStudyByCategoryId({});
        }
      } finally {
        if (!cancelled) {
          setIsStudyLoading(false);
        }
      }
    };

    fetchCategoryStudy();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, userId, language]);

  const dynamicStudy = selectedCategory ? studyByCategoryId[selectedCategory.id] : undefined;
  const selectedOverview = selectedCategory
    ? (dynamicStudy?.overview || (language === 'en' ? selectedCategory.overviewEn : selectedCategory.overviewTa))
    : '';
  const selectedLearnPoints = selectedCategory
    ? (dynamicStudy?.learn_points?.length
      ? dynamicStudy.learn_points
      : (language === 'en' ? selectedCategory.learnEn : selectedCategory.learnTa))
    : [];
  const cleanedDynamicReferences = (dynamicStudy?.references || [])
    .map((ref) => String(ref).replace(/\s+/g, ' ').trim())
    .filter((ref) => ref.length > 0 && !isPdfLikeReference(ref));
  const selectedReferences = selectedCategory
    ? (cleanedDynamicReferences.length
      ? cleanedDynamicReferences
      : (language === 'en' ? selectedCategory.referencesEn : selectedCategory.referencesTa))
    : [];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-12">
          <div className="w-full rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-lg">
            <h1 className="text-2xl font-bold text-gray-900">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-12">
          <div className="w-full rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900">
              Tamil Nadu Legal AI Assistant
            </h1>
            <p className="mt-3 text-gray-600">
              Please sign in to access the legal branches and chat assistant.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <SignInButton mode="modal">
                <button className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-600 bg-white px-5 py-2.5 font-semibold text-emerald-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showChat) {
    return <ChatInterface 
      category={chatCategory}
      onBack={() => setShowChat(false)} 
      language={language}
      onLanguageChange={(lang) => setLanguage(lang)}
    />;
  }

  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white">
        <LanguageToggle language={language} onLanguageChange={(lang) => setLanguage(lang)} />
        <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-emerald-50 hover:border-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            {language === 'en' ? 'Back to all branches' : 'அனைத்து பிரிவுகளுக்கும் திரும்பு'}
          </button>

          <div className="mt-6 bg-white rounded-2xl p-6 md:p-8 border border-emerald-100 shadow-lg">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-700">
                {selectedCategory.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {language === 'en' ? selectedCategory.titleEn : selectedCategory.titleTa}
                </h2>
                <p className="text-sm text-gray-600">
                  {language === 'en' ? selectedCategory.descriptionEn : selectedCategory.descriptionTa}
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              {selectedOverview}
            </p>
            {dynamicStudy && (
              <p className="text-xs text-emerald-700 mb-4">
                {language === 'en'
                  ? `Data source: Indexed legal DB (${dynamicStudy.source_count} matched chunks)`
                  : `தரவு மூலம்: சட்ட தரவுத்தளம் (${dynamicStudy.source_count} பொருந்திய பகுதிகள்)`}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {language === 'en' ? 'What To Study' : 'படிக்க வேண்டிய முக்கிய அம்சங்கள்'}
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                  {selectedLearnPoints.map((point, index) => (
                    <li key={`${selectedCategory.id}-learn-${index}`}>{point}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {language === 'en' ? 'Acts / Process References' : 'சட்ட / நடைமுறை குறிப்புகள்'}
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                  {selectedReferences.map((ref, index) => (
                    <li key={`${selectedCategory.id}-ref-${index}`}>{ref}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setChatCategory(language === 'en' ? selectedCategory.titleEn : selectedCategory.titleTa);
                  setShowChat(true);
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:from-emerald-700 hover:to-green-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <MessageSquare className="w-4 h-4" />
                {language === 'en' ? 'Go To Start Conversation' : 'Start Conversation-க்கு செல்லவும்'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white">
      <LanguageToggle language={language} onLanguageChange={(lang) => setLanguage(lang)} />
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'Tamil Nadu Legal AI Assistant' : 'தமிழ்நாடு சட்ட AI உதவியாளர்'}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {language === 'en' 
              ? 'Get instant guidance on Tamil Nadu laws, acts, and legal procedures. Our AI-powered assistant helps you understand your rights and legal options.'
              : 'தமிழ்நாடு சட்டங்கள், சட்டங்கள் மற்றும் சட்ட நடைமுறைகள் குறித்த உடனடி வழிகாட்டலைப் பெறுங்கள். எங்கள் AI-ஆல் இயக்கப்படும் உதவியாளர் உங்கள் உரிமைகள் மற்றும் சட்ட வழிகளைப் புரிந்துகொள்ள உதவுகிறார்.'
            }
          </p>
          
          <button
            onClick={() => {
              setChatCategory(null);
              setShowChat(true);
            }}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-3 text-lg font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:from-emerald-700 hover:to-green-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <MessageSquare className="w-5 h-5" />
            {language === 'en' ? 'Start Conversation' : 'உரையாடலைத் தொடங்கவும்'}
          </button>
          
          <p className="mt-4 text-sm text-gray-500">
            {language === 'en' 
              ? 'Available in English and தமிழ்'
              : 'ஆங்கிலம் மற்றும் தமிழில் கிடைக்கும்'
            }
          </p>
        </div>

        {/* Legal Categories Grid */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
            {language === 'en' ? 'Browse 12 Legal Branches' : '12 சட்ட பிரிவுகளை உலாவு'}
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
            {language === 'en'
              ? 'Home screen shows short info only. Open any branch to view its full screen details.'
              : 'முகப்பு திரையில் சுருக்கமான தகவல் மட்டும் காட்டப்படும். எந்த பிரிவையும் திறந்து அதன் முழு திரை விவரங்களைப் பாருங்கள்.'
            }
          </p>
          <div className="mb-4 text-center">
            {isStudyLoading && (
              <p className="text-sm text-emerald-700">
                {language === 'en'
                  ? 'Loading branch study details from legal database...'
                  : 'சட்ட தரவுத்தளத்திலிருந்து பிரிவு படிப்புத் தகவல் ஏற்றப்படுகிறது...'}
              </p>
            )}
            {!isStudyLoading && studyError && (
              <p className="text-sm text-amber-700">
                {language === 'en'
                  ? 'Live DB details unavailable right now. Showing fallback notes.'
                  : 'தற்போது நேரடி தரவுத்தள தகவல் கிடைக்கவில்லை. மாற்று குறிப்புகள் காட்டப்படுகின்றன.'}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {legalCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className="group w-full text-left rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">
                      {language === 'en' ? category.titleEn : category.titleTa}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'en' ? category.descriptionEn : category.descriptionTa}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-emerald-700">
                      {language === 'en' ? 'Open branch screen' : 'பிரிவு திரையைத் திற'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            {language === 'en' ? 'How It Works' : 'இது எப்படி வேலை செய்கிறது'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-4">
                <span className="font-bold text-xl">1</span>
              </div>
              <h3 className="font-bold text-lg mb-2">
                {language === 'en' ? 'Describe Your Situation' : 'உங்கள் நிலைமையை விவரிக்கவும்'}
              </h3>
              <p className="text-gray-600">
                {language === 'en' 
                  ? 'Explain your legal issue in simple words'
                  : 'உங்கள் சட்டப் பிரச்சனையை எளிய சொற்களில் விளக்குங்கள்'
                }
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mb-4">
                <span className="font-bold text-xl">2</span>
              </div>
              <h3 className="font-bold text-lg mb-2">
                {language === 'en' ? 'AI Analysis' : 'AI பகுப்பாய்வு'}
              </h3>
              <p className="text-gray-600">
                {language === 'en' 
                  ? 'Our AI searches relevant Tamil Nadu laws and judgments'
                  : 'எங்கள் AI தொடர்புடைய தமிழ்நாடு சட்டங்கள் மற்றும் தீர்ப்புகளைத் தேடுகிறது'
                }
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-lime-100 text-lime-700 rounded-full mb-4">
                <span className="font-bold text-xl">3</span>
              </div>
              <h3 className="font-bold text-lg mb-2">
                {language === 'en' ? 'Get Guidance' : 'வழிகாட்டலைப் பெறுங்கள்'}
              </h3>
              <p className="text-gray-600">
                {language === 'en' 
                  ? 'Receive step-by-step guidance and legal references'
                  : 'படிப்படியான வழிகாட்டல் மற்றும் சட்ட குறிப்புகளைப் பெறுங்கள்'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800 text-center">
            ⚖️ {language === 'en' 
              ? 'Disclaimer: This AI assistant provides legal information based on Tamil Nadu laws. It is not a substitute for professional legal advice. Always consult a qualified lawyer for your specific situation.'
              : 'மறுப்பு: இந்த AI உதவியாளர் தமிழ்நாடு சட்டங்களை அடிப்படையாகக் கொண்ட சட்ட தகவல்களை வழங்குகிறது. இது தொழில்முறை சட்ட ஆலோசனைக்கு மாற்றாக இல்லை. உங்கள் குறிப்பிட்ட சூழ்நிலைக்கு தகுதிவாய்ந்த வழக்கறிஞரை எப்போதும் கலந்தாலோசிக்கவும்.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
