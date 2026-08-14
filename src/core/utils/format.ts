import { Education, RelationshipGoal, Gender, InterestedIn, PremiumTier } from '../../types/enums';

export function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function labelFor(value: string | null | undefined, options: { value: string; label: string }[]): string {
  if (!value) return '';
  return options.find((o) => o.value === value)?.label ?? capitalize(value.replace(/_/g, ' '));
}

export function educationLabel(value: string): string {
  return labelFor(value, [
    { value: 'high_school', label: 'High School' },
    { value: 'some_college', label: 'Some College' },
    { value: 'associates', label: 'Associates' },
    { value: 'bachelors', label: 'Bachelors' },
    { value: 'masters', label: 'Masters' },
    { value: 'phd', label: 'PhD' },
    { value: 'trade_school', label: 'Trade School' },
    { value: 'other', label: 'Other' },
  ]);
}

export function heightLabel(cm: number | null): string {
  if (!cm) return '';
  const ft = Math.floor(cm / 30.48);
  const inch = Math.round((cm / 2.54) % 12);
  return `${cm} cm (${ft}'${inch}")`;
}

export function memberSinceLabel(createdAt: number): string {
  return new Date(createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' });
}

export { capitalize as cap };
