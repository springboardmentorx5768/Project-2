// Simple location dataset: states with array of cities.
// Extend as needed; kept minimal for performance.
export const STATES_WITH_CITIES = [
  { state: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kakinada'] },
  { state: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'] },
  { state: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Mangalore', 'Hubli', 'Belgaum'] },
  { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'] },
  { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'] },
  { state: 'Kerala', cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Palakkad'] },
  { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'] },
  { state: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'] },
  { state: 'Delhi (NCT)', cities: ['New Delhi', 'Dwarka', 'Rohini', 'Saket', 'Karol Bagh'] },
  { state: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Noida', 'Ghaziabad', 'Varanasi'] }
];

export function getStates() {
  return STATES_WITH_CITIES.map(s => s.state);
}

export function getCitiesForState(state) {
  const found = STATES_WITH_CITIES.find(s => s.state === state);
  return found ? found.cities : [];
}
