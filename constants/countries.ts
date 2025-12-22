export type Country = {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
};

export const countries: Country[] = [
  { name: "Afghanistan", code: "AF", dialCode: "+93", flag: "AF" },
  { name: "Albania", code: "AL", dialCode: "+355", flag: "AL" },
  { name: "Algeria", code: "DZ", dialCode: "+213", flag: "DZ" },
  { name: "Argentina", code: "AR", dialCode: "+54", flag: "AR" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "AU" },
  { name: "Austria", code: "AT", dialCode: "+43", flag: "AT" },
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "BD" },
  { name: "Belgium", code: "BE", dialCode: "+32", flag: "BE" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "BR" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "CA" },
  { name: "Chile", code: "CL", dialCode: "+56", flag: "CL" },
  { name: "China", code: "CN", dialCode: "+86", flag: "CN" },
  { name: "Colombia", code: "CO", dialCode: "+57", flag: "CO" },
  { name: "Croatia", code: "HR", dialCode: "+385", flag: "HR" },
  { name: "Czech Republic", code: "CZ", dialCode: "+420", flag: "CZ" },
  { name: "Denmark", code: "DK", dialCode: "+45", flag: "DK" },
  { name: "Egypt", code: "EG", dialCode: "+20", flag: "EG" },
  { name: "Finland", code: "FI", dialCode: "+358", flag: "FI" },
  { name: "France", code: "FR", dialCode: "+33", flag: "FR" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "DE" },
  { name: "Greece", code: "GR", dialCode: "+30", flag: "GR" },
  { name: "Hong Kong", code: "HK", dialCode: "+852", flag: "HK" },
  { name: "Hungary", code: "HU", dialCode: "+36", flag: "HU" },
  { name: "India", code: "IN", dialCode: "+91", flag: "IN" },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "ID" },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "IE" },
  { name: "Israel", code: "IL", dialCode: "+972", flag: "IL" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "IT" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "JP" },
  { name: "Kenya", code: "KE", dialCode: "+254", flag: "KE" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "MY" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "MX" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "NL" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "NZ" },
  { name: "Nigeria", code: "NG", dialCode: "+234", flag: "NG" },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "NO" },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "PK" },
  { name: "Peru", code: "PE", dialCode: "+51", flag: "PE" },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "PH" },
  { name: "Poland", code: "PL", dialCode: "+48", flag: "PL" },
  { name: "Portugal", code: "PT", dialCode: "+351", flag: "PT" },
  { name: "Romania", code: "RO", dialCode: "+40", flag: "RO" },
  { name: "Russia", code: "RU", dialCode: "+7", flag: "RU" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "SA" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "SG" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "ZA" },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "KR" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "ES" },
  { name: "Sri Lanka", code: "LK", dialCode: "+94", flag: "LK" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "SE" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "CH" },
  { name: "Taiwan", code: "TW", dialCode: "+886", flag: "TW" },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "TH" },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "TR" },
  { name: "Ukraine", code: "UA", dialCode: "+380", flag: "UA" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "AE" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "GB" },
  { name: "United States", code: "US", dialCode: "+1", flag: "US" },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "VN" },
];

export const getCountryByDialCode = (dialCode: string): Country | undefined => {
  return countries.find((country) => country.dialCode === dialCode);
};

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find((country) => country.code === code);
};
