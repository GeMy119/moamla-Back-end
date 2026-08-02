
import { globalErr } from './middleware/globalErr.js';
import adminRouter from './modules/admin/admin.router.js';
import employerRouter from './modules/employer/employer.router.js';
import familyVisasRouter from './modules/familyVisas/familyVisas.router.js';
import nationalityRequestsRouter from './modules/nationalityRrequest/nationalityRequest.router.js';
import visitRouter from './modules/visit/visit.router.js';
import workerRouter from './modules/worker/worker.router.js';
import { AppErr } from './utils/AppErr.js';


const init = (app) => {
  // Apply middleware
  // routes

  app.use('/api/v1/employers', employerRouter);
  app.use('/api/v1/workers', workerRouter);
  app.use('/api/v1/nationalities', nationalityRequestsRouter);
  app.use('/api/v1/visits', visitRouter);
  app.use('/api/v1/families', familyVisasRouter);

  app.use('/api/v1/admin', adminRouter);

  app.all('*', (req, res, next) => {
    next(new AppErr('this route not found', 404));
  });

  app.use(globalErr);
};

export default init;
