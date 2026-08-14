import { Education, Gender, InterestedIn, RelationshipGoal } from './enums';

export interface SignupFormValues {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface PhoneSignInFormValues {
  countryCode: string;
  phoneNumber: string;
}

export interface BasicInfoValues {
  displayName: string;
  dob: string;
  gender: Gender | '';
  interestedIn: InterestedIn | '';
  country: string;
  city: string;
}

export interface AboutValues {
  bio: string;
  height: string;
  religion: string;
  education: Education | '';
  occupation: string;
  languages: string[];
  relationshipGoal: RelationshipGoal | '';
}

export interface LifestyleValues {
  smoking: string;
  drinking: string;
  pets: string[];
  hobbies: string[];
}

export interface SocialValues {
  instagram: string;
  spotify: string;
}
