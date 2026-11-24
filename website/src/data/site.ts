// Store links — paste the real listing URLs here once the app is live.
// Until then the badges and "get the app" lead to the waitlist.
export const STORE = {
  google: '',
  apple: '',
};
export const getAppHref = STORE.google || STORE.apple ? '/#get-the-app' : '/waitlist';
