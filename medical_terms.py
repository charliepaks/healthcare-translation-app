import re
import json
import os
from typing import Dict, Optional

# Path to medical terminology JSON file
MEDICAL_TERMS_FILE = os.path.join(os.path.dirname(__file__), "data/medical_terms.json")

# Initialize medical terms with default values if file doesn't exist
DEFAULT_MEDICAL_TERMS = {
    "general": {
        "heart attack": "myocardial infarction",
        "stroke": "cerebrovascular accident",
        "high blood pressure": "hypertension",
        "water pill": "diuretic",
        "blood thinner": "anticoagulant",
        "stomach flu": "gastroenteritis",
        "kidney stones": "nephrolithiasis",
        "pink eye": "conjunctivitis",
        "heartburn": "gastroesophageal reflux disease",
        "sugar": "glucose"
    },
    "cardiology": {
        "heart attack": "myocardial infarction",
        "chest pain": "angina pectoris",
        "irregular heartbeat": "arrhythmia",
        "heart failure": "congestive heart failure",
        "heart murmur": "cardiac murmur",
        "high blood pressure": "hypertension",
        "leaky valve": "valvular regurgitation",
        "narrowed arteries": "atherosclerosis",
        "fluid around heart": "pericardial effusion"
    },
    "neurology": {
        "stroke": "cerebrovascular accident",
        "seizure": "epileptic seizure",
        "migraine": "migraine headache",
        "pinched nerve": "nerve compression",
        "concussion": "mild traumatic brain injury",
        "memory loss": "amnesia",
        "dizziness": "vertigo",
        "tingling": "paresthesia",
        "tremors": "tremor disorder"
    },
    "orthopedics": {
        "broken bone": "fracture",
        "slipped disc": "herniated disc",
        "joint pain": "arthralgia",
        "bone loss": "osteoporosis",
        "joint inflammation": "arthritis",
        "knee cap": "patella",
        "shoulder blade": "scapula",
        "hip socket": "acetabulum"
    },
    "pediatrics": {
        "chicken pox": "varicella",
        "ear infection": "otitis media",
        "pink eye": "conjunctivitis",
        "strep throat": "streptococcal pharyngitis",
        "hand, foot and mouth": "hand-foot-and-mouth disease",
        "diaper rash": "diaper dermatitis",
        "growth chart": "growth curve"
    },
    "oncology": {
        "cancer spread": "metastasis",
        "cancer cells": "malignant cells",
        "cancer doctor": "oncologist",
        "scan": "imaging study",
        "tumor removal": "tumor resection",
        "chemo": "chemotherapy",
        "radiation": "radiation therapy",
        "targeted therapy": "precision medicine"
    }
}

def initialize_medical_terms():
    """Create medical terms database file if it doesn't exist"""
    directory = os.path.dirname(MEDICAL_TERMS_FILE)
    
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    if not os.path.exists(MEDICAL_TERMS_FILE):
        with open(MEDICAL_TERMS_FILE, 'w', encoding='utf-8') as f:
            json.dump(DEFAULT_MEDICAL_TERMS, f, indent=4)

# Load medical terminology database
def load_medical_terms(context: str = "general") -> Dict:
    """
    Load medical terminology from JSON file based on context
    
    Args:
        context: Medical specialty context (e.g., "cardiology", "neurology")
        
    Returns:
        Dictionary of common terms and their standardized forms
    """
    try:
        initialize_medical_terms()
        
        with open(MEDICAL_TERMS_FILE, 'r', encoding='utf-8') as f:
            all_terms = json.load(f)
        
        # Return specialized context if available, otherwise return general terms
        return all_terms.get(context, all_terms.get("general", {}))
    except Exception as e:
        print(f"Error loading medical terms: {str(e)}")
        # Fall back to default terms if file can't be loaded
        return DEFAULT_MEDICAL_TERMS.get(context, DEFAULT_MEDICAL_TERMS.get("general", {}))

