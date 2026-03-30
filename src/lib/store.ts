// Local storage based database for offline operation
// All data persists in the browser's localStorage

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  height: number; // in meters
  weight: number; // in kg
  dosha: 'Vata' | 'Pitta' | 'Kapha';
  healthIssue: string;
  bmi: number;
  createdAt: string;
}

export interface DietPlan {
  id: string;
  patientId: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  date: string;
}

export interface ProgressRecord {
  id: string;
  patientId: string;
  weight: number;
  remarks: string;
  date: string;
}

// Generate unique IDs
const generateId = () => crypto.randomUUID();

// Helper to get/set localStorage
function getStore<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setStore<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// BMI Calculation
export function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  if (heightM <= 0) return 0;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  return 'Overweight';
}

// ===== Patient CRUD =====
export function getPatients(): Patient[] {
  return getStore<Patient>('patients');
}

export function getPatient(id: string): Patient | undefined {
  return getPatients().find(p => p.id === id);
}

// Generate a short patient ID like "AYR-0001"
function generatePatientId(): string {
  const patients = getPatients();
  const maxNum = patients.reduce((max, p) => {
    const match = p.patientId?.match(/AYR-(\d+)/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);
  return `AYR-${String(maxNum + 1).padStart(4, '0')}`;
}

export function addPatient(data: Omit<Patient, 'id' | 'patientId' | 'bmi' | 'createdAt'>): Patient {
  const patients = getPatients();
  const patient: Patient = {
    ...data,
    id: generateId(),
    patientId: generatePatientId(),
    bmi: calculateBMI(data.weight, data.height),
    createdAt: new Date().toISOString(),
  };
  patients.push(patient);
  setStore('patients', patients);
  return patient;
}

export function updatePatient(id: string, data: Omit<Patient, 'id' | 'bmi' | 'createdAt'>): Patient | undefined {
  const patients = getPatients();
  const idx = patients.findIndex(p => p.id === id);
  if (idx === -1) return undefined;
  patients[idx] = {
    ...patients[idx],
    ...data,
    bmi: calculateBMI(data.weight, data.height),
  };
  setStore('patients', patients);
  return patients[idx];
}

export function deletePatient(id: string) {
  setStore('patients', getPatients().filter(p => p.id !== id));
  // Also delete related diet plans and progress
  setStore('dietPlans', getDietPlans().filter(d => d.patientId !== id));
  setStore('progress', getProgressRecords(id).length ? getStore<ProgressRecord>('progress').filter(p => p.patientId !== id) : getStore<ProgressRecord>('progress'));
}

// ===== Diet Plans =====
export function getDietPlans(): DietPlan[] {
  return getStore<DietPlan>('dietPlans');
}

export function getDietPlansForPatient(patientId: string): DietPlan[] {
  return getDietPlans().filter(d => d.patientId === patientId);
}

// Diet plan rules based on Dosha type
const DIET_RULES = {
  Vata: {
    breakfast: ['Warm oatmeal with ghee and nuts', 'Hot milk with turmeric and almonds', 'Warm rice porridge with cinnamon'],
    lunch: ['Steamed rice with dal and ghee', 'Warm vegetable soup with whole wheat bread', 'Khichdi with vegetables and clarified butter'],
    dinner: ['Warm milk with nutmeg', 'Light soup with soft vegetables', 'Stewed fruits with warm spices'],
    recommended: ['Warm soups', 'Rice', 'Milk', 'Nuts', 'Ghee', 'Cooked vegetables'],
    avoid: ['Cold foods', 'Dry foods', 'Raw salads', 'Carbonated drinks'],
  },
  Pitta: {
    breakfast: ['Fresh fruit salad with coconut', 'Cool mint smoothie with dates', 'Oats with fresh berries and milk'],
    lunch: ['Cucumber salad with rice and mild dal', 'Fresh vegetable stir-fry with coconut oil', 'Mixed grain bowl with cooling herbs'],
    dinner: ['Steamed vegetables with basmati rice', 'Light salad with olive oil dressing', 'Coconut milk pudding with fruits'],
    recommended: ['Fruits', 'Vegetables', 'Cooling foods', 'Coconut', 'Mint'],
    avoid: ['Spicy foods', 'Fried foods', 'Hot peppers', 'Fermented foods'],
  },
  Kapha: {
    breakfast: ['Light millet porridge with honey', 'Herbal tea with dry toast', 'Warm lemon water with light grain cereal'],
    lunch: ['Steamed vegetables with barley', 'Light dal with minimal oil', 'Spiced vegetable soup with millet'],
    dinner: ['Light vegetable broth', 'Small portion of steamed greens', 'Warm herbal tea with light crackers'],
    recommended: ['Light foods', 'Vegetables', 'Low fat meals', 'Spices', 'Legumes'],
    avoid: ['Oily foods', 'Heavy meals', 'Dairy', 'Sweets', 'Excessive salt'],
  },
};

export function generateDietPlan(patientId: string): DietPlan {
  const patient = getPatient(patientId);
  if (!patient) throw new Error('Patient not found');

  const rules = DIET_RULES[patient.dosha];
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const plan: DietPlan = {
    id: generateId(),
    patientId,
    breakfast: pick(rules.breakfast),
    lunch: pick(rules.lunch),
    dinner: pick(rules.dinner),
    date: new Date().toISOString().split('T')[0],
  };

  const plans = getDietPlans();
  plans.push(plan);
  setStore('dietPlans', plans);
  return plan;
}

export function getDietRules(dosha: 'Vata' | 'Pitta' | 'Kapha') {
  return DIET_RULES[dosha];
}

// ===== Progress =====
export function getProgressRecords(patientId: string): ProgressRecord[] {
  return getStore<ProgressRecord>('progress').filter(p => p.patientId === patientId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function addProgressRecord(patientId: string, weight: number, remarks: string, date: string): ProgressRecord {
  const record: ProgressRecord = {
    id: generateId(),
    patientId,
    weight,
    remarks,
    date,
  };
  const records = getStore<ProgressRecord>('progress');
  records.push(record);
  setStore('progress', records);
  return record;
}

// ===== Auth =====
export function initDefaultUser() {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
      { id: '1', username: 'admin', password: 'admin123' }
    ]));
  }
}

export function login(username: string, password: string): boolean {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find((u: any) => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    return true;
  }
  return false;
}

export function signup(username: string, password: string): { success: boolean; error?: string } {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.find((u: any) => u.username === username)) {
    return { success: false, error: 'Username already exists' };
  }
  const newUser = { id: generateId(), username, password };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  return { success: true };
}

export function logout() {
  localStorage.removeItem('currentUser');
}

export function getCurrentUser() {
  const data = localStorage.getItem('currentUser');
  return data ? JSON.parse(data) : null;
}
