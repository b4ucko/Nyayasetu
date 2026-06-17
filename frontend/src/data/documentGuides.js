export const documentGuides = {
  aadhaar: {
    name: "Aadhaar Card",
    description: "A 12-digit unique ID essential for banking, government schemes, tax compliance, and subsidies.",
    portalUrl: "https://myaadhaar.uidai.gov.in",
    documentsRequired: [
      { name: "Proof of Identity (POI)", examples: "Passport, PAN Card, Voter ID, Driving License, Pensioner Photo Card." },
      { name: "Proof of Address (POA)", examples: "Recent Bank Statement/Passbook, Electricity Bill, Water Bill, Voter ID, Passport." },
      { name: "Proof of Date of Birth (DoB)", examples: "Birth Certificate, Passport, PAN Card, SSLC Certificate, Mark Sheet." }
    ],
    applySteps: [
      "Locate the nearest authorized Aadhaar Enrolment Centre online at the UIDAI portal.",
      "Visit the enrolment centre with original Proof of Identity (POI), Address (POA), and Date of Birth (DoB) documents.",
      "Fill out the Aadhaar Enrolment Form and complete the biometric capture (fingerprints, iris scan, and photograph).",
      "Collect the acknowledgement slip containing the 14-digit Enrolment ID (EID) to track your status online."
    ],
    editSteps: [
      "Log in to the myAadhaar Portal (https://myaadhaar.uidai.gov.in) using your Aadhaar number and OTP.",
      "Select 'Address Update Online' or 'Document Update' and input the updated details accurately.",
      "Upload clear scanned copies of original verifying documents and pay a nominal online fee of ₹50.",
      "For biometric, mobile number, or major name/DOB changes, book an appointment online to visit an Aadhaar Enrolment Centre."
    ],
    faq: [
      { q: "Is Aadhaar proof of citizenship?", a: "No, Aadhaar is a proof of identity and residence, not citizenship." },
      { q: "How long does it take to get Aadhaar after enrolment?", a: "It typically takes up to 90 days for Aadhaar generation and dispatch." },
      { q: "Can I update my mobile number online?", a: "No, mobile number updates require biometrics at an Enrolment Centre." }
    ]
  },
  passport: {
    name: "Passport",
    description: "Vital for international travel and serves as proof of Indian citizenship and identity abroad.",
    portalUrl: "https://www.passportindia.gov.in",
    documentsRequired: [
      { name: "Proof of Present Address", examples: "Water Bill, Electricity Bill, Income Tax Assessment Order, Aadhaar Card, Bank Passbook." },
      { name: "Proof of Date of Birth (DoB)", examples: "Birth Certificate, Matriculation/School Leaving Certificate, PAN Card, Aadhaar Card." },
      { name: "Non-ECR Category Proof (if eligible)", examples: "Class 10 Pass Certificate, Degree Certificate, Pension Payment Order." }
    ],
    applySteps: [
      "Register on the Passport Seva Online Portal and log in to your account.",
      "Click on 'Apply for Fresh Passport/Re-issue of Passport' and fill in the application form online.",
      "Proceed to 'Pay and Schedule Appointment' to pay the fee and book a slot at the nearest PSK or POPSK.",
      "Visit the designated Passport Seva Kendra on the scheduled date with all original documents for verification."
    ],
    editSteps: [
      "Log in to the Passport Seva Portal and select 'Apply for Re-issue of Passport'.",
      "Select the specific reason for re-issue (e.g., Change in Existing Personal Particulars).",
      "Fill out the form with correct details, pay the re-issue fee, and book an appointment.",
      "Present original supporting legal proofs (e.g., Marriage Certificate, Gazette Notification) during your appointment at the PSK."
    ],
    faq: [
      { q: "What is ECR and Non-ECR?", a: "ECR (Emigration Check Required) is for applicants who haven't passed class 10. Non-ECR is for those who have passed class 10 or higher." },
      { q: "Is police verification mandatory?", a: "Yes, for most fresh passports, physical police verification at your address is mandatory." },
      { q: "How long is a passport valid?", a: "For adults, it is valid for 10 years. For minors, it is valid for 5 years or until they turn 18." }
    ]
  },
  birth_cert: {
    name: "Birth Certificate",
    description: "Proves date, place, and nationality of birth; required for school admission, DL, and marriage.",
    portalUrl: "https://crsorgi.gov.in",
    documentsRequired: [
      { name: "Institutional Birth Record", examples: "Discharge slip or letter issued by the hospital where the birth occurred." },
      { name: "Parents' Identity & Address Proof", examples: "Aadhaar Card, Voter ID, Passport, Driving License." },
      { name: "Affidavit & Declaration Form", examples: "Required if the birth is being registered after 21 days of occurrence." }
    ],
    applySteps: [
      "Obtain the official birth slip or discharge summary from the hospital where the child was born.",
      "Register the birth at the local Municipal Corporation or online via the state's Civil Registration System (CRS) within 21 days.",
      "Submit the application form along with parents' ID proofs and the hospital birth record.",
      "Collect the physical certificate from the Registrar office or download the digitally signed certificate online."
    ],
    editSteps: [
      "Obtain a Birth Certificate Correction form from the local registrar or Municipal Corporation office.",
      "Prepare a legally sworn affidavit on stamp paper detailing the incorrect information and the requested corrections.",
      "Submit the form, affidavit, original certificate, and supporting proofs (e.g., parents' school certificates or Aadhaar) to the registrar.",
      "Collect the corrected, verified birth certificate after administrative review and approval."
    ],
    faq: [
      { q: "What if registration is delayed past 21 days?", a: "Delayed registration requires an affidavit, permission from a magistrate, and payment of a late fee." },
      { q: "Can I register a birth online?", a: "Yes, most Indian states offer online registration via the national CRS portal or state-specific e-District portals." },
      { q: "Can a name be added to a birth certificate later?", a: "Yes, you can register a birth without a name and add the name within 1 year for free or later with a fee." }
    ]
  },
  dl: {
    name: "Driving License",
    description: "Mandatory for driving legally; also serves as identity and address proof.",
    portalUrl: "https://sarathi.parivahan.gov.in",
    documentsRequired: [
      { name: "Active Learner's License", examples: "Mandatory Learner's License copy (must be at least 30 days old)." },
      { name: "Proof of Age", examples: "PAN Card, School Transfer Certificate, Birth Certificate, Passport." },
      { name: "Proof of Address", examples: "Aadhaar Card, Passport, Voter ID Card, Electricity Bill." },
      { name: "Medical Certificate (Form 1A)", examples: "Mandatory for applicants over 40 years of age or for commercial licenses." }
    ],
    applySteps: [
      "Apply for a Learner's License online on Sarathi Parivahan, pass the computer test, and get the Learner's License.",
      "Wait at least 30 days, then log back into the portal and select 'Apply for Driving License'.",
      "Fill in the application details, pay the driving test fee, and schedule a slot at the RTO.",
      "Attend the driving test at the RTO with your vehicle; your physical DL is mailed to you upon passing."
    ],
    editSteps: [
      "Access the Sarathi Parivahan portal, choose your state, and click on 'Services on DL'.",
      "Select 'Change of Address' or 'Change of Name' or 'Replacement of DL' as required.",
      "Enter DL details, upload verified supporting documents (e.g., Aadhaar card, Gazetted Name Change certificate), and pay the fee.",
      "Visit the RTO for document verification if prompted by the portal."
    ],
    faq: [
      { q: "Can I drive with a Learner's License?", a: "Yes, but you must have an 'L' sign on the vehicle and be accompanied by a licensed driver." },
      { q: "What is the validity of a Driving License?", a: "For private vehicles, it is valid for 20 years or until the holder turns 40, whichever is earlier." },
      { q: "Can I apply for a DL in a different state than my Aadhaar?", a: "Yes, but you will need local address proof for the RTO's jurisdiction." }
    ]
  },
  voter_id: {
    name: "Voter ID Card",
    description: "Issued by Election Commission, enables voting and serves as valid identity and address proof.",
    portalUrl: "https://voters.eci.gov.in",
    documentsRequired: [
      { name: "Proof of Age (DoB)", examples: "Birth Certificate, Class 10/12 Certificate, PAN Card, Aadhaar Card, Passport." },
      { name: "Proof of Address", examples: "Water/Electricity/Gas connection bill, Bank Passbook, Aadhaar Card, Passport." },
      { name: "Passport-size Photograph", examples: "Recent colored photograph with a light background." }
    ],
    applySteps: [
      "Visit the Voters' Service Portal (https://voters.eci.gov.in) or download the Voter Helpline App.",
      "Register a new account and fill out Form 6 (Application for New Elector).",
      "Upload your passport-size photo, age proof, and address proof documents, and submit.",
      "Upon field verification by a Booth Level Officer (BLO), your Voter ID card will be delivered by post."
    ],
    editSteps: [
      "Log in to the Voters' Service Portal and select Form 8 (Correction of Entries/Shifting of Residence).",
      "Enter your EPIC Number (Voter ID card number) and select the specific fields you need to correct.",
      "Upload the corrected details alongside validating supporting documents (Aadhaar, Passport, etc.) and submit.",
      "Download your updated e-EPIC digitally once approved, or wait for the physical card."
    ],
    faq: [
      { q: "What is EPIC number?", a: "EPIC stands for Electors Photo Identity Card. It is the unique 10-digit alphanumeric number on your Voter ID." },
      { q: "Can I download my Voter ID online?", a: "Yes, registered voters can download a digital version called e-EPIC from the portal." },
      { q: "What if I move to a new constituency?", a: "You must fill out Form 8 on the portal to shift your voter registration to your new residence." }
    ]
  },
  ration_card: {
    name: "Ration Card",
    description: "Provides access to subsidized food grains and acts as identity and residence proof.",
    portalUrl: "https://nfsa.gov.in",
    documentsRequired: [
      { name: "Aadhaar Cards", examples: "Mandatory Aadhaar cards of ALL family members to be linked." },
      { name: "Proof of Present Address", examples: "Electricity Bill, Water Bill, LPG connection slip, Rent Agreement." },
      { name: "Income Proof", examples: "Salary slips, Income Certificate from Tehsildar, or BPL survey certificate." },
      { name: "Bank Account Details", examples: "Bank passbook of the female Head of the Family." }
    ],
    applySteps: [
      "Visit your state's Food & Civil Supplies portal or the nearest Circle Office / Common Service Centre (CSC).",
      "Fill out the Ration Card Application Form (Form A / Form 1) indicating your category (NFSA or Non-NFSA).",
      "Attach Aadhaar cards of all members, income certificates, bank details, and passport-size photos.",
      "Submit the application, undergo physical field inspection by a Food Inspector, and collect the card once approved."
    ],
    editSteps: [
      "Log in to the state Food and Civil Supplies portal or visit your local Circle Office.",
      "Select the specific service: Add Member, Delete Member, Change Address, or Correction of Details.",
      "Submit the appropriate form along with supporting proofs (e.g., Birth/Marriage Certificate for adding a member).",
      "The updated e-Ration Card will be issued online after circle officer approval."
    ],
    faq: [
      { q: "What is NFSA?", a: "National Food Security Act (NFSA) categories receive highly subsidized food grains. Non-NFSA categories are for general identity purposes." },
      { q: "Who is the head of family in a Ration Card?", a: "To empower women, the government mandates that the eldest female member (18+) is designated as the Head of the Family." },
      { q: "Can I transfer my Ration Card to another state?", a: "Under 'One Nation One Ration Card' (ONORC), you can buy subsidized grains anywhere in India, but transfer requires cancellation in the old state." }
    ]
  },
  marriage_cert: {
    name: "Marriage Certificate",
    description: "Official proof of marriage; claiming social benefits, spouse visas, and status updates.",
    portalUrl: "https://edistrict.delhigovt.nic.in",
    documentsRequired: [
      { name: "Age Proof of Spouses", examples: "Passport, Birth Certificate, Matriculation Certificate (Groom 21+, Bride 18+)." },
      { name: "Address Proof of Spouses", examples: "Aadhaar Card, Voter ID, Passport, Electricity Bill." },
      { name: "Marriage Proof", examples: "Wedding Invitation Card, Temple/Church marriage certificate, or Hall booking receipt." },
      { name: "Witness Identity Proof", examples: "Aadhaar, Passport, or Voter ID of 2 or 3 witnesses who attended the wedding." },
      { name: "Joint Wedding Photograph", examples: "Color photographs of the wedding ceremony showing bride and groom clearly." }
    ],
    applySteps: [
      "Log in to the state's e-District portal or visit the local Sub-Registrar Office (SRO) where the marriage took place or where either partner resided.",
      "Fill out the application form under the Hindu Marriage Act (1955) or Special Marriage Act (1954).",
      "Upload joint photos, wedding photos, invitation cards, and witness proofs, and pay the registration fee.",
      "Book an appointment; both spouses and witnesses must visit the SRO with all original documents to sign the register."
    ],
    editSteps: [
      "Draft a correction application letter detailing the errors in the existing Marriage Certificate.",
      "Prepare a legally sworn and notarized affidavit explaining the discrepancy and details to be corrected.",
      "Submit the application, affidavit, original certificate, and verified supporting proofs (e.g., passports, school certificates) to the Sub-Registrar.",
      "Once records are verified, the SRO will issue an amended/corrected Marriage Certificate."
    ],
    faq: [
      { q: "What is the timeline to register?", a: "Under the Hindu Marriage Act, registration can be done quickly. Under the Special Marriage Act, a 30-day public notice is mandatory." },
      { q: "Are witnesses mandatory?", a: "Yes, 2 witnesses are required under the Hindu Marriage Act, and 3 witnesses under the Special Marriage Act." },
      { q: "Can an NRI register online?", a: "NRIs can apply online but physical presence before the Sub-Registrar is mandatory for final registration." }
    ]
  },
  edu_cert: {
    name: "Educational Certificates",
    description: "10th, 12th, degree, mark sheets—essential for employment, higher education, and scholarships.",
    portalUrl: "https://www.digilocker.gov.in",
    documentsRequired: [
      { name: "Student Details", examples: "Registration/Enrollment number, Board/University Roll Number, Passing Year, and School Code." },
      { name: "Identity Proof", examples: "Aadhaar Card, Passport, or Student ID Card." },
      { name: "Affidavit & Police FIR (if lost)", examples: "Mandatory when applying for duplicate certificates due to loss or damage." }
    ],
    applySteps: [
      "For digital copies, log in to DigiLocker, select your Board or University, and enter your Roll Number to fetch it instantly.",
      "For physical copies, visit your respective Board's portal (e.g., CBSE's Duplicate Academic Document System - DADS) or University portal.",
      "Select the service needed (Duplicate Certificate, Marksheet, Migration Certificate) and fill in the details.",
      "Pay the document fees online to have it printed and dispatched to your registered home address."
    ],
    editSteps: [
      "Contact your school principal or college administration to request a correction in school records/admission registers first.",
      "Submit a formal correction application provided by the board/university along with school records and birth certificate.",
      "For major corrections, publish a notice in a local newspaper and submit the cutting along with a Gazette notification copy.",
      "Submit the complete file to the board's regional office or university registrar for processing and reissue."
    ],
    faq: [
      { q: "Are DigiLocker certificates legally valid?", a: "Yes, under Section 4A of the IT Act 2000, documents issued in DigiLocker are at par with original physical certificates." },
      { q: "What should I do if my certificates are lost?", a: "File a Police FIR, prepare an affidavit on stamp paper, publish a newspaper notice, and apply for a duplicate copy on the board's portal." },
      { q: "How long does name correction take?", a: "Board or university name corrections usually take 1 to 3 months depending on verification." }
    ]
  },
  bank_passbook: {
    name: "Bank Passbook",
    description: "Records financial transactions; crucial for pensions, loans, and financial management.",
    portalUrl: "https://www.sbi.co.in",
    documentsRequired: [
      { name: "Account Details", examples: "Account Number, Customer ID, and Branch Code." },
      { name: "Official KYC Proof", examples: "Aadhaar Card, PAN Card, Voter ID, or Passport." },
      { name: "Passport-size Photograph", examples: "Required for new accounts or duplicate passbook issuance." }
    ],
    applySteps: [
      "Visit the home bank branch where you maintain your account.",
      "Submit a written request form or letter for passbook issuance to the customer service desk (usually issued instantly).",
      "Alternatively, log in to Net Banking or Mobile Banking to download official e-Statements or PDF passbooks instantly.",
      "Use self-service Passbook Printing Kiosks (Swayam) at bank branches to print transaction history anytime."
    ],
    editSteps: [
      "Fill out the bank's KYC Update Form to request a change in name, address, phone number, or joint-holder details.",
      "Attach self-attested copies of updated KYC documents (Aadhaar with new address, PAN, or Marriage Certificate).",
      "Submit the application form and physical passbook at your home branch.",
      "Once updated in the system, request the bank to print the new details on your passbook cover or issue a new passbook."
    ],
    faq: [
      { q: "What should I do if I lose my passbook?", a: "Notify your bank branch immediately and submit a request form along with your KYC documents for a duplicate passbook (nominal charges may apply)." },
      { q: "Is a downloaded e-statement as valid as a passbook?", a: "Yes, digitally signed e-statements are widely accepted by government offices, visa agencies, and banks." },
      { q: "Can I update my passbook at any branch?", a: "You can print transactions at any branch kiosk, but major KYC updates must be initiated at your home branch." }
    ]
  }
};
