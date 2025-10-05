import express from 'express';
const router = express.Router();

// Simulação de armazenamento de mensagens em memória (substitua por banco real)
const messages = [];

// Rota para obter todas as mensagens
router.get('/', (req, res) => {
  res.json({ messages });
});

// Rota para enviar uma nova mensagem
router.post('/', (req, res) => {
  const { fromUser, toUser, content } = req.body;
  if (!fromUser || !toUser || !content) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }
  const message = {
    id: messages.length + 1,
    fromUser,
    toUser,
    content,
    createdAt: new Date()
  };
  messages.push(message);
  res.status(201).json({ message });
});

// Rota para obter mensagens entre dois usuários específicos
router.get('/conversation', (req, res) => {
  const { user1, user2 } = req.query;
  if (!user1 || !user2) {
    return res.status(400).json({ error: 'Parâmetros user1 e user2 são obrigatórios' });
  }
  const conversation = messages.filter(
    m =>
      (m.fromUser === user1 && m.toUser === user2) ||
      (m.fromUser === user2 && m.toUser === user1)
  );
  res.json({ conversation });
});

export default router;
