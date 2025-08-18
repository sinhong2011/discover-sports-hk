export const SportType = {
  badminton: 'badminton',
  basketball: 'basketball',
  volleyball: 'volleyball',
  turfSoccerPitch: 'turfSoccerPitch',
  tennis: 'tennis',
} as const;

export type SportType = (typeof SportType)[keyof typeof SportType];

export const SportTypeOptions = [
  { label: 'badminton', value: SportType.badminton },
  { label: 'basketball', value: SportType.basketball },
  { label: 'volleyball', value: SportType.volleyball },
  { label: 'turfSoccerPitch', value: SportType.turfSoccerPitch },
  { label: 'tennis', value: SportType.tennis },
];
