import UAParser from 'ua-parser-js';

const ua_parser = new UAParser();

export const isSafari = () => {
  return ua_parser.getBrowser()?.name?.toLowerCase()?.includes('safari');
};
