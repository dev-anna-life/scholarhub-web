// Country-indexed school acronym and alias mapping dictionary

export const SCHOOL_ALIASES_BY_COUNTRY = {
  Nigeria: {
    esut: 'Enugu State University of Science and Technology (ESUT)',
    unn: 'University of Nigeria, Nsukka (UNN)',
    unilag: 'University of Lagos (UNILAG)',
    oau: 'Obafemi Awolowo University (OAU)',
    ui: 'University of Ibadan (UI)',
    abu: 'Ahmadu Bello University (ABU)',
    futo: 'Federal University of Technology, Owerri (FUTO)',
    futa: 'Federal University of Technology, Akure (FUTA)',
    futminna: 'Federal University of Technology, Minna (FUTMINNA)',
    unilorin: 'University of Ilorin (UNILORIN)',
    uniben: 'University of Benin (UNIBEN)',
    unizik: 'Nnamdi Azikiwe University (UNIZIK)',
    uniport: 'University of Port Harcourt (UNIPORT)',
    uniabuja: 'University of Abuja (UNIABUJA)',
    unical: 'University of Calabar (UNICAL)',
    lasu: 'Lagos State University (LASU)',
    oou: 'Olabisi Onabanjo University (OOU)',
    eksu: 'Ekiti State University (EKSU)',
    aau: 'Ambrose Alli University (AAU)',
    delsu: 'Delta State University (DELSU)',
    covenant: 'Covenant University',
    babcock: 'Babcock University',
    afe: 'Afe Babalola University (ABUAD)',
    abuad: 'Afe Babalola University (ABUAD)',
    bowen: 'Bowen University',
  },
  'United States': {
    mit: 'Massachusetts Institute of Technology (MIT)',
    harvard: 'Harvard University',
    stanford: 'Stanford University',
    nyu: 'New York University (NYU)',
    ucla: 'University of California, Los Angeles (UCLA)',
    ucb: 'University of California, Berkeley (UC Berkeley)',
    berkeley: 'University of California, Berkeley (UC Berkeley)',
    cmu: 'Carnegie Mellon University (CMU)',
    columbia: 'Columbia University',
    cornell: 'Cornell University',
    princeton: 'Princeton University',
    yale: 'Yale University',
    upenn: 'University of Pennsylvania (UPenn)',
    penn: 'University of Pennsylvania (UPenn)',
    caltech: 'California Institute of Technology (Caltech)',
    gatech: 'Georgia Institute of Technology (Georgia Tech)',
    usc: 'University of Southern California (USC)',
    umich: 'University of Michigan (UMich)',
    utexas: 'University of Texas at Austin (UT Austin)',
  },
  'United Kingdom': {
    oxford: 'University of Oxford',
    cambridge: 'University of Cambridge',
    imperial: 'Imperial College London',
    ucl: 'University College London (UCL)',
    lse: 'London School of Economics (LSE)',
    kcl: "King's College London (KCL)",
    edinburgh: 'University of Edinburgh',
    manchester: 'University of Manchester',
    warwick: 'University of Warwick',
    bristol: 'University of Bristol',
  },
  Canada: {
    uoft: 'University of Toronto (U of T)',
    toronto: 'University of Toronto (U of T)',
    ubc: 'University of British Columbia (UBC)',
    mcgill: 'McGill University',
    waterloo: 'University of Waterloo',
    mcmaster: 'McMaster University',
    ualberta: 'University of Alberta',
  },
  Ghana: {
    ug: 'University of Ghana (Legon)',
    legon: 'University of Ghana (Legon)',
    knust: 'Kwame Nkrumah University of Science and Technology (KNUST)',
    ucc: 'University of Cape Coast (UCC)',
    upsa: 'University of Professional Studies, Accra (UPSA)',
    ashesi: 'Ashesi University',
  },
  Kenya: {
    uon: 'University of Nairobi (UoN)',
    ku: 'Kenyatta University (KU)',
    jkuat: 'Jomo Kenyatta University of Agriculture and Technology (JKUAT)',
    strathmore: 'Strathmore University',
    usiu: 'United States International University Africa (USIU)',
  },
  'South Africa': {
    uct: 'University of Cape Town (UCT)',
    wits: 'University of the Witwatersrand (Wits)',
    stellenbosch: 'Stellenbosch University',
    uj: 'University of Johannesburg (UJ)',
    up: 'University of Pretoria (UP)',
    ukzn: 'University of KwaZulu-Natal (UKZN)',
  },
}

export function resolveSchoolName(input, country = 'Nigeria') {
  if (!input || typeof input !== 'string') return ''
  const trimmed = input.trim()
  const lower = trimmed.toLowerCase()

  const countryAliases = SCHOOL_ALIASES_BY_COUNTRY[country] || SCHOOL_ALIASES_BY_COUNTRY['Nigeria']
  if (countryAliases && countryAliases[lower]) {
    return countryAliases[lower]
  }

  // Fallback scan across all countries if user selected an international acronym
  for (const cName in SCHOOL_ALIASES_BY_COUNTRY) {
    if (SCHOOL_ALIASES_BY_COUNTRY[cName][lower]) {
      return SCHOOL_ALIASES_BY_COUNTRY[cName][lower]
    }
  }

  return trimmed
}
