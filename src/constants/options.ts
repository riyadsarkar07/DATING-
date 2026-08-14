import { Education, Gender, InterestedIn, RelationshipGoal } from '../types/enums';

export const genderOptions: { value: Gender; label: string; emoji: string }[] = [
  { value: 'male', label: 'Man', emoji: 'Man' },
  { value: 'female', label: 'Woman', emoji: 'Woman' },
  { value: 'non_binary', label: 'Non-binary', emoji: 'Person' },
];

export const interestedInOptions: { value: InterestedIn; label: string }[] = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'everyone', label: 'Everyone' },
];

export const relationshipGoalOptions: { value: RelationshipGoal; label: string }[] = [
  { value: 'long_term', label: 'Long-term partner' },
  { value: 'short_term', label: 'Short-term, open to long' },
  { value: 'casual', label: 'Something casual' },
  { value: 'friendship', label: 'Friends first' },
  { value: 'figuring_out', label: 'Still figuring it out' },
];

export const educationOptions: { value: Education; label: string }[] = [
  { value: 'high_school', label: 'High School' },
  { value: 'some_college', label: 'Some College' },
  { value: 'associates', label: 'Associates Degree' },
  { value: 'bachelors', label: 'Bachelors Degree' },
  { value: 'masters', label: 'Masters Degree' },
  { value: 'phd', label: 'PhD / Doctorate' },
  { value: 'trade_school', label: 'Trade School' },
  { value: 'other', label: 'Other' },
];

export const smokingOptions = [
  { value: 'never', label: 'Never' },
  { value: 'socially', label: 'Socially' },
  { value: 'occasionally', label: 'Occasionally' },
  { value: 'regularly', label: 'Regularly' },
];

export const drinkingOptions = [
  { value: 'never', label: 'Never' },
  { value: 'socially', label: 'Socially' },
  { value: 'regularly', label: 'Regularly' },
];

export const petOptions = [
  'Dog',
  'Cat',
  'Bird',
  'Fish',
  'Reptile',
  'Hamster',
  'Horse',
  'Other',
];

export const hobbyOptions = [
  'Fitness',
  'Yoga',
  'Travel',
  'Photography',
  'Cooking',
  'Music',
  'Dancing',
  'Art',
  'Reading',
  'Movies',
  'Gaming',
  'Hiking',
  'Surfing',
  'Skiing',
  'Basketball',
  'Soccer',
  'Tennis',
  'Running',
  'Swimming',
  'Cycling',
  'Meditation',
  'Fashion',
  'Foodie',
  'Coffee',
  'Wine',
  'Tech',
  'Startups',
  'Languages',
  'Volunteering',
  'Pets',
];

export const religionOptions = [
  'Christianity',
  'Islam',
  'Hinduism',
  'Buddhism',
  'Judaism',
  'Sikhism',
  'Agnostic',
  'Atheist',
  'Spiritual',
  'Other',
];

export const languagesOptions = [
  'English',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Hindi',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic',
  'Russian',
  'Italian',
  'Turkish',
  'Indonesian',
  'Thai',
  'Vietnamese',
  'Dutch',
  'Polish',
  'Swedish',
  'Greek',
];

export const countriesOptions = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'India',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Brazil',
  'Mexico',
  'Japan',
  'South Korea',
  'China',
  'Indonesia',
  'Thailand',
  'Vietnam',
  'Philippines',
  'Malaysia',
  'Singapore',
  'Turkey',
  'UAE',
  'Saudi Arabia',
  'Egypt',
  'Nigeria',
  'South Africa',
  'Poland',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Switzerland',
  'Austria',
  'Belgium',
  'Portugal',
  'Ireland',
  'New Zealand',
  'Argentina',
  'Chile',
  'Colombia',
  'Peru',
  'Russia',
];

export const profileCompletionSteps: { key: string; label: string }[] = [
  { key: 'photos', label: 'Add at least 2 photos' },
  { key: 'video', label: 'Add a video intro' },
  { key: 'bio', label: 'Write your bio' },
  { key: 'basic', label: 'Complete basic info' },
  { key: 'lifestyle', label: 'Add your lifestyle' },
  { key: 'socials', label: 'Connect your socials' },
];

export const defaultHeightCm = 175;

export const heightOptions = Array.from({ length: 51 }, (_, i) => 145 + i);
