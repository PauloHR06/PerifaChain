import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import artistRoutes from './artistRoutes.js';
import projectRoutes from './projectRoutes.js';
import loanRoutes from './loanRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import revenueRoutes from './revenueRoutes.js';
import chatRoutes from './chatRoutes.js';
import docRoutes from './docRoutes.js';

export function setupRoutes(app) {
  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/artists', artistRoutes);
  app.use('/projects', projectRoutes);
  app.use('/loans', loanRoutes);
  app.use('/transactions', transactionRoutes);
  app.use('/revenue', revenueRoutes);
  app.use('/chat', chatRoutes);
  app.use('/docs', docRoutes);
}
