/**
 * Localized Scheme Content Database
 * Provides authentic, full translations for all government schemes in English, Tamil, Hindi, and Telugu.
 */
import { Scheme } from '../types/schemeTypes';

export interface LocalizedSchemeContent {
  name?: string;
  shortDescription: string;
  description: string;
  categoryLabel: string;
  tag: string;
  coverageHighlight: string;
  eligibility: string[];
  benefits: string[];
  documents: string[];
  howToApply: string[];
  howToAccess: string[];
}

export const LOCALIZED_SCHEMES: Record<string, Record<'en' | 'ta' | 'hi' | 'te', LocalizedSchemeContent>> = {
  pmjay: {
    en: {
      name: 'Ayushman Bharat — PMJAY',
      shortDescription: 'Free cashless health cover up to ₹5 Lakhs per family per year for secondary & tertiary hospital care.',
      description: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY) is the world’s largest government-funded health assurance scheme. It provides a cover of ₹5 Lakh per family per year for secondary and tertiary healthcare hospitalizations across empanelled public and private hospitals across India.',
      categoryLabel: 'Health Insurance',
      tag: 'National Cover',
      coverageHighlight: '₹5,00,000 / year cashless hospital cover',
      eligibility: [
        'Families identified under the Socio-Economic Caste Census (SECC 2011) database',
        'Families with Rashtriya Swasthya Bima Yojana (RSBY) cards',
        'Rural households with kutcha walls, landless laborers, SC/ST families',
        'Urban households in identified occupational worker categories',
        'All senior citizens aged 70 years and above irrespective of income (PMJAY Vay Vandana)',
      ],
      benefits: [
        'Cashless and paperless treatment at all empanelled public and private hospitals',
        'Covers up to 3 days of pre-hospitalization and 15 days of post-hospitalization expenses',
        'Over 1,900 medical procedures covered including surgeries, oncology, cardiology, ICU care',
        'No restriction on family size, age, or gender',
        'Pre-existing conditions are covered from day one',
      ],
      documents: [
        'Aadhaar Card of beneficiary',
        'Ration Card / PMJAY Family Letter / RSBY Card',
        'Active Mobile Number linked to Aadhaar',
      ],
      howToApply: [
        'Visit the official beneficiary portal (beneficiary.nha.gov.in) or download the Ayushman App',
        'Enter your mobile number and authenticate via OTP',
        'Search for your name in the PMJAY database using Aadhaar or Ration Card number',
        'Complete instant e-KYC using Aadhaar OTP / Iris / Face authentication',
        'Download and print your official Ayushman Card (Golden Card)',
      ],
      howToAccess: [
        'Visit any Ayushman-empanelled government or private hospital',
        'Approach the "Ayushman Mitra" helpdesk in the registration area',
        'Present your Ayushman Card or Aadhaar number for instant admission authorization',
      ],
    },
    ta: {
      name: 'ஆயுஷ்மான் பாரத் — PMJAY',
      shortDescription: 'குடும்பத்திற்கு ஆண்டிற்கு ₹5 லட்சம் வரை இலவச மருத்துவ சிகிச்சை காப்பீடு.',
      description: 'ஆயுஷ்மான் பாரத் பிரதான் மந்திரி ஜன் ஆரோக்கிய யோஜனா (AB-PMJAY) உலகின் மிகப்பெரிய அரசாங்க சுகாதார திட்டமாகும். இது இந்தியா முழுவதும் உள்ள அங்கீகரிக்கப்பட்ட அரசு மற்றும் தனியார் மருத்துவமனைகளில் குடும்பத்திற்கு ஆண்டிற்கு ₹5 லட்சம் வரை கட்டணமில்லா சிகிச்சை வழங்குகிறது.',
      categoryLabel: 'மருத்துவ காப்பீடு',
      tag: 'தேசிய காப்பீடு',
      coverageHighlight: 'ஆண்டிற்கு ₹5,00,000 கட்டணமில்லா மருத்துவமனை சிகிச்சை',
      eligibility: [
        'SECC 2011 சமூக-பொருளாதார கணக்கெடுப்பில் அடையாளம் காணப்பட்ட குடும்பங்கள்',
        'ராஷ்ட்ரிய ஸ்வஸ்திய பீமா யோஜனா (RSBY) அட்டைதாரர்கள்',
        'நிலமற்ற தொழிலாளர்கள், பட்டியல்/பழங்குடியின கிராமப்புற குடும்பங்கள்',
        'குறிப்பிட்ட முறைசாரா தொழிலாளர்கள் மற்றும் நகர்ப்புற ஏழைகள்',
        'வருமான வரம்பின்றி 70 வயது மற்றும் அதற்கு மேற்பட்ட அனைத்து மூத்த குடிமக்கள் (வயோ வந்தனா)',
      ],
      benefits: [
        'அங்கீகரிக்கப்பட்ட அனைத்து அரசு மற்றும் தனியார் மருத்துவமனைகளில் பணமில்லா சிகிச்சை',
        'மருத்துவமனை சேர்ப்புக்கு முன் 3 நாட்கள் மற்றும் பின் 15 நாட்கள் செலவுகள் அடங்கும்',
        'அறுவை சிகிச்சைகள், இதய சிகிச்சை, புற்றுநோய், தீவிர சிகிச்சை உள்ளிட்ட 1,900+ சிகிச்சைகள்',
        'குடும்ப உறுப்பினர் எண்ணிக்கை, வயது அல்லது பாலின வரம்பு இல்லை',
        'முந்தைய நோய்களும் முதல் நாளிலிருந்தே காப்பீட்டில் அடங்கும்',
      ],
      documents: [
        'பயனாளியின் ஆதார் அட்டை',
        'ரேஷன் கார்டு / PMJAY குடும்ப கடிதம் / RSBY அட்டை',
        'ஆதாருடன் இணைக்கப்பட்ட அலைபேசி எண்',
      ],
      howToApply: [
        'அதிகாரப்பூர்வ தளத்தை (beneficiary.nha.gov.in) பார்வையிடவும் அல்லது ஆயுஷ்மான் செயலியை பதிவிறக்கவும்',
        'உங்கள் அலைபேசி எண்ணை உள்ளிட்டு OTP மூலம் சரிபார்க்கவும்',
        'ஆதார் அல்லது ரேஷன் அட்டை எண்ணைப் பயன்படுத்தி உங்கள் பெயரைத் தேடவும்',
        'ஆதார் OTP அல்லது முகம் சரிபார்ப்பு மூலம் e-KYC முடிக்கவும்',
        'உங்கள் அதிகாரப்பூர்வ ஆயுஷ்மான் தங்க அட்டையை பதிவிறக்கி அச்சிடவும்',
      ],
      howToAccess: [
        'ஆயுஷ்மான் திட்டத்துடன் இணைந்த ஏதேனும் அரசு அல்லது தனியார் மருத்துவமனைக்குச் செல்லவும்',
        'பதிவுப் பகுதியில் உள்ள "ஆயுஷ்மான் மித்ரா" உதவி மையத்தை அணுகவும்',
        'உடனடி அனுமதிக்கு உங்கள் ஆயுஷ்மான் அட்டை அல்லது ஆதார் எண்ணைக் காண்பிக்கவும்',
      ],
    },
    hi: {
      name: 'आयुष्मान भारत — PMJAY',
      shortDescription: 'प्रति परिवार प्रति वर्ष ₹5 लाख तक का मुफ्त कैशलेस स्वास्थ्य बीमा।',
      description: 'आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना (AB-PMJAY) दुनिया की सबसे बड़ी सरकारी स्वास्थ्य योजना है। यह देश भर के सूचीबद्ध सरकारी और निजी अस्पतालों में द्वितीयक और तृतीयक देखभाल के लिए प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस इलाज प्रदान करती है।',
      categoryLabel: 'स्वास्थ्य बीमा',
      tag: 'राष्ट्रीय सुरक्षा',
      coverageHighlight: '₹5,00,000 / वर्ष मुफ्त अस्पताल इलाज',
      eligibility: [
        'सामाजिक आर्थिक जाति जनगणना (SECC 2011) डेटाबेस के अंतर्गत आने वाले परिवार',
        'राष्ट्रीय स्वास्थ्य बीमा योजना (RSBY) कार्डधारक परिवार',
        'कच्चे मकानों में रहने वाले, भूमिहीन मजदूर, अनुसूचित जाति/जनजाति के ग्रामीण परिवार',
        'पहचाने गए असंगठित व्यावसायिक श्रेणियों के शहरी परिवार',
        'आय की सीमा के बिना 70 वर्ष और उससे अधिक आयु के सभी वरिष्ठ नागरिक (वय वंदना)',
      ],
      benefits: [
        'सभी सूचीबद्ध सरकारी और निजी अस्पतालों में कैशलेस और पेपरलेस इलाज',
        'अस्पताल में भर्ती होने से 3 दिन पहले और 15 दिन बाद तक का खर्च शामिल',
        'सर्जरी, कैंसर, हृदय रोग, आईसीयू सहित 1,900 से अधिक उपचार कवर',
        'परिवार के आकार, आयु या लिंग पर कोई प्रतिबंध नहीं',
        'पहले से मौजूद बीमारियां पहले दिन से ही कवर हैं',
      ],
      documents: [
        'लाभार्थी का आधार कार्ड',
        'राशन कार्ड / PMJAY परिवार पत्र / RSBY कार्ड',
        'आधार से लिंक सक्रिय मोबाइल नंबर',
      ],
      howToApply: [
        'आधिकारिक पोर्टल (beneficiary.nha.gov.in) पर जाएं या आयुष्मान ऐप डाउनलोड करें',
        'अपना मोबाइल नंबर दर्ज करें और OTP से सत्यापित करें',
        'आधार या राशन कार्ड नंबर से PMJAY डेटाबेस में अपना नाम खोजें',
        'आधार OTP या फेस ऑथेंटिकेशन से तुरंत e-KYC पूरा करें',
        'अपना आधिकारिक आयुष्मान कार्ड (गोल्डन कार्ड) डाउनलोड और प्रिंट करें',
      ],
      howToAccess: [
        'किसी भी आयुष्मान-सूचीबद्ध सरकारी या निजी अस्पताल में जाएं',
        'पंजीकरण क्षेत्र में "आयुष्मान मित्र" हेल्पडेस्क से संपर्क करें',
        'तुरंत प्रवेश और उपचार के लिए अपना आयुष्मान कार्ड या आधार दिखाएं',
      ],
    },
    te: {
      name: 'ఆయుష్మాన్ భారత్ — PMJAY',
      shortDescription: 'ద్వితీయ, తృతీయ ఆసుపత్రి సంరక్షణ కోసం కుటుంబానికి సంవత్సరానికి ₹5 లక్షల వరకు ఉచిత నగదు రహిత చికిత్స.',
      description: 'ఆయుష్మాన్ భారత్ ప్రధాన మంత్రి జన్ ఆరోగ్య యోజన (AB-PMJAY) ప్రపంచంలోనే అతిపెద్ద ప్రభుత్వ ఆరోగ్య రక్షణ పథకం. ఇది భారతదేశవ్యాప్తంగా నమోదైన ప్రభుత్వ మరియు ప్రైవేట్ ఆసుపత్రులలో కుటుంబానికి సంవత్సరానికి ₹5 లక్షల వరకు ఉచిత చికిత్సను అందిస్తుంది.',
      categoryLabel: 'ఆరోగ్య బీమా',
      tag: 'జాతీయ భరోసా',
      coverageHighlight: 'సంవత్సరానికి ₹5,00,000 ఉచిత ఆసుపత్రి చికిత్స',
      eligibility: [
        'SECC 2011 సామాజిక-ఆర్థిక కుల గణన డేటాబేస్ క్రింద గుర్తించబడిన కుటుంబాలు',
        'రాష్ట్రీయ స్వస్థ్య బీమా యోజన (RSBY) కార్డు కలిగిన కుటుంబాలు',
        'మట్టి ఇళ్లలో నివసించేవారు, భూమిలేని కూలీలు, SC/ST గ్రామీణ కుటుంబాలు',
        'గుర్తించిన అసంఘటిత రంగ కార్మికుల పట్టణ కుటుంబాలు',
        'ఆదాయంతో సంబంధం లేకుండా 70 ఏళ్లు పైబడిన వృద్ధులందరూ (వయో వందన)',
      ],
      benefits: [
        'నమోదైన ప్రభుత్వ మరియు ప్రైవేట్ ఆసుపత్రులలో నగదు రహిత చికిత్స',
        'ఆసుపత్రిలో చేరడానికి 3 రోజుల ముందు మరియు 15 రోజుల తర్వాత ఖర్చులు వర్తిస్తాయి',
        'శస్త్రచికిత్సలు, గుండెజబ్బులు, క్యాన్సర్, ICU తో సహా 1,900+ చికిత్సలు వర్తిస్తాయి',
        'కుటుంబ పరిమాణం, వయస్సు లేదా లింగంపై ఎటువంటి పరిమితి లేదు',
        'మునుపటి అనారోగ్యాలు మొదటి రోజు నుంచే వర్తిస్తాయి',
      ],
      documents: [
        'లబ్ధిదారుని ఆధార్ కార్డు',
        'రేషన్ కార్డు / PMJAY కుటుంబ లేఖ / RSBY కార్డు',
        'ఆధార్‌తో అనుసంధానించబడిన మొబైల్ నంబర్',
      ],
      howToApply: [
        'అధికారిక లబ్ధిదారుల పోర్టల్ (beneficiary.nha.gov.in) లేదా ఆయుష్మాన్ యాప్‌ను డౌన్‌లోడ్ చేయండి',
        'మొబైల్ నంబర్ నమోదు చేసి OTP ద్వారా లాగిన్ అవ్వండి',
        'ఆధార్ లేదా రేషన్ కార్డు నంబర్‌తో మీ పేరును వెతకండి',
        'ఆధార్ OTP లేదా ముఖ ధృవీకరణ ద్వారా e-KYC పూర్తి చేయండి',
        'మీ అధికారిక ఆయుష్మాన్ కార్డును డౌన్‌లోడ్ చేసి ప్రింట్ తీసుకోండి',
      ],
      howToAccess: [
        'ఆయుష్మాన్ నమోదైన ఏదైనా ప్రభుత్వ లేదా ప్రైవేట్ ఆసుపత్రికి వెళ్లండి',
        'రిజిస్ట్రేషన్ విభాగంలో "ఆయుష్మాన్ మిత్ర" హెల్ప్‌డెస్క్‌ను సంప్రదించండి',
        'తక్షణ ప్రవేశం కొరకు ఆయుష్మాన్ కార్డు లేదా ఆధార్ సంఖ్యను చూపించండి',
      ],
    },
  },

  jsy: {
    en: {
      name: 'Janani Suraksha Yojana (JSY)',
      shortDescription: 'Direct financial cash assistance for pregnant mothers undergoing institutional delivery.',
      description: 'Janani Suraksha Yojana (JSY) is a safe motherhood intervention under the National Health Mission (NHM). It is being implemented with the objective of reducing maternal and neonatal mortality by promoting institutional delivery among poor pregnant women.',
      categoryLabel: 'Maternity',
      tag: 'Safe Motherhood',
      coverageHighlight: '₹1,400 (Rural) / ₹1,000 (Urban) cash incentive',
      eligibility: [
        'All pregnant women delivering in government health centers or accredited private hospitals',
        'Special focus on Low Performing States (LPS) across all categories',
        'BPL / SC / ST women in High Performing States (HPS) for institutional delivery',
        'Age 19 years and above up to first two live births (in certain states)',
      ],
      benefits: [
        'Direct cash transfer of ₹1,400 for rural mothers and ₹1,000 for urban mothers in LPS states',
        'Free transport assistance for reaching the health facility',
        'ASHA worker incentive for tracking ANC checkups and escorting mother for delivery',
        'Post-delivery care and initial neonatal health checkup',
      ],
      documents: [
        'Mother & Child Protection (MCP) Card issued by ANM/ASHA',
        'Aadhaar Card of pregnant mother',
        'Bank Account Passbook (Aadhaar linked for DBT)',
        'BPL / Ration Card (where applicable)',
      ],
      howToApply: [
        'Register your pregnancy with the local ASHA or ANM worker at the nearest Anganwadi or PHC',
        'Obtain the Mother & Child Protection (MCP) card with recorded Ante-Natal Care (ANC) visits',
        'Provide your bank account details and Aadhaar copy during registration',
        'Deliver at an accredited public health center or Community Health Center (CHC)',
        'Cash incentive is directly credited to your bank account via DBT post-delivery',
      ],
      howToAccess: [
        'Contact your area ASHA worker or visit the nearest Primary Health Center (PHC)',
        'Dial 102/108 National Ambulance service for emergency transportation to the delivery center',
      ],
    },
    ta: {
      name: 'ஜனனி சுரக்ஷா யோஜனா (JSY)',
      shortDescription: 'அரசு மருத்துவமனைகளில் பிரசவம் பார்க்கும் தாய்மார்களுக்கு நேரடி நிதி உதவி.',
      description: 'ஜனனி சுரக்ஷா யோஜனா (JSY) என்பது தேசிய சுகாதார இயக்கத்தின் கீழ் செயல்படுத்தப்படும் தாய்-சேய் பாதுகாப்புத் திட்டமாகும். ஏழை கர்ப்பிணிப் பெண்கள் மருத்துவமனைகளில் பாதுகாப்பான பிரசவம் அடைவதை ஊக்குவிப்பதே இதன் நோக்கமாகும்.',
      categoryLabel: 'மகப்பேறு',
      tag: 'பாதுகாப்பான தாய்மை',
      coverageHighlight: '₹1,400 (கிராமப்புறம்) / ₹1,000 (நகர்ப்புறம்) நிதி உதவி',
      eligibility: [
        'அரசு மருத்துவமனைகளில் அல்லது அங்கீகரிக்கப்பட்ட மையங்களில் பிரசவம் பார்க்கும் அனைத்து கர்ப்பிணிகள்',
        'கிராமப்புற மற்றும் நகர்ப்புற வறுமைக்கோடு கீழ் உள்ள (BPL) பெண்கள்',
        'பட்டியலின மற்றும் பழங்குடியின தாய்மார்கள்',
        '19 வயது மற்றும் அதற்கு மேற்பட்ட தாய்மார்கள்',
      ],
      benefits: [
        'கிராமப்புற தாய்மார்களுக்கு ₹1,400 மற்றும் நகர்ப்புற தாய்மார்களுக்கு ₹1,000 நேரடி வங்கி பணப்பரிமாற்றம்',
        'மருத்துவமனைக்குச் செல்ல இலவச ஆம்புலன்ஸ் போக்குவரத்து வசதி',
        'பிரசவத்திற்கு பின் தொடர் தாய்-சேய் நலம் மற்றும் ஊட்டச்சத்து வழிகாட்டுதல்',
        'ஆஷா பணியாளரின் தொடர் உதவி மற்றும் மருத்துவ கண்காணிப்பு',
      ],
      documents: [
        'ஆஷா/ANM வழங்கிய தாய்-சேய் பாதுகாப்பு (MCP) அட்டை',
        'தாயின் ஆதார் அட்டை',
        'ஆதாருடன் இணைக்கப்பட்ட வங்கி கணக்கு புத்தகம்',
        'ரேஷன் கார்டு அல்லது BPL அட்டை',
      ],
      howToApply: [
        'அருகிலுள்ள அங்கன்வாடி அல்லது ஆரம்ப சுகாதார நிலையத்தில் ஆஷா பணியாளரிடம் கர்ப்பத்தை பதிவு செய்யவும்',
        'தாய்-சேய் பாதுகாப்பு அட்டையைப் (MCP Card) பெற்று பரிசோதனைகளை பதிவு செய்யவும்',
        'பதிவின் போது ஆதார் மற்றும் வங்கி கணக்கு விவரங்களை வழங்கவும்',
        'அரசு ஆரம்ப சுகாதார நிலையம் அல்லது மருத்துவமனையில் பிரசவம் பார்க்கவும்',
        'பிரசவத்திற்குப் பிறகு பணம் நேரடியாக உங்கள் வங்கிக் கணக்கில் வரவு வைக்கப்படும்',
      ],
      howToAccess: [
        'உங்கள் பகுதி ஆஷா பணியாளரை அல்லது ஆரம்ப சுகாதார நிலையத்தை (PHC) தொடர்பு கொள்ளவும்',
        'அவசர பிரசவ போக்குவரத்திற்கு 102/108 ஆம்புலன்ஸ் எண்ணை அழைக்கவும்',
      ],
    },
    hi: {
      name: 'जननी सुरक्षा योजना (JSY)',
      shortDescription: 'संस्थागत प्रसव कराने वाली गर्भवती महिलाओं के लिए प्रत्यक्ष वित्तीय नकद सहायता।',
      description: 'जननी सुरक्षा योजना (JSY) राष्ट्रीय स्वास्थ्य मिशन (NHM) के तहत सुरक्षित मातृत्व हस्तक्षेप है। इसका उद्देश्य गरीब गर्भवती महिलाओं में संस्थागत प्रसव को बढ़ावा देकर मातृ एवं नवजात मृत्यु दर को कम करना है।',
      categoryLabel: 'मातृत्व सहायता',
      tag: 'सुरक्षित मातृत्व',
      coverageHighlight: '₹1,400 (ग्रामीण) / ₹1,000 (शहरी) नकद सहायता',
      eligibility: [
        'सरकारी स्वास्थ्य केंद्रों या मान्यता प्राप्त निजी अस्पतालों में प्रसव कराने वाली सभी गर्भवती महिलाएं',
        'कम प्रदर्शन करने वाले राज्यों (LPS) की सभी श्रेणियों की महिलाएं',
        'उच्च प्रदर्शन करने वाले राज्यों (HPS) में BPL / SC / ST वर्ग की महिलाएं',
        '19 वर्ष या उससे अधिक आयु की गर्भवती महिलाएं',
      ],
      benefits: [
        'ग्रामीण माताओं को ₹1,400 और शहरी माताओं को ₹1,000 का सीधा बैंक खाता हस्तांतरण (DBT)',
        'अस्पताल तक पहुँचने के लिए मुफ्त एम्बुलेंस और परिवहन सहायता',
        'प्रसवपूर्व जांच और अस्पताल ले जाने में आशा कार्यकर्ता की निरंतर सहायता',
        'प्रसव पश्चात देखभाल और नवजात शिशु की मुफ्त प्राथमिक जांच',
      ],
      documents: [
        'ANM/आशा द्वारा जारी मातृ एवं शिशु सुरक्षा (MCP) कार्ड',
        'गर्भवती माता का आधार कार्ड',
        'आधार से लिंक बैंक खाता पासबुक (DBT के लिए)',
        'राशन कार्ड / बीपीएल कार्ड',
      ],
      howToApply: [
        'निकटतम आंगनवाड़ी या प्राथमिक स्वास्थ्य केंद्र (PHC) पर आशा कार्यकर्ता के पास गर्भावस्था का पंजीकरण कराएं',
        'नियमित जांच (ANC) दर्ज कराने के लिए MCP कार्ड प्राप्त करें',
        'पंजीकरण के समय बैंक खाता विवरण और आधार की प्रति जमा करें',
        'सरकारी स्वास्थ्य केंद्र में संस्थागत प्रसव कराएं',
        'प्रसव के बाद नकद प्रोत्साहन राशि सीधे आपके बैंक खाते में जमा होगी',
      ],
      howToAccess: [
        'अपनी स्थानीय आशा कार्यकर्ता या प्राथमिक स्वास्थ्य केंद्र (PHC) से संपर्क करें',
        'अस्पताल जाने के लिए 102 या 108 एम्बुलेंस सेवा पर कॉल करें',
      ],
    },
    te: {
      name: 'జననీ సురక్ష యోజన (JSY)',
      shortDescription: 'ప్రభుత్వ ఆసుపత్రులలో సురక్షిత ప్రసవం పొందే గర్భిణీ స్త్రీలకు ప్రత్యక్ష నగదు ఆర్థిక సహాయం.',
      description: 'జననీ సురక్ష యోజన (JSY) అనేది జాతీయ ఆరోగ్య మిషన్ కింద సురక్షిత మాతృత్వ కార్యక్రమం. పేద గర్భిణీ స్త్రీలు ఆసుపత్రులలో సురక్షిత కాన్పులు చేసుకునేలా ప్రోత్సహించడం ద్వారా తల్లి మరియు నవజాత శిశువుల మరణాలను తగ్గించడం దీని ముఖ్య ఉద్దేశం.',
      categoryLabel: 'మాతృత్వ సంరక్షణ',
      tag: 'సురక్షిత మాతృత్వం',
      coverageHighlight: '₹1,400 (గ్రామీణ) / ₹1,000 (పట్టణ) నగదు ప్రోత్సాహకం',
      eligibility: [
        'ప్రభుత్వ ఆసుపత్రులు లేదా గుర్తింపు పొందిన కేంద్రాలలో ప్రసవించే గర్భిణులందరూ',
        'గ్రామీణ మరియు పట్టణ ప్రాంతాల దారిద్య్రరేఖకు దిగువన ఉన్న (BPL) మహిళలు',
        'SC / ST వర్గాలకు చెందిన గర్భిణీ స్త్రీలు',
        '19 సంవత్సరాలు మరియు అంతకంటే ఎక్కువ వయస్సు ఉన్న తల్లులు',
      ],
      benefits: [
        'గ్రామీణ తల్లులకు ₹1,400 మరియు పట్టణ తల్లులకు ₹1,000 నేరుగా బ్యాంక్ ఖాతాలో జమ',
        'ఆసుపత్రికి వెళ్ళడానికి ఉచిత అంబులెన్స్ రవాణా సదుపాయం',
        'ఆశా కార్యకర్త ద్వారా గర్భధారణ కాలంలో నిరంతర సహాయం మరియు మార్గదర్శకత్వం',
        'ప్రసవానంతర సంరక్షణ మరియు శిశువుకు ఉచిత ఆరోగ్య పరీక్షలు',
      ],
      documents: [
        'తల్లి మరియు శిశు సంరక్షణ (MCP) కార్డు',
        'గర్భిణీ స్త్రీ ఆధార్ కార్డు',
        'ఆధార్‌తో అనుసంధానించబడిన బ్యాంక్ ఖాతా పాస్‌బుక్',
        'రేషన్ కార్డు లేదా BPL కార్డు',
      ],
      howToApply: [
        'సమీప అంగన్‌వాడీ లేదా ప్రాథమిక ఆరోగ్య కేంద్రంలో ఆశా కార్యకర్త వద్ద గర్భాన్ని నమోదు చేసుకోండి',
        'MCP కార్డును పొంది క్రమం తప్పకుండా వైద్య పరీక్షలు చేయించుకోండి',
        'నమోదు సమయంలో ఆధార్ మరియు బ్యాంక్ ఖాతా వివరాలను అందించండి',
        'ప్రభుత్వ ఆసుపత్రిలో సురక్షిత ప్రసవం పొందండి',
        'ప్రసవం తర్వాత నగదు ప్రోత్సాహకం నేరుగా మీ బ్యాంక్ ఖాతాలో జమ అవుతుంది',
      ],
      howToAccess: [
        'మీ ప్రాంత ఆశా కార్యకర్తను లేదా సమీప ప్రాథమిక ఆరోగ్య కేంద్రాన్ని (PHC) సంప్రదించండి',
        'అత్యవసర ప్రసవ రవాణా కోసం 102/108 అంబులెన్స్‌కు కాల్ చేయండి',
      ],
    },
  },

  pmmvy: {
    en: {
      name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
      shortDescription: 'Maternity cash benefit of ₹5,000 to ₹6,000 to compensate wage loss and improve maternal nutrition.',
      description: 'PMMVY is a centrally sponsored Direct Benefit Transfer (DBT) scheme executed by the Ministry of Women and Child Development. It provides partial wage compensation to pregnant women and lactating mothers for health seeking behavior and nutritious diet during pregnancy and lactation.',
      categoryLabel: 'Maternity & Nutrition',
      tag: 'DBT Cash Benefit',
      coverageHighlight: '₹5,00,000 / year cashless hospital cover',
      eligibility: [
        'Pregnant Women and Lactating Mothers (PW&LM) for the first child (₹5,000 in two installments)',
        'For the second child, benefit of ₹6,000 is available if the second child is a girl',
        'Family income less than ₹8 Lakh per year or holding e-Shram / BPL / PMJAY / Kisan Card',
        'Excludes regular employees of Central / State Government or PSUs',
      ],
      benefits: [
        '₹5,000 transferred in 2 installments for the first live child (upon early registration + 1 ANC, and child birth registration + 14-week vaccinations)',
        '₹6,000 in a single installment for a second girl child',
        'Direct credit into the mother’s Aadhaar-seeded bank account',
      ],
      documents: [
        'Aadhaar Card of beneficiary mother and husband',
        'Mother and Child Protection (MCP) Card with recorded ANC dates',
        'Beneficiary’s bank account passbook linked to Aadhaar',
        'Child Birth Certificate (for 2nd installment)',
      ],
      howToApply: [
        'Apply online on the official PMMVY Citizen Portal (pmmvy.wcd.gov.in) or visit nearest Anganwadi Center',
        'Citizen login using mobile number and OTP verification',
        'Fill Form 1A with MCP card details, LMP date, and bank account information',
        'Submit verification documents online or through the local Anganwadi worker',
      ],
      howToAccess: [
        'Visit your local Anganwadi Center (AWC) or Primary Health Center',
        'Anganwadi workers assist in digital registration on the PMMVY soft portal',
      ],
    },
    ta: {
      name: 'பிரதான் மந்திரி மாத்ரு வந்தனா யோஜனா (PMMVY)',
      shortDescription: 'கர்ப்பிணிப் பெண்களுக்கு ஊட்டச்சத்து மற்றும் கூலி இழப்பை ஈடுசெய்ய ₹5,000 முதல் ₹6,000 வரை நிதியுதவி.',
      description: 'PMMVY என்பது பெண்கள் மற்றும் குழந்தைகள் மேம்பாட்டு அமைச்சகத்தின் நேரடி பணப்பரிமாற்ற திட்டமாகும். கர்ப்ப காலத்திலும் பாலூட்டும் காலத்திலும் தாய்மார்களின் ஊட்டச்சத்தை மேம்படுத்த நிதி உதவி வழங்கப்படுகிறது.',
      categoryLabel: 'மகப்பேறு & ஊட்டச்சத்து',
      tag: 'நேரடி பண உதவி',
      coverageHighlight: 'முதல் குழந்தைக்கு ₹5,000 / பெண் குழந்தைக்கு ₹6,000',
      eligibility: [
        'முதல் குழந்தை பிறப்பிற்கு கர்ப்பிணிகள் மற்றும் பாலூட்டும் தாய்மார்கள் (₹5,000 இரு தவணைகளில்)',
        'இரண்டாவது குழந்தை பெண் குழந்தையாக இருந்தால் ₹6,000 ஒரே தவணையில் கிடைக்கும்',
        'குடும்ப ஆண்டு வருமானம் ₹8 லட்சத்திற்குக் கீழ் உள்ளவர்கள் அல்லது இ-ஷ்ரம்/BPL/PMJAY அட்டைதாரர்கள்',
        'அரசு மற்றும் பொதுத்துறை ஊழியர்கள் இத்திட்டத்தில் பயன்பெற முடியாது',
      ],
      benefits: [
        'முதல் குழந்தைக்கு 2 தவணைகளில் ₹5,000 நேரடி வங்கி வரவு',
        'இரண்டாவது பெண் குழந்தைக்கு ₹6,000 ஒற்றைத் தவணையில் வரவு',
        'ஆதாருடன் இணைக்கப்பட்ட தாயின் வங்கிக் கணக்கிற்கு நேரடியாக DBT மூலம் செலுத்தப்படும்',
      ],
      documents: [
        'தாய் மற்றும் கணவரின் ஆதார் அட்டை',
        'பரிசோதனைகள் பதிவு செய்யப்பட்ட MCP அட்டை',
        'ஆதாருடன் இணைக்கப்பட்ட தாயின் வங்கி கணக்கு புத்தகம்',
        'குழந்தையின் பிறப்புச் சான்றிதழ் (2வது தவணைக்கு)',
      ],
      howToApply: [
        'அதிகாரப்பூர்வ PMMVY இணையதளத்தில் (pmmvy.wcd.gov.in) அல்லது அங்கன்வாடி மையத்தில் விண்ணப்பிக்கவும்',
        'அலைபேசி எண் மூலம் உள்நுழைந்து படிவத்தை நிரப்பவும்',
        'MCP அட்டை விவரங்கள் மற்றும் வங்கிக் கணக்கு தகவல்களை உள்ளிடவும்',
        'அங்கன்வாடி பணியாளர் மூலம் சரிபார்ப்பு ஆவணங்களை சமர்ப்பிக்கவும்',
      ],
      howToAccess: [
        'உங்கள் உள்ளூர் அங்கன்வாடி மையம் (AWC) அல்லது ஆரம்ப சுகாதார நிலையத்தை அணுகவும்',
        'அங்கன்வாடி பணியாளர்கள் இணையதள பதிவிற்கு முழு உதவி வழங்குவார்கள்',
      ],
    },
    hi: {
      name: 'प्रधानमंत्री मातृ वंदना योजना (PMMVY)',
      shortDescription: 'गर्भवती महिलाओं को पोषण और मजदूरी क्षतिपूर्ति के लिए ₹5,000 से ₹6,000 की मातृत्व नकद सहायता।',
      description: 'PMMVY महिला एवं बाल विकास मंत्रालय द्वारा संचालित एक प्रत्यक्ष लाभ अंतरण (DBT) योजना है। यह गर्भावस्था और स्तनपान के दौरान महिलाओं के पोषण और स्वास्थ्य सुधार के लिए नकद सहायता प्रदान करती है।',
      categoryLabel: 'मातृत्व एवं पोषण',
      tag: 'DBT नकद लाभ',
      coverageHighlight: 'प्रथम शिशु पर ₹5,000 / द्वितीय कन्या पर ₹6,000',
      eligibility: [
        'प्रथम जीवित बच्चे के लिए गर्भवती और स्तनपान कराने वाली माताएं (दो किश्तों में ₹5,000)',
        'दूसरी संतान बालिका होने पर ₹6,000 की एकमुश्त सहायता',
        'परिवार की वार्षिक आय ₹8 लाख से कम हो या ई-श्रम/BPL/PMJAY कार्डधारक हों',
        'सरकारी या सार्वजनिक क्षेत्र के नियमित कर्मचारियों को छोड़कर',
      ],
      benefits: [
        'प्रथम बच्चे के लिए ₹5,000 की राशि 2 किश्तों में सीधे बैंक खाते में',
        'दूसरी कन्या संतान होने पर ₹6,000 की एकमुश्त वित्तीय सहायता',
        'माता के आधार-लिंक्ड बैंक खाते में सीधा DBT भुगतान',
      ],
      documents: [
        'गर्भवती माता और पति का आधार कार्ड',
        'ANC जांच विवरण सहित MCP कार्ड',
        'आधार से लिंक माता का बैंक खाता पासबुक',
        'शिशु का जन्म प्रमाण पत्र (दूसरी किश्त के लिए)',
      ],
      howToApply: [
        'आधिकारिक PMMVY पोर्टल (pmmvy.wcd.gov.in) पर ऑनलाइन आवेदन करें या नजदीकी आंगनवाड़ी जाएं',
        'मोबाइल नंबर से लॉगिन करें और फॉर्म भरें',
        'MCP कार्ड और बैंक खाते की जानकारी दर्ज करें',
        'आंगनवाड़ी कार्यकर्ता के माध्यम से आवश्यक दस्तावेज सत्यापित कराएं',
      ],
      howToAccess: [
        'अपने स्थानीय आंगनवाड़ी केंद्र (AWC) या प्राथमिक स्वास्थ्य केंद्र पर जाएं',
        'आंगनवाड़ी कार्यकर्ता डिजिटल पंजीकरण में पूर्ण सहायता करती हैं',
      ],
    },
    te: {
      name: 'ప్రధాన మంత్రి మాతృ వందన యోజన (PMMVY)',
      shortDescription: 'పోషకాహారం మరియు వేతన నష్ట పరిహారం కోసం గర్భిణీలకు ₹5,000 నుండి ₹6,000 వరకు నగదు సహాయం.',
      description: 'PMMVY అనేది మహిళా మరియు శిశు సంక్షేమ మంత్రిత్వ శాఖ ద్వారా అమలు చేయబడుతున్న ప్రత్యక్ష నగదు బదిలీ పథకం. గర్భధారణ సమయంలో తల్లుల పోషకాహార అవసరాలు మరియు ఆరోగ్య సంరక్షణ కోసం ఆర్థిక సహాయం అందుతుంది.',
      categoryLabel: 'మాతృత్వ & పోషకాహారం',
      tag: 'నగదు బదిలీ సహాయం',
      coverageHighlight: 'మొదటి బిడ్డకు ₹5,000 / రెండవ ఆడపిల్లకు ₹6,000',
      eligibility: [
        'మొదటి కాన్పు గర్భిణీ స్త్రీలకు ₹5,000 (రెండు విడతలలో)',
        'రెండవ బిడ్డ ఆడపిల్ల అయితే ₹6,000 ఒకే విడతలో సహాయం',
        'వార్షిక ఆదాయం ₹8 లక్షల లోపు ఉన్నవారు లేదా ఈ-శ్రమ్/BPL/PMJAY కార్డుదారులు',
        'ప్రభుత్వ ఉద్యోగులకు ఈ పథకం వర్తించదు',
      ],
      benefits: [
        'మొదటి బిడ్డకు ₹5,000 రెండు విడతల్లో నేరుగా బ్యాంక్ ఖాతాలో జమ',
        'రెండవ బిడ్డ ఆడపిల్ల అయినప్పుడు ₹6,000 ఏకమొత్తంగా జమ',
        'ఆధార్ అనుసంధాన బ్యాంక్ ఖాతాకు నేరుగా నగదు బదిలీ (DBT)',
      ],
      documents: [
        'తల్లి మరియు భర్త ఆధార్ కార్డులు',
        'వైద్య పరీక్షలు నమోదైన MCP కార్డు',
        'ఆధార్‌తో అనుసంధానించబడిన బ్యాంక్ పాస్‌బుక్',
        'శిశువు జనన ధృవీకరణ పత్రం (2వ విడతకు)',
      ],
      howToApply: [
        'PMMVY అధికారిక పోర్టల్ (pmmvy.wcd.gov.in) లేదా అంగన్‌వాడీ కేంద్రంలో దరఖాస్తు చేసుకోండి',
        'మొబైల్ నంబర్‌తో లాగిన్ అయి దరఖాస్తు ఫారమ్ నింపండి',
        'MCP కార్డు మరియు బ్యాంక్ ఖాతా వివరాలను సమర్పించండి',
        'అంగన్‌వాడీ కార్యకర్త ద్వారా ధృవీకరణ పూర్తి చేయండి',
      ],
      howToAccess: [
        'మీ స్థానిక అంగన్‌వాడీ కేంద్రం లేదా ప్రాథమిక ఆరోగ్య కేంద్రాన్ని సందర్శించండి',
        'అంగన్‌వాడీ కార్యకర్తలు ఆన్‌లైన్ నమోదులో సహకరిస్తారు',
      ],
    },
  },

  jssk: {
    en: {
      name: 'Janani Shishu Suraksha Karyakram (JSSK)',
      shortDescription: 'Zero out-of-pocket expenses for delivery, C-section, medicines, diet, and sick newborn care.',
      description: 'Janani Shishu Suraksha Karyakram (JSSK) guarantees completely free and cashless healthcare entitlements to all pregnant women delivering in public health institutions, including cesarean sections, free drugs, diagnostics, food, and transport, plus free treatment for sick infants up to 1 year.',
      categoryLabel: 'Maternity & Infant Care',
      tag: '100% Free Entitlement',
      coverageHighlight: 'Zero expense delivery & free neonatal care',
      eligibility: [
        'All pregnant women who access public health institutions (PHC, CHC, District Hospitals)',
        'All sick neonates and infants up to 1 year of age receiving care at public health facilities',
        'No income, ration card, or category restriction — universal for all government hospital deliveries',
      ],
      benefits: [
        'Completely free and cashless delivery including Caesarean sections',
        'Free diagnostics (blood, urine, ultrasound, CT scans where available)',
        'Free medicines and consumables during hospital stay',
        'Free nutritious diet during stay (up to 3 days for normal delivery, 7 days for C-section)',
        'Free transport from home to facility, inter-facility transfer, and drop back home',
        'Exemption from all user fees and blood transfusion charges',
      ],
      documents: [
        'No mandatory income document required',
        'Identity proof (Aadhaar / Voter ID / Ration Card) for hospital registration',
        'MCP card if registered during pregnancy',
      ],
      howToAccess: [
        'Visit any Government Hospital, Community Health Center (CHC), or Primary Health Center (PHC)',
        'Inform the registration desk that you are seeking JSSK entitlements',
        'All drugs, tests, delivery care, and food are provided free of cost automatically',
        'Dial 102/108 for free ambulance pickup and drop-back',
      ],
      howToApply: [
        'No formal application required — entitlements are automatically provided at public hospitals',
      ],
    },
    ta: {
      name: 'ஜனனி சிசு சுரக்ஷா காரியக்ரம் (JSSK)',
      shortDescription: 'அரசு மருத்துவமனைகளில் பிரசவம், மருந்துகள், உணவு மற்றும் பிறந்த குழந்தை பராமரிப்பு 100% இலவசம்.',
      description: 'ஜனனி சிசு சுரக்ஷா காரியக்ரம் (JSSK) அரசு மருத்துவமனைகளில் பிரசவிக்கும் அனைத்து தாய்மார்களுக்கும் இலவச சிசேரியன், இலவச மருந்துகள், பரிசோதனைகள், உணவு, இலவச ஆம்புலன்ஸ் மற்றும் 1 வயது வரை உள்ள குழந்தைகளுக்கு முழு இலவச சிகிச்சை ஆகியவற்றை உறுதி செய்கிறது.',
      categoryLabel: 'மகப்பேறு & குழந்தை பராமரிப்பு',
      tag: '100% முற்றிலும் இலவசம்',
      coverageHighlight: 'செலவில்லா பிரசவம் & பிறந்த குழந்தைக்கான இலவச சிகிச்சை',
      eligibility: [
        'அரசு மருத்துவமனைகளில் (PHC, CHC, மாவட்ட மருத்துவமனை) பிரசவிக்கும் அனைத்து கர்ப்பிணிகள்',
        'அரசு மருத்துவமனையில் சிகிச்சை பெறும் 1 வயதுக்குட்பட்ட அனைத்து பச்சிளம் குழந்தைகள்',
        'வருமான வரம்பு அல்லது ரேஷன் கார்டு தேவையில்லை — அரசு மருத்துவமனைகளில் அனைவருக்கும் பொதுவானது',
      ],
      benefits: [
        'சாதாரண மற்றும் சிசேரியன் பிரசவங்கள் முற்றிலும் இலவசம்',
        'இரத்தம், சிறுநீர் மற்றும் ஸ்கேன் பரிசோதனைகள் இலவசம்',
        'மருத்துவமனையில் தங்கியிருக்கும் போது அனைத்து மருந்துகளும் இலவசம்',
        'இலவச சத்தான உணவு (சாதாரண பிரசவத்திற்கு 3 நாட்கள், சிசேரியனுக்கு 7 நாட்கள்)',
        'வீட்டிலிருந்து மருத்துவமனைக்கும், வீடு திரும்பவும் இலவச ஆம்புலன்ஸ் வசதி',
        'பயனாளர் கட்டணங்கள் மற்றும் இரத்த தான கட்டணங்கள் முற்றிலும் கிடையாது',
      ],
      documents: [
        'வருமான சான்றிதழ் தேவையில்லை',
        'அடையாள அட்டை (ஆதார் / வாக்காளர் அட்டை / ரேஷன் கார்டு)',
        'கர்ப்ப காலத்தில் வழங்கப்பட்ட MCP அட்டை',
      ],
      howToAccess: [
        'ஏதேனும் அரசு ஆரம்ப சுகாதார நிலையம், சமுதாய சுகாதார மையம் அல்லது அரசு தலைமை மருத்துவமனைக்குச் செல்லவும்',
        'பதிவு கவுண்டரில் JSSK திட்ட சலுகைகளைப் பெற வந்ததாகத் தெரிவிக்கவும்',
        'அனைத்து சிகிச்சைகளும் மருந்துகளும் தானாகவே இலவசமாக வழங்கப்படும்',
        'இலவச ஆம்புலன்ஸ் சேவைக்கு 102 அல்லது 108 ஐ அழைக்கவும்',
      ],
      howToApply: [
        'தனி விண்ணப்பம் தேவையில்லை — அரசு மருத்துவமனைகளில் தானாகவே இலவச சலுகைகள் கிடைக்கும்',
      ],
    },
    hi: {
      name: 'जननी शिशु सुरक्षा कार्यक्रम (JSSK)',
      shortDescription: 'प्रसव, सी-सेक्शन, दवाइयों, भोजन और बीमार नवजात शिशु के इलाज का 100% मुफ्त अधिकार।',
      description: 'जननी शिशु सुरक्षा कार्यक्रम (JSSK) सरकारी अस्पतालों में प्रसव कराने वाली सभी महिलाओं के लिए निःशुल्क सिजेरियन, दवाइयां, जांच, पौष्टिक आहार, निःशुल्क परिवहन और 1 वर्ष तक के बीमार शिशुओं के संपूर्ण मुफ्त इलाज की गारंटी देता है।',
      categoryLabel: 'मातृत्व एवं शिशु देखभाल',
      tag: '100% पूर्णतः निःशुल्क',
      coverageHighlight: 'शून्य खर्च प्रसव एवं मुफ्त नवजात शिशु देखभाल',
      eligibility: [
        'सरकारी स्वास्थ्य संस्थानों (PHC, CHC, जिला अस्पताल) में प्रसव कराने वाली सभी महिलाएं',
        'सरकारी अस्पतालों में इलाज कराने वाले 1 वर्ष तक के सभी बीमार नवजात और शिशु',
        'आय, जाति या राशन कार्ड का कोई बंधन नहीं — सरकारी अस्पतालों में सभी के लिए सार्वभौमिक',
      ],
      benefits: [
        'सामान्य एवं सिजेरियन प्रसव पूरी तरह मुफ्त',
        'सभी प्रकार के रक्त, मूत्र परीक्षण और अल्ट्रासाउंड मुफ्त',
        'अस्पताल में भर्ती रहने के दौरान सभी दवाइयां मुफ्त',
        'मुफ्त पौष्टिक भोजन (सामान्य प्रसव पर 3 दिन, सिजेरियन पर 7 दिन)',
        'घर से अस्पताल आने और वापस जाने के लिए मुफ्त एम्बुलेंस',
        'अस्पताल की सभी यूजर फीस और ब्लड ट्रांसफ्यूजन शुल्क से पूरी छूट',
      ],
      documents: [
        'किसी भी आय प्रमाण पत्र की आवश्यकता नहीं',
        'अस्पताल पंजीकरण के लिए पहचान पत्र (आधार / वोटर आईडी / राशन कार्ड)',
        'मातृ एवं शिशु सुरक्षा (MCP) कार्ड',
      ],
      howToAccess: [
        'किसी भी सरकारी अस्पताल, सामुदायिक स्वास्थ्य केंद्र या प्राथमिक स्वास्थ्य केंद्र जाएं',
        'पंजीकरण काउंटर पर बताएं कि आप JSSK सुविधाओं के लिए आए हैं',
        'सभी जांच, दवाएं और प्रसव देखभाल स्वतः निःशुल्क प्रदान की जाएगी',
        'मुफ्त एम्बुलेंस सेवा के लिए 102/108 डायल करें',
      ],
      howToApply: [
        'किसी औपचारिक आवेदन की आवश्यकता नहीं — सरकारी अस्पताल में सीधे लाभ मिलता है',
      ],
    },
    te: {
      name: 'జననీ శిశు సురక్ష కార్యక్రమం (JSSK)',
      shortDescription: 'ప్రభుత్వ ఆసుపత్రులలో సురక్షిత ప్రసవం, మందులు, పౌష్టికాహారం మరియు నవజాత శిశువు చికిత్స 100% ఉచితం.',
      description: 'జననీ శిశు సురక్ష కార్యక్రమం (JSSK) ప్రభుత్వ ఆసుపత్రులలో కాన్పుల కోసం చేరే ప్రతి గర్భిణీకి ఉచిత సిజేరియన్, ఉచిత మందులు, ఉచిత పరీక్షలు, భోజనం, ఉచిత అంబులెన్స్ మరియు 1 సంవత్సరం లోపు అనారోగ్య శిశువులకు పూర్తి ఉచిత చికిత్సను అందిస్తుంది.',
      categoryLabel: 'మాతృత్వ & శిశు సంరక్షణ',
      tag: '100% పూర్తి ఉచితం',
      coverageHighlight: 'ఖర్చులేని ప్రసవం & ఉచిత శిశు సంరక్షణ',
      eligibility: [
        'ప్రభుత్వ ఆసుపత్రులను (PHC, CHC, జిల్లా ఆసుపత్రులు) ఆశ్రయించే గర్భిణులందరూ',
        'ప్రభుత్వ ఆసుపత్రులలో చికిత్స పొందే 1 సంవత్సరం లోపు నవజాత శిశువులు',
        'ఆదాయ పరిమితి లేదా రేషన్ కార్డు నిబంధన లేదు — ప్రభుత్వ ఆసుపత్రులలో అందరికీ ఉచితం',
      ],
      benefits: [
        'సాధారణ మరియు సిజేరియన్ ప్రసవాలు పూర్తిగా ఉచితం',
        'అన్ని రకాల రక్త, మూత్ర మరియు స్కానింగ్ పరీక్షలు ఉచితం',
        'ఆసుపత్రిలో ఉన్నంత కాలం మందులు మరియు ఇంజెక్షన్లు ఉచితం',
        'ఉచిత పౌష్టికాహారం (సాధారణ కాన్పుకు 3 రోజులు, సిజేరియన్‌కు 7 రోజులు)',
        'ఇంటి నుండి ఆసుపత్రికి మరియు తిరుగు ప్రయాణానికి ఉచిత అంబులెన్స్',
        'ఎటువంటి యూజర్ ఫీజులు లేదా బ్లడ్ బ్యాంక్ ఛార్జీలు ఉండవు',
      ],
      documents: [
        'ఎటువంటి ఆదాయ ధృవీకరణ పత్రం అవసరం లేదు',
        'గుర్తింపు కార్డు (ఆధార్ / ఓటర్ కార్డ్ / రేషన్ కార్డ్)',
        'గర్భధారణ కాలంలో నమోదు చేసుకున్న MCP కార్డు',
      ],
      howToAccess: [
        'సమీప ప్రభుత్వ ఆసుపత్రి, కమ్యూనిటీ హెల్త్ సెంటర్ లేదా PHC కి వెళ్లండి',
        'రిజిస్ట్రేషన్ కౌంటర్ వద్ద JSSK సేవల కోసం వచ్చినట్లు తెలియజేయండి',
        'అన్ని సేవలు మరియు మందులు ఆటోమేటిక్‌గా ఉచితంగా అందుతాయి',
        'ఉచిత రవాణా కోసం 102 లేదా 108 అంబులెన్స్‌కు కాల్ చేయండి',
      ],
      howToApply: [
        'ప్రత్యేక దరఖాస్తు అవసరం లేదు — ప్రభుత్వ ఆసుపత్రులలో చేరిన వెంటనే సేవలు వర్తిస్తాయి',
      ],
    },
  },

  indradhanush: {
    en: {
      name: 'Mission Indradhanush (Universal Immunization)',
      shortDescription: 'Complete free vaccination for children under 2 years and pregnant women against 12 vaccine-preventable diseases.',
      description: 'Mission Indradhanush is a flagship health mission aimed at accelerating full immunization coverage for children up to 2 years of age and pregnant women against preventable diseases like Diphtheria, Pertussis, Tetanus, Polio, Measles, Rubella, and Hepatitis B.',
      categoryLabel: 'Child Immunization',
      tag: 'Universal Immunization',
      coverageHighlight: '12 Lifesaving vaccines free of cost',
      eligibility: [
        'All infants and children up to 2 years of age who have missed routine vaccines',
        'Children up to 5 years for booster doses',
        'All pregnant women for Tetanus and adult Diphtheria (Td) immunization',
      ],
      benefits: [
        'Protection against 12 life-threatening diseases (BCG, Polio, Pentavalent, Rotavirus, PCV, MR, JE, Vit A)',
        'Free digital vaccination certificate and tracking via the U-WIN portal',
        'Doorstep vaccination outreach camps conducted by ANM and ASHA workers in remote villages',
      ],
      documents: [
        'Mother and Child Protection (MCP) card or Child Immunization record',
        'Aadhaar / Guardian Phone number for U-WIN portal registration',
      ],
      howToApply: [
        'Register child or pregnant woman on the U-WIN portal (uwin.mohfw.gov.in)',
        'Book a vaccination slot at the nearest health center or walk in during Village Health Sanitation & Nutrition Days (VHSND)',
        'Download the digital immunization certificate via U-WIN after vaccination',
      ],
      howToAccess: [
        'Visit any Anganwadi center, Sub-Center, PHC, or government hospital on routine immunization days',
        'Check with your local ASHA worker for the next village vaccination camp date',
      ],
    },
    ta: {
      name: 'மிஷன் இந்திரதனுஷ் (முழு தடுப்பூசி இயக்கம்)',
      shortDescription: '2 வயதுக்குட்பட்ட குழந்தைகள் மற்றும் கர்ப்பிணிகளுக்கு 12 கொடிய நோய்களுக்கு எதிரான இலவச தடுப்பூசி.',
      description: 'மிஷன் இந்திரதனுஷ் என்பது 2 வயதுக்குட்பட்ட குழந்தைகள் மற்றும் கர்ப்பிணிப் பெண்களுக்கு டிப்தீரியா, கக்குவான் இருமல், தனுర్వాతம், போலியோ, தட்டம்மை, ரூபெல்லா மற்றும் ஹெபடைடிஸ்-பி போன்ற 12 நோய்களுக்கு எதிராக முழு தடுப்பூசி வழங்கும் மத்திய அரசு திட்டமாகும்.',
      categoryLabel: 'குழந்தை தடுப்பூசி',
      tag: 'முழு தடுப்பூசி திட்டம்',
      coverageHighlight: '12 உயிர்காக்கும் தடுப்பூசிகள் முற்றிலும் இலவசம்',
      eligibility: [
        'வழக்கமான தடுப்பூசி தவறிய 2 வயதுக்குட்பட்ட அனைத்து குழந்தைகள்',
        'பூஸ்டர் தடுப்பூசிகளுக்கு 5 வயது வரையிலான குழந்தைகள்',
        'தனுర్వాతம் மற்றும் டிப்தீரியா தடுப்பூசிக்காக அனைத்து கர்ப்பிணிப் பெண்கள்',
      ],
      benefits: [
        '12 கொடிய நோய்களிலிருந்து குழந்தைகளுக்கு முழுமையான ஆயுள் பாதுகாப்பு',
        'U-WIN இணையதளம் மூலம் இலவச டிஜிட்டல் தடுப்பூசி சான்றிதழ்',
        'கிராமங்களிலேயே ஆஷா மற்றும் ANM பணியாளர்கள் மூலம் தடுப்பூசி முகாம்கள்',
      ],
      documents: [
        'தாய்-சேய் பாதுகாப்பு (MCP) அட்டை அல்லது தடுப்பூசி அட்டை',
        'U-WIN பதிவிற்காக பெற்றோர் ஆதார் மற்றும் அலைபேசி எண்',
      ],
      howToApply: [
        'U-WIN இணையதளத்தில் (uwin.mohfw.gov.in) குழந்தையை பதிவு செய்யவும்',
        'கிராம சுகாதார தினங்களில் நேரடியாக அங்கன்வாடி மையத்திற்கு அழைத்துச் செல்லவும்',
        'தடுப்பூசி செலுத்திய பின் U-WIN போர்ட்டலில் சான்றிதழைப் பதிவிறக்கவும்',
      ],
      howToAccess: [
        'தடுப்பூசி நாட்களில் ஏதேனும் அங்கன்வாடி மையம், ஆரம்ப சுகாதார நிலையம் அல்லது அரசு மருத்துவமனைக்குச் செல்லவும்',
        'அடுத்த தடுப்பூசி முகாம் தேதியை உங்கள் பகுதி ஆஷா பணியாளரிடம் தெரிந்து கொள்ளவும்',
      ],
    },
    hi: {
      name: 'मिशन इन्द्रधनुष (सार्वभौमिक टीकाकरण)',
      shortDescription: '2 वर्ष तक के बच्चों और गर्भवती महिलाओं को 12 जानलेवा बीमारियों से बचाने हेतु मुफ्त संपूर्ण टीकाकरण।',
      description: 'मिशन इन्द्रधनुष का उद्देश्य 2 वर्ष तक के सभी बच्चों और गर्भवती महिलाओं को डिप्थीरिया, काली खांसी, टिटनेस, पोलियो, खसरा, रूबेला और हेपेटाइटिस-बी सहित 12 वैक्सीन-रोकथाम योग्य बीमारियों के खिलाफ पूर्ण प्रतिरक्षण प्रदान करना है।',
      categoryLabel: 'बाल टीकाकरण',
      tag: 'सार्वभौमिक टीकाकरण',
      coverageHighlight: '12 जीवनरक्षक टीके पूरी तरह मुफ्त',
      eligibility: [
        '2 वर्ष तक के सभी शिशु और बच्चे जिनका नियमित टीकाकरण छूट गया है',
        'बूस्टर खुराक के लिए 5 वर्ष तक के बच्चे',
        'टिटनेस और वयस्क डिप्थीरिया (Td) टीकाकरण के लिए सभी गर्भवती महिलाएं',
      ],
      benefits: [
        '12 घातक बीमारियों से बच्चों की पूर्ण सुरक्षा (BCG, पोलियो, पेंटावेलेंट, रोटावायरस, MR आदि)',
        'U-WIN पोर्टल के माध्यम से निःशुल्क डिजिटल टीकाकरण प्रमाणपत्र',
        'ग्रामीण क्षेत्रों में एएनएम और आशा कार्यकर्ताओं द्वारा घर-घर टीकाकरण शिविर',
      ],
      documents: [
        'मातृ एवं शिशु सुरक्षा (MCP) कार्ड या टीकाकरण कार्ड',
        'U-WIN पंजीकरण हेतु अभिभावक का आधार और मोबाइल नंबर',
      ],
      howToApply: [
        'U-WIN पोर्टल (uwin.mohfw.gov.in) पर बच्चे या गर्भवती महिला का पंजीकरण करें',
        'ग्राम स्वास्थ्य एवं पोषण दिवस (VHSND) के दिन नजदीकी केंद्र पर जाएं',
        'टीकाकरण के उपरांत U-WIN से डिजिटल प्रमाणपत्र डाउनलोड करें',
      ],
      howToAccess: [
        'नियमित टीकाकरण दिवस पर किसी भी आंगनवाड़ी, उप-स्वास्थ्य केंद्र या PHC पर जाएं',
        'अगले टीकाकरण शिविर की तारीख अपनी स्थानीय आशा कार्यकर्ता से जानें',
      ],
    },
    te: {
      name: 'మిషన్ ఇంద్రధనుష్ (సార్వత్రిక టీకా కార్యక్రమం)',
      shortDescription: '2 ఏళ్లలోపు పిల్లలు మరియు గర్భిణీలకు 12 ప్రాణాంతక వ్యాధుల నుండి రక్షణ కల్పించే ఉచిత టీకాలు.',
      description: 'మిషన్ ఇంద్రధనుష్ అనేది 2 సంవత్సరాలలోపు పిల్లలు మరియు గర్భిణీ స్త్రీలకు డిఫ్తీరియా, ధనుర్వాతం, పోలియో, తట్టు, రూబెల్లా మరియు హెపటైటిస్-బి వంటి 12 ప్రాణాంతక వ్యాధుల నివారణకు పూర్తి ఉచిత టీకాలు అందించే జాతీయ పథకం.',
      categoryLabel: 'శిశు టీకాలు',
      tag: 'సార్వత్రిక టీకా భరోసా',
      coverageHighlight: '12 ప్రాణరక్షణ టీకాలు పూర్తిగా ఉచితం',
      eligibility: [
        'క్రమబద్ధమైన టీకాలు అందని 2 సంవత్సరాలలోపు పిల్లలందరూ',
        'బూస్టర్ డోసుల కోసం 5 సంవత్సరాలలోపు పిల్లలు',
        'ధనుర్వాతం (Td) టీకా కొరకు గర్భిణీ స్త్రీలందరూ',
      ],
      benefits: [
        '12 ప్రాణాంతక వ్యాధుల నుండి శిశువులకు పూర్తి రక్షణ',
        'U-WIN పోర్టల్ ద్వారా ఉచిత డిజిటల్ టీకా ధృవీకరణ పత్రం',
        'గ్రామాలలో ఆశా మరియు ANM కార్యకర్తల ద్వారా ఇంటింటికీ టీకా శిబిరాలు',
      ],
      documents: [
        'తల్లి మరియు శిశు సంరక్షణ (MCP) కార్డు లేదా టీకా కార్డు',
        'U-WIN నమోదు కోసం తల్లిదండ్రుల ఆధార్ మరియు మొబైల్ నంబర్',
      ],
      howToApply: [
        'U-WIN పోర్టల్ (uwin.mohfw.gov.in) లో పిల్లల పేరు నమోదు చేయండి',
        'గ్రామ ఆరోగ్య పారిశుధ్య దినాలలో అంగన్‌వాడీ కేంద్రానికి వెళ్లండి',
        'టీకా తీసుకున్న తర్వాత U-WIN నుండి సర్టిఫికెట్ డౌన్‌లోడ్ చేసుకోండి',
      ],
      howToAccess: [
        'టీకా దినాలలో సమీప అంగన్‌వాడీ కేంద్రం, సబ్ సెంటర్ లేదా PHC ని సందర్శించండి',
        'తదుపరి టీకా శిబిరం వివరాల కోసం మీ ఆశా కార్యకర్తను సంప్రదించండి',
      ],
    },
  },

  pmjjby: {
    en: {
      name: 'PM Jeevan Jyoti Bima Yojana (PMJJBY)',
      shortDescription: 'Affordable life insurance of ₹2 Lakhs for death due to any cause at an annual premium of ₹436.',
      description: 'Pradhan Mantri Jeevan Jyoti Bima Yojana offers a renewable one-year term life cover of ₹2 Lakhs to all savings bank account holders aged 18–50 years, providing critical financial security to rural and low-income families in the event of death.',
      categoryLabel: 'Life Insurance',
      tag: 'Life Security',
      coverageHighlight: '₹2,00,000 life risk coverage',
      eligibility: [
        'All individuals aged 18 to 50 years with a savings bank or post office account',
        'Consent to join auto-debit for the annual premium of ₹436 per annum',
        'Aadhaar linked to bank account as primary KYC',
      ],
      benefits: [
        '₹2,00,000 death benefit payable to nominee in case of death due to any reason',
        'Low cost premium of only ₹436/year (approx ₹1.20 per day)',
        'Simple enrollment process directly via net banking or bank branch',
      ],
      documents: [
        'Bank / Post Office Savings Account Passbook',
        'Aadhaar Card',
        'Nominee identification and KYC details',
      ],
      howToApply: [
        'Login to your bank’s mobile app / internet banking or visit your local bank branch / Post Office',
        'Fill the PMJJBY simple consent form and provide nominee details',
        'Authorize auto-debit of ₹436 from your savings account',
        'Certificate of insurance is instantly generated and linked to your account',
      ],
      howToAccess: [
        'In case of claim, nominee submits death certificate and claim form at the insured’s bank branch',
      ],
    },
    ta: {
      name: 'பிரதான் மந்திரி ஜீவன் ஜோதி பீமா யோஜனா (PMJJBY)',
      shortDescription: 'ஆண்டிற்கு ₹436 பிரீமியத்தில் ₹2 லட்சம் வரை ஆயுள் காப்பீட்டுத் திட்டம்.',
      description: 'பிரதான் மந்திரி ஜீவன் ஜோதி பீமா யோஜனா என்பது 18 முதல் 50 வயது வரை உள்ள வங்கி கணக்குதாரர்களுக்கு ₹2 லட்சம் ஆயுள் காப்பீடு வழங்கும் எளிய மத்திய அரசு திட்டமாகும். எந்தக் காரணத்தினால் இறப்பு ஏற்பட்டாலும் நாமினிக்கு ₹2 லட்சம் இழப்பீடு கிடைக்கும்.',
      categoryLabel: 'ஆயுள் காப்பீடு',
      tag: 'குடும்ப பாதுகாப்பு',
      coverageHighlight: '₹2,00,000 ஆயுள் காப்பீடு பாதுகாப்பு',
      eligibility: [
        '18 முதல் 50 வயது வரை உள்ள வங்கி அல்லது அஞ்சலக சேமிப்பு கணக்குதாரர்கள்',
        'ஆண்டுக்கு ₹436 பிரீமியம் தானாக பிடித்தம் செய்ய ஒப்புதல் வழங்குபவர்கள்',
        'வங்கி கணக்குடன் ஆதார் இணைக்கப்பட்டிருக்க வேண்டும்',
      ],
      benefits: [
        'எந்த காரணத்தினால் ஏற்படும் இறப்பிற்கும் நாமினிக்கு ₹2,00,000 முழு இழப்பீடு',
        'ஆண்டிற்கு வெறும் ₹436 மட்டுமே கட்டணம் (நாளைக்கு சுமார் ₹1.20)',
        'வங்கி கிளை அல்லது நெட் பேங்கிங் மூலம் எளிய நேரடி பதிவு',
      ],
      documents: [
        'வங்கி அல்லது தபால் சேமிப்பு கணக்கு புத்தகம்',
        'ஆதார் அட்டை',
        'நாமினியின் அடையாளச் சான்று விவரங்கள்',
      ],
      howToApply: [
        'உங்கள் வங்கி செயலி மூலம் அல்லது உள்ளூர் வங்கி கிளைக்குச் சென்று படிவத்தை பூர்த்தி செய்யவும்',
        'நாமினி விவரங்களை வழங்கி ₹436 தானியங்கி பிடித்தத்திற்கு ஒப்புதல் அளிக்கவும்',
        'உடனடியாக காப்பீட்டு சான்றிதழ் உங்கள் கணக்கில் உருவாக்கப்படும்',
      ],
      howToAccess: [
        'உரிமைகோரலுக்கு, நாமினி இறப்புச் சான்றிதழ் மற்றும் படிவத்தை வங்கி கிளையில் சமர்ப்பிக்க வேண்டும்',
      ],
    },
    hi: {
      name: 'प्रधानमंत्री जीवन ज्योति बीमा योजना (PMJJBY)',
      shortDescription: 'वार्षिक ₹436 के प्रीमियम पर किसी भी कारण से मृत्यु होने पर ₹2 लाख का किफायती जीवन बीमा।',
      description: 'प्रधानमंत्री जीवन ज्योति बीमा योजना 18 से 50 वर्ष की आयु के सभी बचत बैंक खाताधारकों को ₹2 लाख का नवीकरणीय सावधि जीवन बीमा प्रदान करती है, जो अप्रत्याशित मृत्यु की स्थिति में परिवार को मजबूत वित्तीय सुरक्षा देती है।',
      categoryLabel: 'जीवन बीमा',
      tag: 'जीवन सुरक्षा',
      coverageHighlight: '₹2,00,000 जीवन बीमा सुरक्षा',
      eligibility: [
        '18 से 50 वर्ष की आयु के सभी व्यक्ति जिनका बचत बैंक या डाकघर में खाता है',
        'प्रति वर्ष ₹436 प्रीमियम के ऑटो-डेबिट की सहमति',
        'बैंक खाते से आधार लिंक होना अनिवार्य',
      ],
      benefits: [
        'किसी भी कारण से मृत्यु होने पर नामित व्यक्ति (नॉमिनी) को ₹2,00,000 की राशि',
        'मात्र ₹436/वर्ष का बेहद किफायती प्रीमियम (लगभग ₹1.20 प्रतिदिन)',
        'बैंक शाखा या नेट बैंकिंग द्वारा अत्यंत सरल नामांकन प्रक्रिया',
      ],
      documents: [
        'बैंक या डाकघर बचत खाता पासबुक',
        'आधार कार्ड',
        'नॉमिनी का पहचान पत्र और विवरण',
      ],
      howToApply: [
        'अपने बैंक के मोबाइल ऐप / इंटरनेट बैंकिंग में लॉगिन करें या स्थानीय बैंक शाखा जाएं',
        'PMJJBY फॉर्म भरें और नॉमिनी का विवरण दें',
        'अपने खाते से ₹436 की ऑटो-डेबिट कटौती को अधिकृत करें',
        'बीमा प्रमाणपत्र तुरंत जारी होकर आपके खाते से लिंक हो जाएगा',
      ],
      howToAccess: [
        'दावे की स्थिति में, नॉमिनी को मृत्यु प्रमाण पत्र और दावा फॉर्म बैंक शाखा में जमा करना होगा',
      ],
    },
    te: {
      name: 'ప్రధాన మంత్రి జీవన్ జ్యోతి బీమా యోజన (PMJJBY)',
      shortDescription: 'సంవత్సరానికి కేవలం ₹436 ప్రీమియంతో ఏ కారణం చేతనైనా మరణిస్తే ₹2 లక్షల జీవిత బీమా.',
      description: 'ప్రధాన మంత్రి జీవన్ జ్యోతి బీమా యోజన 18 నుండి 50 సంవత్సరాల వయస్సు గల పొదుపు ఖాతాదారులకు ₹2 లక్షల జీవిత బీమా రక్షణను అందిస్తుంది. అకాల మరణం సంభవించినప్పుడు కుటుంబానికి తక్షణ ఆర్థిక సహాయం లభిస్తుంది.',
      categoryLabel: 'జీవిత బీమా',
      tag: 'జీవిత భద్రత',
      coverageHighlight: '₹2,00,000 జీవిత బీమా రక్షణ',
      eligibility: [
        'బ్యాంక్ లేదా పోస్టాఫీసులో సేవింగ్స్ ఖాతా ఉన్న 18 నుండి 50 సంవత్సరాల వ్యక్తులు',
        'సంవత్సరానికి ₹436 ఆటో-డెబిట్ ప్రీమియం చెల్లింపుకు అంగీకారం',
        'బ్యాంక్ ఖాతాతో ఆధార్ లింక్ అయి ఉండాలి',
      ],
      benefits: [
        'ఏ కారణం చేతనైనా మరణం సంభవిస్తే నామినీకి ₹2,00,000 పూర్తి బీమా మొత్తం',
        'సంవత్సరానికి కేవలం ₹436 అతి తక్కువ ప్రీమియం (రోజుకు సుమారు ₹1.20)',
        'నెట్ బ్యాంకింగ్ లేదా బ్యాంక్ బ్రాంచ్ ద్వారా సులభమైన నమోదు',
      ],
      documents: [
        'బ్యాంక్ లేదా పోస్ట్ ఆఫీస్ సేవింగ్స్ పాస్‌బుక్',
        'ఆధార్ కార్డు',
        'నామినీ గుర్తింపు పత్రాలు',
      ],
      howToApply: [
        'మీ బ్యాంక్ మొబైల్ యాప్ లేదా స్థానిక బ్యాంక్ బ్రాంచ్‌ను సందర్శించండి',
        'PMJJBY దరఖాస్తు ఫారమ్ నింపి నామినీ వివరాలను నమోదు చేయండి',
        'ఖాతా నుండి ₹436 కట్ కావడానికి ఆటో-డెబిట్ అనుమతి ఇవ్వండి',
        'బీమా సర్టిఫికెట్ తక్షణమే మీ ఖాతాకు లింక్ అవుతుంది',
      ],
      howToAccess: [
        'క్లెయిమ్ కోసం, నామినీ మరణ ధృవీకరణ పత్రంతో సంబంధిత బ్యాంక్ బ్రాంచ్‌లో దరఖాస్తు చేయాలి',
      ],
    },
  },

  pmgkay: {
    en: {
      name: 'PM Garib Kalyan Anna Yojana (PMGKAY)',
      shortDescription: 'Free food grain distribution providing 5 kg food grains per person per month to PDS ration cardholders.',
      description: 'Pradhan Mantri Garib Kalyan Anna Yojana provides free food grains (rice, wheat, coarse grains) to over 80 crore beneficiaries under the National Food Security Act (NFSA), ensuring food security and nutrition for vulnerable families.',
      categoryLabel: 'Nutrition & Food Security',
      tag: 'Free Ration',
      coverageHighlight: '5 kg free food grains / person / month',
      eligibility: [
        'Antyodaya Anna Yojana (AAY) ration card holding families (35 kg per family/month)',
        'Priority Household (PHH) ration card holders (5 kg per person/month)',
        'Migrant workers eligible through One Nation One Ration Card (ONORC)',
      ],
      benefits: [
        '100% free food grains at Fair Price Shops (FPS) with zero payment',
        'Portable ration access across India using biometric authentication (ONORC)',
        'Prevents seasonal malnutrition and ensures household food stability',
      ],
      documents: [
        'NFSA Smart Ration Card / e-Ration Card',
        'Aadhaar Card of family members for biometric e-POS authentication',
      ],
      howToAccess: [
        'Visit your local Fair Price Shop (PDS Ration Dealer)',
        'Place your finger on the biometric e-POS machine for Aadhaar verification',
        'Collect your designated free monthly ration entitlement with slip',
      ],
      howToApply: [
        'No new application required — all active NFSA ration cardholders receive free rations automatically',
      ],
    },
    ta: {
      name: 'பிரதான் மந்திரி கரீப் கல்யாண் அன்ன யோஜனா (PMGKAY)',
      shortDescription: 'ரேஷன் அட்டைதாரர்களுக்கு நபர் ஒருவருக்கு மாதம் 5 கிலோ இலவச உணவு தானியங்கள் வழங்கும் திட்டம்.',
      description: 'பிரதான் மந்திரி கரீப் கல்யாண் அன்ன யோஜனா என்பது தேசிய உணவுப் பாதுகாப்புச் சட்டத்தின் (NFSA) கீழ் 80 கோடிக்கும் அதிகமான மக்களுக்கு முற்றிலும் இலவசமாக அரிசி மற்றும் கோதுமை வழங்கும் திட்டமாகும்.',
      categoryLabel: 'ஊட்டச்சத்து & உணவுப் பாதுகாப்பு',
      tag: 'இலவச ரேஷன்',
      coverageHighlight: 'நபர் ஒருவருக்கு மாதம் 5 கிலோ இலவச தானியங்கள்',
      eligibility: [
        'அந்தியோதயா அன்ன யோஜனா (AAY) குடும்பங்கள் (குடும்பத்திற்கு மாதம் 35 கிலோ)',
        'முன்னுரிமை குடும்ப அட்டைதாரர்கள் (PHH) (நபர் ஒருவருக்கு மாதம் 5 கிலோ)',
        'ஒரே நாடு ஒரே ரேஷன் (ONORC) மூலம் புலம்பெயர்ந்த தொழிலாளர்கள்',
      ],
      benefits: [
        'நியாயவிலைக் கடைகளில் (FPS) 100% முற்றிலும் இலவச உணவு தானியங்கள்',
        'இந்தியா முழுவதும் கைரேகை சரிபார்ப்பு மூலம் எந்த கடையிலும் ரேஷன் பெறும் வசதி',
        'குடும்பத்தின் உணவு பாதுகாப்பை உறுதி செய்து ஊட்டச்சத்து குறைபாட்டை போக்குகிறது',
      ],
      documents: [
        'NFSA ஸ்மார்ட் ரேஷன் கார்டு / மின்னணு குடும்ப அட்டை',
        'பயோமெட்ரிக் சரிபார்ப்பிற்காக குடும்ப உறுப்பினர்களின் ஆதார் அட்டை',
      ],
      howToAccess: [
        'உங்கள் உள்ளூர் நியாயவிலைக் கடைக்கு (ரேஷன் கடை) செல்லவும்',
        'e-POS இயந்திரத்தில் கைரேகை வைத்து ஆதார் சரிபார்ப்பை முடிக்கவும்',
        'உங்களுக்கு ஒதுக்கப்பட்ட இலவச ரேஷன் பொருட்களை ரசீதுடன் பெற்றுக்கொள்ளவும்',
      ],
      howToApply: [
        'தனி விண்ணப்பம் தேவையில்லை — தகுதியுள்ள அனைத்து ரேஷன் அட்டைதாரர்களுக்கும் தானாகவே கிடைக்கும்',
      ],
    },
    hi: {
      name: 'प्रधानमंत्री गरीब कल्याण अन्न योजना (PMGKAY)',
      shortDescription: 'राशन कार्डधारकों को प्रति व्यक्ति प्रति माह 5 किलोग्राम मुफ्त खाद्यान्न वितरण।',
      description: 'प्रधानमंत्री गरीब कल्याण अन्न योजना राष्ट्रीय खाद्य सुरक्षा अधिनियम (NFSA) के तहत 80 करोड़ से अधिक लाभार्थियों को मुफ्त खाद्यान्न (चावल/गेहूं) प्रदान करती है, जिससे कमजोर परिवारों की खाद्य सुरक्षा सुनिश्चित होती है।',
      categoryLabel: 'पोषण एवं खाद्य सुरक्षा',
      tag: 'मुफ्त राशन',
      coverageHighlight: '5 किग्रा मुफ्त अनाज / व्यक्ति / माह',
      eligibility: [
        'अंत्योदय अन्न योजना (AAY) राशन कार्डधारक परिवार (35 किग्रा प्रति परिवार/माह)',
        'प्राथमिकता घरेलू (PHH) राशन कार्डधारक (5 किग्रा प्रति व्यक्ति/माह)',
        'वन नेशन वन राशन कार्ड (ONORC) के तहत प्रवासी श्रमिक',
      ],
      benefits: [
        'उचित मूल्य की दुकानों (FPS) पर बिना किसी भुगतान के 100% मुफ्त खाद्यान्न',
        'बायोमेट्रिक प्रमाणीकरण द्वारा देश भर में कहीं भी राशन प्राप्त करने की सुविधा',
        'कुपोषण की रोकथाम और पारिवारिक खाद्य सुरक्षा की पूर्ण गारंटी',
      ],
      documents: [
        'NFSA स्मार्ट राशन कार्ड / डिजिटल राशन कार्ड',
        'e-POS बायोमेट्रिक प्रमाणीकरण हेतु परिवार के सदस्यों का आधार कार्ड',
      ],
      howToAccess: [
        'अपनी स्थानीय उचित मूल्य की दुकान (राशन डीलर) पर जाएं',
        'आधार सत्यापन के लिए बायोमेट्रिक e-POS मशीन पर अंगूठा लगाएं',
        'पर्ची के साथ अपना निर्धारित मासिक मुफ्त राशन प्राप्त करें',
      ],
      howToApply: [
        'अलग से आवेदन की आवश्यकता नहीं — सभी सक्रिय राशन कार्डधारकों को स्वतः लाभ मिलता है',
      ],
    },
    te: {
      name: 'ప్రధాన మంత్రి గరీబ్ కళ్యాణ్ అన్న యోజన (PMGKAY)',
      shortDescription: 'రేషన్ కార్డుదారులకు నెలకు ప్రతి వ్యక్తికి 5 కిలోల ఉచిత బియ్యం/ధాన్యాల పంపిణీ.',
      description: 'ప్రధాన మంత్రి గరీబ్ కళ్యాణ్ అన్న యోజన జాతీయ ఆహార భద్రతా చట్టం (NFSA) కింద 80 కోట్లకు పైగా ప్రజలకు పూర్తిగా ఉచితంగా ఆహార ధాన్యాలను అందిస్తూ నిరుపేద కుటుంబాలకు ఆహార భద్రతను కల్పిస్తుంది.',
      categoryLabel: 'ఆహార భద్రత & పోషణ',
      tag: 'ఉచిత రేషన్',
      coverageHighlight: 'నెలకు ప్రతి వ్యక్తికి 5 కిలోల ఉచిత ధాన్యాలు',
      eligibility: [
        'అంత్యోదయ అన్న యోజన (AAY) కార్డు కలిగిన కుటుంబాలు (నెలకు కుటుంబానికి 35 కిలోలు)',
        'ఆహార భద్రతా (PHH) కార్డుదారులు (నెలకు ప్రతి వ్యక్తికి 5 కిలోలు)',
        'వన్ నేషన్ వన్ రేషన్ కార్డు (ONORC) ద్వారా వలస కార్మికులు',
      ],
      benefits: [
        'రేషన్ దుకాణాలలో ఎటువంటి రుసుము లేకుండా 100% ఉచిత ఆహార ధాన్యాలు',
        'దేశవ్యాప్తంగా ఎక్కడైనా బయోమెట్రిక్ ద్వారా రేషన్ పొందే పోర్టబిలిటీ సదుపాయం',
        'కుటుంబానికి నిరంతర ఆహార భద్రత మరియు పోషకాహార భరోసా',
      ],
      documents: [
        'NFSA స్మార్ట్ రేషన్ కార్డు / ఈ-రేషన్ కార్డు',
        'బయోమెట్రిక్ e-POS ధృవీకరణ కోసం కుటుంబ సభ్యుల ఆధార్ కార్డు',
      ],
      howToAccess: [
        'మీ స్థానిక రేషన్ దుకాణాన్ని (FPS) సందర్శించండి',
        'e-POS మెషిన్ పై వేలిముద్ర వేసి ఆధార్ ధృవీకరణ పూర్తి చేయండి',
        'రసీదుతో పాటు మీ ఉచిత నెలవారీ రేషన్‌ను అందుకోండి',
      ],
      howToApply: [
        'ప్రత్యేక దరఖాస్తు అవసరం లేదు — యాక్టివ్ రేషన్ కార్డు ఉన్నవారందరికీ నేరుగా అందుతుంది',
      ],
    },
  },

  pmayg: {
    en: {
      name: 'PMAY-Gramin (Affordable Housing)',
      shortDescription: 'Financial assistance of ₹1.20 Lakhs to ₹1.30 Lakhs for constructing a durable pucca house with sanitation.',
      description: 'Pradhan Mantri Awaas Yojana - Gramin aims to provide a pucca house with basic amenities including clean piped water, electricity connection, and a clean toilet to all houseless rural families and those living in kutcha/dilapidated homes.',
      categoryLabel: 'Rural Welfare',
      tag: 'Rural Housing',
      coverageHighlight: '₹1.20L – ₹1.30L direct housing assistance',
      eligibility: [
        'Houseless rural families and households living in zero, one, or two-room houses with kutcha walls and roof',
        'Prioritization based on SECC 2011 and Awaas+ verified survey lists',
        'Excludes households with motorized vehicles, mechanized agricultural equipment, or government employees',
      ],
      benefits: [
        'Grant of ₹1,20,000 in plain areas and ₹1,30,000 in hilly/difficult/northeastern states',
        'Additional 90–95 days of unskilled labor wage under MGNREGA (approx ₹20,000)',
        '₹12,000 additional assistance for toilet construction under Swachh Bharat Mission',
        'Free LPG connection under PM Ujjwala Yojana',
      ],
      documents: [
        'Aadhaar Card of all adult family members',
        'Bank Account Passbook (Aadhaar linked for DBT installments)',
        'MGNREGA Job Card Number',
        'Land ownership document or Gram Panchayat certificate',
      ],
      howToAccess: [
        'Check your name in the Gram Panchayat Awaas+ priority list',
        'Gram Sevak / Block Development Officer completes geo-tagging of current house site',
        'Installments are directly credited to bank account at foundation, lintel, and completion stages',
      ],
      howToApply: [
        'Enrollment is conducted via Gram Panchayat survey and Awaas+ portal verification',
      ],
    },
    ta: {
      name: 'பிரதான் மந்திரி ஆவாஸ் யோஜனா - கிராமின் (PMAY-G)',
      shortDescription: 'கிராமப்புறங்களில் கான்கிரீட் வீடு கட்ட ₹1.20 லட்சம் முதல் ₹1.30 லட்சம் வரை நேரடி மானியம்.',
      description: 'பிரதான் மந்திரி ஆவாஸ் யோஜனா - கிராமின் திட்டம் கிராமப்புறங்களில் வீடற்ற மற்றும் குடிசை வீடுகளில் வசிக்கும் ஏழை குடும்பங்களுக்கு கழிப்பறை, குடிநீர், மின்சார வசதியுடன் கூடிய கான்கிரீட் வீடு கட்ட நேரடி நிதி உதவி வழங்குகிறது.',
      categoryLabel: 'கிராமப்புற நலன்',
      tag: 'வீட்டு வசதி திட்டம்',
      coverageHighlight: '₹1.20 லட்சம் – ₹1.30 லட்சம் நேரடி வீட்டு மானியம்',
      eligibility: [
        'கிராமப்புறங்களில் சொந்த வீடற்ற அல்லது குடிசை வீடுகளில் வசிக்கும் குடும்பங்கள்',
        'SECC 2011 மற்றும் ஆவாஸ்+ கள கணக்கெடுப்பில் தேர்வு செய்யப்பட்டவர்கள்',
        'வாகனங்கள், விவசாய இயந்திரங்கள் அல்லது அரசு ஊழியர்கள் இல்லாத குடும்பங்கள்',
      ],
      benefits: [
        'சமவெளி பகுதிகளில் ₹1,20,000 மற்றும் மலைப்பகுதிகளில் ₹1,30,000 நேரடி மானியம்',
        '100 நாள் வேலைத் திட்டத்தின் கீழ் கூடுதலாக 90–95 நாட்களுக்கான கூலி (சுமார் ₹20,000)',
        'சுவச் பாரத் திட்டத்தின் கீழ் கழிப்பறை கட்ட கூடுதலாக ₹12,000 நிதி',
        'உஜ்வாலா திட்டத்தின் கீழ் இலவச எரிவாயு இணைப்பு',
      ],
      documents: [
        'குடும்ப உறுப்பினர்களின் ஆதார் அட்டை',
        'ஆதாருடன் இணைக்கப்பட்ட வங்கி கணக்கு புத்தகம்',
        'மகாத்மா காந்தி 100 நாள் வேலை அட்டை (Job Card)',
        'நில உரிமை ஆவணம் அல்லது கிராம ஊராட்சி சான்றிதழ்',
      ],
      howToAccess: [
        'கிராம ஊராட்சி அலுவலகத்தில் ஆவாஸ்+ முன்னுரிமைப் பட்டியலில் உங்கள் பெயரை சரிபார்க்கவும்',
        'அதிகாரிகள் உங்கள் வீட்டு இடத்தை புகைப்படம் (Geo-tagging) எடுத்து பதிவு செய்வார்கள்',
        'அடித்தளம், மேற்கூரை மற்றும் நிறைவு நிலைகளில் வங்கி கணக்கில் பணம் வரவு வைக்கப்படும்',
      ],
      howToApply: [
        'கிராம ஊராட்சி கள ஆய்வுகள் மற்றும் ஆவாஸ்+ போர்ட்டல் மூலம் பயனாளிகள் தேர்வு செய்யப்படுகின்றனர்',
      ],
    },
    hi: {
      name: 'प्रधानमंत्री आवास योजना - ग्रामीण (PMAY-G)',
      shortDescription: 'ग्रामीण क्षेत्रों में पक्का मकान बनाने हेतु ₹1.20 लाख से ₹1.30 लाख की प्रत्यक्ष वित्तीय सहायता।',
      description: 'प्रधानमंत्री आवास योजना - ग्रामीण का उद्देश्य बेघर ग्रामीण परिवारों और कच्चे/जीर्ण-शीर्ण मकानों में रहने वाले लोगों को स्वच्छ शौचालय, बिजली और पानी की सुविधा युक्त पक्का मकान बनाने हेतु आर्थिक सहायता देना है।',
      categoryLabel: 'ग्रामीण कल्याण',
      tag: 'ग्रामीण आवास',
      coverageHighlight: '₹1.20 लाख – ₹1.30 लाख प्रत्यक्ष आवास सहायता',
      eligibility: [
        'बेघर ग्रामीण परिवार तथा शून्य, एक या दो कच्चे कमरों वाले घरों में रहने वाले परिवार',
        'SECC 2011 और आवास+ सत्यापित सर्वेक्षण सूची में शामिल परिवार',
        'मोटर वाहन, मशीनीकृत कृषि उपकरण या सरकारी नौकरी वाले परिवार इस योजना से बाहर हैं',
      ],
      benefits: [
        'मैदानी क्षेत्रों में ₹1,20,000 तथा पहाड़ी/दुर्गम राज्यों में ₹1,30,000 का अनुदान',
        'मनरेगा के अंतर्गत 90–95 दिनों की अकुशल मजदूरी (लगभग ₹20,000 अतिरिक्त)',
        'स्वच्छ भारत मिशन के तहत शौचालय निर्माण के लिए ₹12,000 की अतिरिक्त सहायता',
        'प्रधानमंत्री उज्ज्वला योजना के तहत मुफ्त एलपीजी गैस कनेक्शन',
      ],
      documents: [
        'सभी वयस्क सदस्यों का आधार कार्ड',
        'आधार लिंक बैंक खाता पासबुक (DBT किश्तों के लिए)',
        'मनरेगा जॉब कार्ड नंबर',
        'भूमि स्वामित्व दस्तावेज या ग्राम पंचायत प्रमाण पत्र',
      ],
      howToAccess: [
        'ग्राम पंचायत की आवास+ प्राथमिकता सूची में अपना नाम जांचें',
        'ग्राम सेवक / बीडीओ द्वारा निर्माण स्थल की जियो-टैगिंग कराई जाती है',
        'नींव, छत और पूर्ण निर्माण के चरणों पर सीधे बैंक खाते में किश्तें प्राप्त होती हैं',
      ],
      howToApply: [
        'ग्राम पंचायत सर्वेक्षण एवं आवास+ पोर्टल सत्यापन के माध्यम से नाम जोड़े जाते हैं',
      ],
    },
    te: {
      name: 'ప్రధాన మంత్రి ఆవాస్ యోజన - గ్రామీణ్ (PMAY-G)',
      shortDescription: 'గ్రామీణ ప్రాంతాల్లో పక్కా ఇల్లు నిర్మించుకోవడానికి ₹1.20 లక్షల నుండి ₹1.30 లక్షల వరకు ఆర్థిక సహాయం.',
      description: 'ప్రధాన మంత్రి ఆవాస్ యోజన - గ్రామీణ్ పథకం ఇళ్లు లేని గ్రామీణ పేదలకు మరియు మట్టి ఇళ్లలో నివసించే కుటుంబాలకు మరుగుదొడ్డి, విద్యుత్, తాగునీటి సదుపాయాలతో కూడిన శాశ్వత పక్కా ఇంటిని నిర్మించుకోవడానికి ఆర్థిక సహాయాన్ని అందిస్తుంది.',
      categoryLabel: 'గ్రామీణ సంక్షేమం',
      tag: 'గ్రామీణ గృహనిర్మాణం',
      coverageHighlight: '₹1.20ల – ₹1.30ల నేరుగా గృహ నిర్మాణ సహాయం',
      eligibility: [
        'గ్రామీణ ప్రాంతాల్లో ఇళ్లు లేనివారు లేదా మట్టి/పూరి గుడిసెలలో నివసించే కుటుంబాలు',
        'SECC 2011 మరియు ఆవాస్+ సర్వే జాబితాలో అర్హత పొందినవారు',
        'వాహనాలు, యంత్రాలతో కూడిన వ్యవసాయ పరికరాలు లేదా ప్రభుత్వ ఉద్యోగులు లేని కుటుంబాలు',
      ],
      benefits: [
        'మైదాన ప్రాంతాలలో ₹1,20,000 మరియు కొండ ప్రాంతాలలో ₹1,30,000 నేరుగా గ్రాంట్',
        'ఉపాధి హామీ పథకం (MGNREGA) కింద 90–95 రోజుల కూలి డబ్బులు (సుమారు ₹20,000)',
        'స్వచ్ఛ భారత్ కింద మరుగుదొడ్డి నిర్మాణానికి అదనంగా ₹12,000 సహాయం',
        'ఉజ్వల పథకం కింద ఉచిత గ్యాస్ కనెక్షన్',
      ],
      documents: [
        'కుటుంబ సభ్యులందరి ఆధార్ కార్డులు',
        'ఆధార్ అనుసంధాన బ్యాంక్ పాస్‌బుక్',
        'ఉపాధి హామీ జాబ్ కార్డు (MGNREGA Job Card)',
        'స్థల యాజమాన్య పత్రం లేదా గ్రామ పంచాయతీ ధృవీకరణ',
      ],
      howToAccess: [
        'గ్రామ పంచాయతీ ఆవాస్+ ప్రాధాన్యత జాబితాలో మీ పేరును సరిచూసుకోండి',
        'అధికారులు నిర్మాణ స్థలాన్ని జియో-ట్యాగింగ్ చేస్తారు',
        'పునాది, పైకప్పు మరియు పూర్తయిన దశలలో నేరుగా బ్యాంక్ ఖాతాలో డబ్బులు జమ అవుతాయి',
      ],
      howToApply: [
        'గ్రామ పంచాయతీ సర్వే మరియు ఆవాస్+ పోర్టల్ ద్వారా అర్హులను ఎంపిక చేస్తారు',
      ],
    },
  },

  pmsma: {
    en: {
      name: 'PM Surakshit Matritva Abhiyan (PMSMA)',
      shortDescription: 'Free assured antenatal clinic checkups and specialist consultations on the 9th of every month.',
      description: 'Pradhan Mantri Surakshit Matritva Abhiyan guarantees free, comprehensive, and quality antenatal care (ANC) including specialist consultations, ultrasound, and diagnostics to all pregnant women on the 9th of every month across public health facilities in India.',
      categoryLabel: 'Maternity Care',
      tag: 'Assured ANC Checkups',
      coverageHighlight: 'Free specialist ANC on 9th of every month',
      eligibility: [
        'All pregnant women in their 2nd and 3rd trimesters (from 4th month of pregnancy onwards)',
        'Universal for all pregnant women visiting government health facilities on the 9th of every month',
        'No income, caste, or category ceiling',
      ],
      benefits: [
        'Minimum one comprehensive ANC checkup by a medical officer / OBGYN specialist',
        'Free clinical investigations (blood pressure, hemoglobin, blood grouping, urine, ultrasound where available)',
        'Free distribution of Iron Folic Acid (IFA) tablets and Calcium supplements',
        'Early identification and tracking of High-Risk Pregnancies (red sticker on MCP card)',
      ],
      documents: [
        'Mother and Child Protection (MCP) Card',
        'Aadhaar Card / Government Identity Proof',
      ],
      howToAccess: [
        'Visit any Primary Health Center (PHC), Community Health Center (CHC), Sub-District Hospital, or District Hospital on the 9th of any month',
        'Approach the dedicated PMSMA registration helpdesk for free tokens',
      ],
      howToApply: [
        'Walk in on the 9th of any month at government health centers — no prior online registration required',
      ],
    },
    ta: {
      name: 'பிரதான் மந்திரி சுரக்ஷித் மாத்ரித்வ அபியான் (PMSMA)',
      shortDescription: 'ஒவ்வொரு மாதமும் 9-ஆம் தேதி கர்ப்பிணிப் பெண்களுக்கு இலவச சிறப்பு மருத்துவ பரிசோதனைகள்.',
      description: 'பிரதான் மந்திரி சுரக்ஷித் மாத்ரித்வ அபியான் என்பது அனைத்து அரசு மருத்துவமனைகளிலும் ஒவ்வொரு மாதமும் 9-ஆம் தேதி கர்ப்பிணிப் பெண்களுக்கு மகப்பேறு மருத்துவர்கள் மூலம் முழுமையான இலவச பரிசோதனைகள், அல்ட்ராசவுண்ட் ஸ்கேன் மற்றும் மருந்துகள் வழங்கும் திட்டமாகும்.',
      categoryLabel: 'மகப்பேறு நலம்',
      tag: 'மாதாந்திர இலவச பரிசோதனை',
      coverageHighlight: 'ஒவ்வொரு மாதமும் 9-ஆம் தேதி இலவச மருத்துவ பரிசோதனை',
      eligibility: [
        '2வது மற்றும் 3வது முப்பருவத்தில் உள்ள அனைத்து கர்ப்பிணிப் பெண்கள் (4வது மாதம் முதல்)',
        'மாதந்தோறும் 9-ஆம் தேதி அரசு மருத்துவ மையங்களுக்கு வரும் அனைத்து கர்ப்பிணிகளுக்கும் பொதுவானது',
        'வருமானம் அல்லது சாதி வரம்பு எதுவும் இல்லை',
      ],
      benefits: [
        'மகப்பேறு சிறப்பு மருத்துவர் மூலம் முழுமையான இலவச உடல் பரிசோதனை',
        'இரத்த அழுத்தம், ஹீமோகுளோபின், சிறுநீர் மற்றும் ஸ்கேன் பரிசோதனைகள் இலவசம்',
        'இலவச இரும்புச்சத்து (IFA) மற்றும் கால்சியம் மாத்திரைகள் விநியோகம்',
        'அதிக ஆபத்துள்ள கர்ப்பங்களை (High-Risk) ஆரம்பத்திலேயே கண்டறிந்து சிறப்பு சிகிச்சை',
      ],
      documents: [
        'தாய்-சேய் பாதுகாப்பு (MCP) அட்டை',
        'ஆதார் அட்டை அல்லது அரசு அடையாளச் சான்று',
      ],
      howToAccess: [
        'எந்த மாதத்திலும் 9-ஆம் தேதி அருகிலுள்ள ஆரம்ப சுகாதார நிலையம் (PHC) அல்லது அரசு மருத்துவமனைக்குச் செல்லவும்',
        'இலவச டோக்கன் பெற PMSMA உதவி மையத்தை அணுகவும்',
      ],
      howToApply: [
        'முன் பதிவு தேவையில்லை — 9-ஆம் தேதி நேரடியாக அரசு மருத்துவமனைக்குச் செல்லலாம்',
      ],
    },
    hi: {
      name: 'प्रधानमंत्री सुरक्षित मातृत्व अभियान (PMSMA)',
      shortDescription: 'प्रत्येक माह की 9 तारीख को गर्भवती महिलाओं के लिए मुफ्त सुनिश्चित प्रसवपूर्व जांच एवं विशेषज्ञ परामर्श।',
      description: 'प्रधानमंत्री सुरक्षित मातृत्व अभियान देश भर के सरकारी स्वास्थ्य केंद्रों पर प्रत्येक माह की 9 तारीख को सभी गर्भवती महिलाओं को स्त्री रोग विशेषज्ञों द्वारा निःशुल्क प्रसवपूर्व जांच (ANC), अल्ट्रासाउंड एवं दवाइयां सुनिश्चित करता है।',
      categoryLabel: 'मातृत्व देखभाल',
      tag: 'सुनिश्चित ANC जांच',
      coverageHighlight: 'प्रत्येक माह की 9 तारीख को मुफ्त विशेषज्ञ जांच',
      eligibility: [
        'दूसरी और तीसरी तिमाही (गर्भावस्था के चौथे महीने से) की सभी गर्भवती महिलाएं',
        'प्रत्येक माह की 9 तारीख को सरकारी स्वास्थ्य केंद्रों में आने वाली सभी महिलाएं',
        'आय, जाति या वर्ग की कोई सीमा नहीं — सभी के लिए निःशुल्क',
      ],
      benefits: [
        'स्त्री रोग विशेषज्ञ या चिकित्सा अधिकारी द्वारा व्यापक निःशुल्क स्वास्थ्य जांच',
        'रक्तचाप, हीमोग्लोबिन, पेशाब जांच और आवश्यक अल्ट्रासाउंड जांच मुफ्त',
        'आयरन फोलिक एसिड (IFA) और कैल्शियम सप्लीमेंट का मुफ्त वितरण',
        'उच्च जोखिम वाली गर्भावस्था (HRP) की शीघ्र पहचान और विशेष देखभाल',
      ],
      documents: [
        'मातृ एवं शिशु सुरक्षा (MCP) कार्ड',
        'आधार कार्ड / सरकारी पहचान पत्र',
      ],
      howToAccess: [
        'किसी भी माह की 9 तारीख को प्राथमिक स्वास्थ्य केंद्र, सामुदायिक स्वास्थ्य केंद्र या जिला अस्पताल जाएं',
        'मुफ्त टोकन और जांच के लिए PMSMA हेल्पडेस्क से संपर्क करें',
      ],
      howToApply: [
        'पूर्व ऑनलाइन पंजीकरण की आवश्यकता नहीं — 9 तारीख को सीधे अस्पताल जाएं',
      ],
    },
    te: {
      name: 'ప్రధాన మంత్రి సురక్షిత మాతృత్వ అభియాన్ (PMSMA)',
      shortDescription: 'ప్రతి నెలా 9వ తేదీన గర్భిణీలకు ఉచిత స్పెషలిస్ట్ ప్రసవపూర్వ వైద్య పరీక్షలు మరియు స్కానింగ్.',
      description: 'ప్రధాన మంత్రి సురక్షిత మాతృత్వ అభియాన్ పథకం ప్రతి నెలా 9వ తేదీన ప్రభుత్వ ఆసుపత్రులలో గర్భిణీ స్త్రీలందరికీ ప్రముఖ గైనకాలజిస్ట్‌ల ద్వారా ఉచిత వైద్య పరీక్షలు, రక్త పరీక్షలు, ఉచిత మందులు మరియు స్కానింగ్ సేవలను అందిస్తుంది.',
      categoryLabel: 'గర్భిణీ సంరక్షణ',
      tag: 'నెలవారీ ఉచిత పరీక్షలు',
      coverageHighlight: 'ప్రతి నెలా 9వ తేదీన ఉచిత స్పెషలిస్ట్ పరీక్షలు',
      eligibility: [
        'గర్భధారణ 4వ నెల నుండి 2వ మరియు 3వ త్రైమాసికంలో ఉన్న గర్భిణులందరూ',
        'ప్రతి నెలా 9వ తేదీన ప్రభుత్వ ఆసుపత్రులను సందర్శించే మహిళలందరికీ వర్తిస్తుంది',
        'ఎటువంటి ఆదాయ లేదా కుల పరిమితులు లేవు',
      ],
      benefits: [
        'నిపుణులైన వైద్యుల చేత సంపూర్ణ ఉచిత వైద్య పరీక్షలు',
        'రక్తపోటు, హిమోగ్లోబిన్, మూత్ర పరీక్షలు మరియు అల్ట్రాసౌండ్ స్కానింగ్ ఉచితం',
        'ఐరన్ ఫోలిక్ యాసిడ్ (IFA) మరియు కాల్షియం మాత్రల ఉచిత పంపిణీ',
        'అధిక ప్రమాదం ఉన్న గర్భధారణలను (High Risk) ముందుగానే గుర్తించి ప్రత్యేక చికిత్స',
      ],
      documents: [
        'తల్లి మరియు శిశు సంరక్షణ (MCP) కార్డు',
        'ఆధార్ కార్డు లేదా ప్రభుత్వ గుర్తింపు పత్రం',
      ],
      howToAccess: [
        'ఏ నెలలోనైనా 9వ తేదీన సమీప PHC, CHC లేదా ఏరియా ఆసుపత్రికి వెళ్లండి',
        'ఉచిత టోకెన్ కోసం PMSMA హెల్ప్‌డెస్క్‌ను సంప్రదించండి',
      ],
      howToApply: [
        'ముందస్తు నమోదు అవసరం లేదు — నేరుగా 9వ తేదీన ఆసుపత్రికి వెళ్లవచ్చు',
      ],
    },
  },

  rbsk: {
    en: {
      name: 'Rashtriya Bal Swasthya Karyakram (RBSK)',
      shortDescription: 'Free health screening & surgical treatment for 30 selected health conditions (4Ds) for children aged 0–18.',
      description: 'Rashtriya Bal Swasthya Karyakram (RBSK) is an initiative under the National Health Mission providing comprehensive healthcare screening and early intervention treatment for children from birth to 18 years covering Defects at birth, Diseases, Deficiencies, and Development delays including disabilities.',
      categoryLabel: 'Child Healthcare',
      tag: 'Child Screening (4Ds)',
      coverageHighlight: 'Free treatment & surgeries for 30 conditions (0–18 yrs)',
      eligibility: [
        'All children aged 0 to 6 years registered at rural and urban Anganwadi centers',
        'All children aged 6 to 18 years enrolled in government and government-aided schools',
        'All newborns delivered at public health facilities',
      ],
      benefits: [
        'Free screening for 30 specific health conditions across 4 categories (4Ds)',
        'Free tertiary care surgeries (congenital heart defect, cleft lip/palate, clubfoot, congenital cataract)',
        'Free referral and therapy services at District Early Intervention Centers (DEIC)',
      ],
      documents: [
        'Child Immunization record or MCP card',
        'School ID or Aadhaar Card of guardian',
      ],
      howToAccess: [
        'Mobile Health Teams (MHT) conduct screenings at Anganwadi centers twice a year and government schools once a year',
        'Visit your nearest District Early Intervention Center (DEIC) or District Hospital for direct assessment',
      ],
      howToApply: [
        'Screening is organized at schools/Anganwadis — parents can also visit DEIC directly',
      ],
    },
    ta: {
      name: 'ராஷ்ட்ரிய பால் சுவஸ்திய காரியக்ரம் (RBSK)',
      shortDescription: '0 முதல் 18 வயது வரையிலான குழந்தைகளுக்கு 30 குறைபாடுகளுக்கு இலவச மருத்துவ சிகிச்சை & அறுவை சிகிச்சை.',
      description: 'ராஷ்ட்ரிய பால் சுவஸ்திய காரியக்ரம் (RBSK) என்பது பிறவி குறைபாடுகள், ஊட்டச்சத்து குறைபாடுகள், நோய்கள் மற்றும் வளர்ச்சி தாமதங்கள் (4Ds) உள்ளிட்ட 30 வகையான உடல்நல பாதிப்புகளுக்கு குழந்தைகளுக்கு முற்றிலும் இலவச சிகிச்சை வழங்கும் திட்டமாகும்.',
      categoryLabel: 'குழந்தைகள் நலம்',
      tag: 'குழந்தை நலம் (4Ds)',
      coverageHighlight: '30 நோய்களுக்கு இலவச சிகிச்சை & அறுவை சிகிச்சை (0–18 வயது)',
      eligibility: [
        'அங்கன்வாடி மையங்களில் பதிவு செய்த 0 முதல் 6 வயது வரையிலான அனைத்து குழந்தைகள்',
        'அரசு மற்றும் அரசு உதவிபெறும் பள்ளிகளில் பயிலும் 6 முதல் 18 வயது மாணவர்கள்',
        'அரசு மருத்துவமனைகளில் பிறக்கும் அனைத்து பச்சிளம் குழந்தைகள்',
      ],
      benefits: [
        'பிறவி இதய நோய், பிளவு உதடு, கிளப்ஃபூட், கண்புரை போன்றவற்றுக்கு இலவச உயர் அறுவை சிகிச்சைகள்',
        '30 வகையான நோய்கள் மற்றும் குறைபாடுகளுக்கு இலவச மருத்துவ பரிசோதனை',
        'மாவட்ட ஆரம்பகால தலையீட்டு மையங்களில் (DEIC) இலவச சிகிச்சை மற்றும் பிசியோதெரபி',
      ],
      documents: [
        'குழந்தை தடுப்பூசி அட்டை அல்லது MCP அட்டை',
        'பள்ளி அடையாள அட்டை அல்லது பெற்றோரின் ஆதார் அட்டை',
      ],
      howToAccess: [
        'நடமாடும் மருத்துவக் குழுக்கள் அங்கன்வாடி மற்றும் பள்ளிகளில் பரிசோதனைகளை நடத்துகின்றன',
        'நேரடி சிகிச்சைக்காக மாவட்ட ஆரம்ப தலையீட்டு மையம் (DEIC) அல்லது அரசு தலைமை மருத்துவமனைக்குச் செல்லலாம்',
      ],
      howToApply: [
        'பள்ளிகள் மற்றும் அங்கன்வாடிகளில் பரிசோதனை நடத்தப்படுகிறது — பெற்றோர் நேரடியாகவும் DEIC-ஐ அணுகலாம்',
      ],
    },
    hi: {
      name: 'राष्ट्रीय बाल स्वास्थ्य कार्यक्रम (RBSK)',
      shortDescription: '0 से 18 वर्ष के बच्चों के लिए 30 चयनित स्वास्थ्य स्थितियों (4Ds) की मुफ्त जांच और शल्य चिकित्सा।',
      description: 'राष्ट्रीय बाल स्वास्थ्य कार्यक्रम (RBSK) जन्म से 18 वर्ष तक के बच्चों में जन्मजात विकार, बीमारियां, कमियां और विकास संबंधी देरी (4Ds) सहित 30 प्रमुख स्वास्थ्य स्थितियों की शीघ्र पहचान और पूर्ण मुफ्त उपचार प्रदान करता है।',
      categoryLabel: 'बाल स्वास्थ्य',
      tag: 'बाल जांच (4Ds)',
      coverageHighlight: '30 बीमारियों का मुफ्त इलाज व सर्जरी (0–18 वर्ष)',
      eligibility: [
        'आंगनवाड़ी केंद्रों में पंजीकृत 0 से 6 वर्ष के सभी बच्चे',
        'सरकारी और सहायता प्राप्त स्कूलों में नामांकित 6 से 18 वर्ष के सभी छात्र',
        'सरकारी स्वास्थ्य संस्थानों में जन्म लेने वाले सभी नवजात शिशु',
      ],
      benefits: [
        'जन्मजात हृदय रोग, कटे होंठ/तालू, क्लबफुट, जन्मजात मोतियाबिंद की पूर्णतः मुफ्त सर्जरी',
        '4 श्रेणियों (4Ds) के तहत 30 विशिष्ट स्वास्थ्य स्थितियों की निःशुल्क जांच',
        'जिला प्रारंभिक हस्तक्षेप केंद्रों (DEIC) में मुफ्त थेरेपी और विशेषज्ञ उपचार',
      ],
      documents: [
        'टीकाकरण कार्ड या MCP कार्ड',
        'स्कूल आईडी या अभिभावक का आधार कार्ड',
      ],
      howToAccess: [
        'मोबाइल हेल्थ टीमें वर्ष में दो बार आंगनवाड़ी और एक बार स्कूलों में जांच करती हैं',
        'प्रत्यक्ष जांच व थेरेपी हेतु नजदीकी जिला प्रारंभिक हस्तक्षेप केंद्र (DEIC) जाएं',
      ],
      howToApply: [
        'स्कूलों और आंगनवाड़ियों में जांच दल आते हैं — अभिभावक सीधे DEIC भी जा सकते हैं',
      ],
    },
    te: {
      name: 'రాష్ట్రీయ బాల స్వస్థ్య కార్యక్రమం (RBSK)',
      shortDescription: '0 నుండి 18 ఏళ్ల పిల్లలకు 30 రకాల అనారోగ్య సమస్యలకు (4Ds) ఉచిత స్క్రీనింగ్ మరియు ఉచిత శస్త్రచికిత్సలు.',
      description: 'రాష్ట్రీయ బాల స్వస్థ్య కార్యక్రమం (RBSK) పుట్టుక నుండి 18 సంవత్సరాల వయస్సు గల పిల్లలలో పుట్టుక లోపాలు, వ్యాధులు, పోషకాహార లోపాలు మరియు ఎదుగుదల లోపాలు (4Ds) వంటి 30 రకాల సమస్యలను గుర్తించి ఉచిత చికిత్స మరియు ఉచిత ఆపరేషన్లను అందిస్తుంది.',
      categoryLabel: 'బాలల ఆరోగ్యం',
      tag: 'పిల్లల ఆరోగ్య పరీక్ష (4Ds)',
      coverageHighlight: '30 సమస్యలకు ఉచిత చికిత్స & శస్త్రచికిత్సలు (0–18 సం.)',
      eligibility: [
        'అంగన్‌వాడీ కేంద్రాలలో నమోదైన 0 నుండి 6 సంవత్సరాల పిల్లలందరూ',
        'ప్రభుత్వ మరియు ఎయిడెడ్ పాఠశాలల్లో చదువుతున్న 6 నుండి 18 సంవత్సరాల విద్యార్థులు',
        'ప్రభుత్వ ఆసుపత్రులలో జన్మించిన నవజాత శిశువులందరూ',
      ],
      benefits: [
        'గుండె జబ్బులు, చీలిక పెదవి, వంకర పాదాలు, పుట్టుక కంటిశుక్లం వంటి సమస్యలకు ఉచిత శస్త్రచికిత్సలు',
        '4 విభాగాల కింద 30 రకాల వ్యాధులకు ఉచిత వైద్య పరీక్షలు',
        'జిల్లా ఎర్లీ ఇంటర్వెన్షన్ సెంటర్లలో (DEIC) ఉచిత ఫిజియోథెరపీ మరియు నిపుణుల సేవలు',
      ],
      documents: [
        'శిశు టీకా కార్డు లేదా MCP కార్డు',
        'పాఠశాల ఐడీ లేదా తల్లిదండ్రుల ఆధార్ కార్డు',
      ],
      howToAccess: [
        'మొబైల్ హెల్త్ టీమ్‌లు అంగన్‌వాడీలు మరియు పాఠశాలల్లో స్క్రీనింగ్ నిర్వహిస్తాయి',
        'ప్రత్యక్ష పరీక్షల కోసం సమీప జిల్లా ఎర్లీ ఇంటర్వెన్షన్ సెంటర్ (DEIC) కి వెళ్లవచ్చు',
      ],
      howToApply: [
        'పాఠశాలలు/అంగన్‌వాడీలలో వైద్య బృందాలు పరీక్షిస్తాయి — తల్లిదండ్రులు నేరుగా DEIC ని కూడా సంప్రదించవచ్చు',
      ],
    },
  },
};

