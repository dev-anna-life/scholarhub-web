const faculties = [
  'Agriculture',
  'Arts & Humanities',
  'Basic Medical Sciences',
  'Clinical Sciences',
  'Dentistry',
  'Education',
  'Engineering',
  'Environmental Sciences',
  'Law',
  'Management Sciences',
  'Pharmacy',
  'Sciences',
  'Social Sciences',
  'Veterinary Medicine',
  'Communication & Media Studies',
  'Computing & Information Technology',
  'Allied Health Sciences',
]

const departmentsByFaculty = {
  'Agriculture': [
    'Agricultural Economics', 'Animal Science', 'Crop Science',
    'Food Science & Technology', 'Soil Science', 'Fisheries & Aquaculture',
    'Forestry & Wildlife Management', 'Agricultural Extension',
  ],
  'Arts & Humanities': [
    'English & Literary Studies', 'History & International Studies',
    'Philosophy', 'Religious Studies', 'Linguistics', 'Music',
    'Theatre & Film Studies', 'Fine & Applied Arts', 'French',
    'African & Asian Studies',
  ],
  'Basic Medical Sciences': [
    'Anatomy', 'Physiology', 'Medical Biochemistry', 'Medical Microbiology',
    'Pathology', 'Pharmacology', 'Public Health',
  ],
  'Clinical Sciences': [
    'Medicine & Surgery', 'Paediatrics', 'Obstetrics & Gynaecology',
    'Internal Medicine', 'Surgery', 'Community Medicine',
    'Radiology', 'Anaesthesiology',
  ],
  'Dentistry': [
    'Dental Surgery', 'Oral & Maxillofacial Surgery', 'Restorative Dentistry',
    'Preventive Dentistry', 'Child Dental Health',
  ],
  'Education': [
    'Educational Administration', 'Guidance & Counselling',
    'Primary Education', 'Early Childhood Education',
    'Special Education', 'Science Education', 'Social Studies Education',
    'Language Education', 'Mathematics Education', 'Biology Education',
    'Chemistry Education', 'Physics Education', 'Adult Education',
    'Library & Information Science', 'Human Kinetics & Health Education',
  ],
  'Engineering': [
    'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
    'Electronic Engineering', 'Chemical Engineering', 'Computer Engineering',
    'Biomedical Engineering', 'Agricultural & Bio-Resources Engineering',
    'Petroleum Engineering', 'Materials & Metallurgical Engineering',
    'Systems Engineering', 'Production & Industrial Engineering',
    'Structural Engineering',
  ],
  'Environmental Sciences': [
    'Architecture', 'Urban & Regional Planning', 'Estate Management',
    'Surveying & Geoinformatics', 'Quantity Surveying', 'Building Technology',
    'Environmental Management', 'Geomatics',
  ],
  'Law': [
    'Law', 'International Law & Jurisprudence', 'Public Law',
    'Private & Property Law', 'Business & Industrial Law',
  ],
  'Management Sciences': [
    'Accounting', 'Business Administration', 'Banking & Finance',
    'Marketing', 'Entrepreneurship', 'Actuarial Science',
    'Insurance & Risk Management', 'Transport Management Technology',
    'Hospitality & Tourism Management',
  ],
  'Pharmacy': [
    'Pharmacy', 'Pharmaceutics', 'Pharmacology & Toxicology',
    'Pharmacognosy', 'Clinical Pharmacy', 'Pharmaceutical Chemistry',
  ],
  'Sciences': [
    'Biology', 'Biochemistry', 'Chemistry', 'Physics', 'Mathematics',
    'Statistics', 'Geology', 'Microbiology', 'Plant Science & Biotechnology',
    'Zoology & Environmental Biology', 'Industrial Chemistry',
    'Computer Science', 'Applied Geophysics',
  ],
  'Social Sciences': [
    'Economics', 'Political Science', 'Psychology', 'Sociology',
    'Geography', 'Anthropology', 'Mass Communication', 'Social Work',
    'Criminology & Security Studies', 'International Relations',
    'Demography & Social Statistics',
  ],
  'Veterinary Medicine': [
    'Veterinary Medicine', 'Veterinary Anatomy', 'Veterinary Physiology',
    'Veterinary Pathology', 'Veterinary Microbiology',
    'Veterinary Parasitology', 'Veterinary Surgery & Radiology',
    'Veterinary Public Health', 'Theriogenology',
  ],
  'Communication & Media Studies': [
    'Mass Communication', 'Broadcasting', 'Journalism',
    'Public Relations & Advertising', 'Film & Multimedia Studies',
    'Digital Media',
  ],
  'Computing & Information Technology': [
    'Computer Science', 'Software Engineering', 'Information Technology',
    'Information Systems', 'Cyber Security', 'Data Science',
    'Artificial Intelligence', 'Computer Information Systems',
  ],
  'Allied Health Sciences': [
    'Nursing', 'Medical Lab Science', 'Radiography & Radiation Science',
    'Physiotherapy', 'Occupational Therapy', 'Optometry',
    'Dietetics', 'Environmental Health Science',
    'Health Information Management', 'Prosthetics & Orthotics',
  ],
}

