const jwtSecret = process.env.JWT_SECRET
  ? process.env.JWT_SECRET
  : 'myjwtsecret';

const oauth = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID
      ? process.env.GOOGLE_CLIENT_ID
      : '335676816560-9rftbvl14g99lt4jgjeaif058p4e6bmo.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
      ? process.env.GOOGLE_CLIENT_SECRET
      : 'LYoXPcV5SpDnTtVsFeyPVPfr'
  },
  facebook: {
    clientID: process.env.FB_CLIENT_ID
      ? process.env.FB_CLIENT_ID
      : '423609521544988',
    clientSecret: process.env.FB_CLIENT_SECRET
      ? process.env.FB_CLIENT_SECRET
      : 'f11c32b783ee0c8dc1171901e7eb9262'
  },
  github: {
    clientID: process.env.GITHUB_CLIENT_ID
      ? process.env.GITHUB_CLIENT_ID
      : '67b8c0055903e4b01dbd',
    clientSecret: process.env.GITHUB_CLIENT_SECRET
      ? process.env.GITHUB_CLIENT_SECRET
      : '07e16a65327dd57a0ae226206b5f779f999536f1'
  }
};

module.exports = {
  jwtSecret,
  oauth
};