/**
 * Helper to get localized version of a Scheme object based on the active language.
 */
export function getLocalizedScheme(scheme: Scheme, lang: string): Scheme {
  const normLang = (lang === 'ta' || lang === 'hi' || lang === 'te') ? lang : 'en';
  const schemeData = LOCALIZED_SCHEMES[scheme.id];

  if (!schemeData || !schemeData[normLang]) {
    return scheme;
  }

  const loc = schemeData[normLang];

  return {
    ...scheme,
    name: loc.name || scheme.name,
    shortDescription: loc.shortDescription || scheme.shortDescription,
    description: loc.description || scheme.description,
    categoryLabel: loc.categoryLabel || scheme.categoryLabel,
    tag: loc.tag || scheme.tag,
    coverageHighlight: loc.coverageHighlight || scheme.coverageHighlight,
    eligibility: loc.eligibility || scheme.eligibility,
    benefits: loc.benefits || scheme.benefits,
    documents: loc.documents || scheme.documents,
    howToApply: loc.howToApply || scheme.howToApply,
    howToAccess: loc.howToAccess || scheme.howToAccess,
  };
}

/**
 * Helper to get all schemes localized to the active language.
 */
export function getLocalizedSchemes(schemes: Scheme[], lang: string): Scheme[] {
  return schemes.map((s) => getLocalizedScheme(s, lang));
}
