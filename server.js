// API Server configuration

import express from 'express';
import indexRoutes from './routes/index';

const api = express();
const port = process.env.PORT || 5000;

api.use(express.json());
api.use('/', indexRoutes);

api.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
