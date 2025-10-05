import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // ajuste conforme porta backend
});

// Auth
export const login = (email: string, password: string) => 
  api.post('/auth/login', { email, password });

export const register = (user: any) => 
  api.post('/auth/register', user);

// Artistas
export const getArtists = () => api.get('/artists');
export const getArtistById = (id: string) => api.get(`/artists/${id}`);

// Projetos
export const getProjects = (artistId?: string) => 
  api.get('/projects', { params: { artist_id: artistId } });

export const createProject = (project: any) => api.post('/projects', project);

// Empréstimos
export const investInProject = (loan: any) => api.post('/loans', loan);
export const getLoansByInvestor = (investorId: string) => 
  api.get('/loans', { params: { investor_id: investorId } });

// Transações
export const getTransactionsByArtist = (artistId: string) => 
  api.get('/transactions', { params: { artist_id: artistId } });

// Chat
export const getChatRooms = () => api.get('/chat/rooms');
export const getChatMessages = (roomId: string) => 
  api.get(`/chat/messages/${roomId}`);
export const sendChatMessage = (msg: any) => api.post('/chat/messages', msg);

export default api;
