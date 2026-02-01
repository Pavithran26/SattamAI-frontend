
"use client";

import { useState } from 'react';
import { MessageSquare, BookOpen, Scale, FileText, Users, Shield, Home, Car, Briefcase, Heart, GraduationCap, Building } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';

// Tamil Nadu legal categories with Tamil translations
const legalCategories = [
  {
    id: 1,
    icon: <Home className="w-6 h-6" />,
    titleEn: "Property & Land Laws",
    titleTa: "சொத்து & நிலச் சட்டங்கள்",
    descriptionEn: "Land disputes, property registration, tenant rights",
    descriptionTa: "நில விவகாரங்கள், சொத்து பதிவு, குடியிருப்பாளர் உரிமைகள்"
  },
  {
    id: 2,
    icon: <Car className="w-6 h-6" />,
    titleEn: "Accident & Motor Vehicle",
    titleTa: "விபத்து & மோட்டார் வாகனம்",
    descriptionEn: "Road accidents, insurance claims, traffic violations",
    descriptionTa: "சாலை விபத்துகள், காப்பீட்டு கோரிக்கைகள், போக்குவரத்து மீறல்கள்"
  },
  {
    id: 3,
    icon: <Briefcase className="w-6 h-6" />,
    titleEn: "Employment & Labor",
    titleTa: "வேலைவாய்ப்பு & தொழிலாளர்",
    descriptionEn: "Workplace rights, wages, termination disputes",
    descriptionTa: "பணியிட உரிமைகள், ஊதியங்கள், பணிநீக்கம் விவகாரங்கள்"
  },
  {
    id: 4,
    icon: <Heart className="w-6 h-6" />,
    titleEn: "Family & Marriage",
    titleTa: "குடும்பம் & திருமணம்",
    descriptionEn: "Divorce, maintenance, child custody, inheritance",
    descriptionTa: "விவாகரத்து, பராமரிப்பு, குழந்தை வளர்ப்பு, பாரம்பரியம்"
  },
  {
    id: 5,
    icon: <Scale className="w-6 h-6" />,
    titleEn: "Civil Disputes",
    titleTa: "சிவில் வழக்குகள்",
    descriptionEn: "Consumer complaints, contract issues, monetary disputes",
    descriptionTa: "நுகர்வோர் புகார்கள், ஒப்பந்த பிரச்சனைகள், பண விவகாரங்கள்"
  },
  {
    id: 6,
    icon: <Shield className="w-6 h-6" />,
    titleEn: "Criminal Laws",
    titleTa: "குற்றவியல் சட்டங்கள்",
    descriptionEn: "FIR procedures, bail, court proceedings",
    descriptionTa: "FIR நடைமுறைகள், ஜாமீன், நீதிமன்ற நடைமுறைகள்"
  },
  {
    id: 7,
    icon: <BookOpen className="w-6 h-6" />,
    titleEn: "Education Rights",
    titleTa: "கல்வி உரிமைகள்",
    descriptionEn: "Admission issues, reservation policies, fee structure",
    descriptionTa: "சேர்க்கை பிரச்சனைகள், இடஒதுக்கீடு கொள்கைகள், கட்டண அமைப்பு"
  },
  {
    id: 8,
    icon: <Building className="w-6 h-6" />,
    titleEn: "Government Schemes",
    titleTa: "அரசு திட்டங்கள்",
    descriptionEn: "TN welfare schemes, subsidies, application procedures",
    descriptionTa: "தமிழ்நாடு நலத்திட்டங்கள், மானியங்கள், விண்ணப்ப நடைமுறைகள்"
  },
  {
    id: 9,
    icon: <FileText className="w-6 h-6" />,
    titleEn: "RTI & Official Matters",
    titleTa: "RTI & அதிகாரப்பூர்வ விஷயங்கள்",
    descriptionEn: "Right to Information, official document procedures",
    descriptionTa: "தகவல் அறியும் உரிமை, அதிகாரப்பூர்வ ஆவண நடைமுறைகள்"
  },
  {
    id: 10,
    icon: <Users className="w-6 h-6" />,
    titleEn: "Women & Child Rights",
    titleTa: "பெண்கள் & குழந்தை உரிமைகள்",
    descriptionEn: "Protection laws, harassment, child welfare",
    descriptionTa: "பாதுகாப்பு சட்டங்கள், துன்புறுத்தல், குழந்தை நலன்"
  },
  {
    id: 11,
    icon: <GraduationCap className="w-6 h-6" />,
    titleEn: "Professional Regulations",
    titleTa: "தொழில்முறை விதிமுறைகள்",
    descriptionEn: "Medical, legal, engineering professional conduct",
    descriptionTa: "மருத்துவ, சட்ட, பொறியியல் தொழில்முறை நடத்தை"
  },
  {
    id: 12,
    icon: <MessageSquare className="w-6 h-6" />,
    titleEn: "Cyber & Digital Laws",
    titleTa: "சைபர் & டிஜிட்டல் சட்டங்கள்",
    descriptionEn: "Online fraud, data privacy, digital signatures",
    descriptionTa: "ஆன்லைன் மோசடி, தரவு தனியுரிமை, டிஜிட்டல் கையொப்பங்கள்"
  }
];

export default function Page() {
  const [showChat, setShowChat] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'ta'>('en');

  if (showChat) {
    return <ChatInterface 
      category={selectedCategory} 
      onBack={() => setShowChat(false)} 
      language={language}
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
            onClick={() => setShowChat(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full text-lg transition-colors shadow-lg"
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
            {language === 'en' ? 'Browse by Legal Category' : 'சட்ட வகைப்படி உலாவு'}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {legalCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => {
                  setSelectedCategory(language === 'en' ? category.titleEn : category.titleTa);
                  setShowChat(true);
                }}
                className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      {language === 'en' ? category.titleEn : category.titleTa}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'en' ? category.descriptionEn : category.descriptionTa}
                    </p>
                  </div>
                </div>
              </div>
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
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
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
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-full mb-4">
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