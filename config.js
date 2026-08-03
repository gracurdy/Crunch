export const CONFIG = {
  owner: 'gracurdy',
  repo: 'Crunch',
  branch: 'main',
  tripsPath: 'data/trips.json',
  photosDir: 'assets/photos',
  // Password-locked save credential. Create/update with:
  //   PASSWORD='YourPassword' TOKEN='your_token' node scripts/seal-secret.mjs
  authSalt: '',
  authIv: '',
  sealedSecret: ''
};