const courseToDepartment = {
  'Computer Science': ['Computer Science', 'Computing & Information Technology'],
  'Software Engineering': ['Software Engineering', 'Computing & Information Technology'],
  'Information Technology': ['Information Technology', 'Computing & Information Technology'],
  'Medicine & Surgery': ['Medicine & Surgery', 'Clinical Sciences'],
  'Pharmacy': ['Pharmacy', 'Pharmacy'],
  'Nursing': ['Nursing', 'Allied Health Sciences'],
  'Medical Lab Science': ['Medical Lab Science', 'Allied Health Sciences'],
  'Law': ['Law', 'Law'],
  'Accounting': ['Accounting', 'Management Sciences'],
  'Business Administration': ['Business Administration', 'Management Sciences'],
  'Economics': ['Economics', 'Social Sciences'],
  'Mass Communication': ['Mass Communication', 'Communication & Media Studies'],
  'Political Science': ['Political Science', 'Social Sciences'],
  'Psychology': ['Psychology', 'Social Sciences'],
  'English & Literary Studies': ['English & Literary Studies', 'Arts & Humanities'],
  'History & International Studies': ['History & International Studies', 'Arts & Humanities'],
  'Mechanical Engineering': ['Mechanical Engineering', 'Engineering'],
  'Civil Engineering': ['Civil Engineering', 'Engineering'],
  'Electrical Engineering': ['Electrical Engineering', 'Engineering'],
  'Electronic Engineering': ['Electronic Engineering', 'Engineering'],
  'Chemical Engineering': ['Chemical Engineering', 'Engineering'],
  'Architecture': ['Architecture', 'Environmental Sciences'],
  'Biology': ['Biology', 'Sciences'],
  'Biochemistry': ['Biochemistry', 'Sciences'],
  'Chemistry': ['Chemistry', 'Sciences'],
  'Physics': ['Physics', 'Sciences'],
  'Mathematics': ['Mathematics', 'Sciences'],
  'Statistics': ['Statistics', 'Sciences'],
  'Geology': ['Geology', 'Sciences'],
  'Agriculture': ['Agricultural Economics', 'Agriculture'],
  'Education': ['Science Education', 'Education'],
  'Sociology': ['Sociology', 'Social Sciences'],
  'Philosophy': ['Philosophy', 'Arts & Humanities'],
  'Fine & Applied Arts': ['Fine & Applied Arts', 'Arts & Humanities'],
  'Theatre Arts': ['Theatre & Film Studies', 'Arts & Humanities'],
}

function getDepartmentsForFaculty(faculty) {
  return departmentsByFaculty[faculty] || []
}

function getSuggestedDepartment(course) {
  if (!course) return ''
  const match = courseToDepartment[course]
  return match ? match[0] : ''
}

function getSuggestedFaculty(course) {
  if (!course) return ''
  const match = courseToDepartment[course]
  return match ? match[1] : ''
}

export { faculties, departmentsByFaculty, getDepartmentsForFaculty, getSuggestedDepartment, getSuggestedFaculty }