# Common medical abbreviation expansion
def expand_medical_abbreviations(text: str) -> str:
    """
    Expand common medical abbreviations in the text
    
    Args:
        text: Original text with potential abbreviations
        
    Returns:
        Text with expanded abbreviations
    """
    abbreviations = {
        r'\bBP\b': 'blood pressure',
        r'\bHR\b': 'heart rate',
        r'\bRR\b': 'respiratory rate',
        r'\bT\b': 'temperature',
        r'\bO2\b': 'oxygen',
        r'\bO2 sat\b': 'oxygen saturation',
        r'\bICU\b': 'intensive care unit',
        r'\bED\b': 'emergency department',
        r'\bPT\b': 'physical therapy',
        r'\bOT\b': 'occupational therapy',
        r'\bDx\b': 'diagnosis',
        r'\bTx\b': 'treatment',
        r'\bHx\b': 'history',
        r'\bRx\b': 'prescription',
        r'\bSx\b': 'symptoms',
        r'\bFx\b': 'fracture',
        r'\bPMH\b': 'past medical history',
        r'\bFHx\b': 'family history',
        r'\bSHx\b': 'social history',
        r'\bNKDA\b': 'no known drug allergies',
        r'\bNPO\b': 'nothing by mouth',
        r'\bqd\b': 'once daily',
        r'\bbid\b': 'twice daily',
        r'\btid\b': 'three times daily',
        r'\bqid\b': 'four times daily',
        r'\bprn\b': 'as needed',
        r'\bPO\b': 'by mouth',
        r'\bIV\b': 'intravenous',
        r'\bIM\b': 'intramuscular',
        r'\bSC\b': 'subcutaneous',
        r'\bHTN\b': 'hypertension',
        r'\bDM\b': 'diabetes mellitus',
        r'\bCHF\b': 'congestive heart failure',
        r'\bCAD\b': 'coronary artery disease',
        r'\bCOPD\b': 'chronic obstructive pulmonary disease',
        r'\bUTI\b': 'urinary tract infection',
        r'\bMI\b': 'myocardial infarction',
        r'\bCVA\b': 'cerebrovascular accident',
        r'\bTIA\b': 'transient ischemic attack'
    }
    
    result = text
    for abbr, expansion in abbreviations.items():
        result = re.sub(abbr, expansion, result, flags=re.IGNORECASE)
    
    return result

# Enhance medical terminology
def enhance_medical_terminology(text: str, context: str = "general") -> str:
    """
    Identify and standardize medical terminology in the text
    
    Args:
        text: Original text input
        context: Medical specialty context
        
    Returns:
        Text with standardized medical terminology
    """
    # First expand abbreviations
    text = expand_medical_abbreviations(text)
    
    # Load appropriate medical terms for the context
    medical_terms = load_medical_terms(context)
    
    if not medical_terms:
        return text  # Return original if no terms loaded
    
    # Function to replace term with standardized form
    def replace_term(match):
        term = match.group(0).lower()
        return medical_terms.get(term, match.group(0))
    
    # Create pattern to match medical terms (case insensitive)
    pattern = r'\b(' + '|'.join(re.escape(term) for term in medical_terms.keys()) + r')\b'
    
    # Replace terms
    try:
        enhanced_text = re.sub(pattern, replace_term, text, flags=re.IGNORECASE)
        return enhanced_text
    except Exception as e:
        print(f"Error enhancing medical terminology: {str(e)}")
        return text  # Return original text if enhancement fails

# For testing
if __name__ == "__main__":
    # Initialize the database
    initialize_medical_terms()
    
    # Test with a sample text
    sample_text = "The patient has a history of high blood pressure and had a heart attack last year. Current BP is 140/90."
    enhanced = enhance_medical_terminology(sample_text, "cardiology")
    print(f"Original: {sample_text}")
    print(f"Enhanced: {enhanced}")