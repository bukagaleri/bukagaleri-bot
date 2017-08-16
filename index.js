global.__root = `${__dirname}/`;
global.__app = `${__dirname}/app/`;

require('app-module-path').addPath(__app);
require('dotenv').load();
require('config/mongo');
require('main');
