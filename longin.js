let users = global.users || [];
global.users = users;

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if(req.method === 'OPTIONS') return res.status(200).end();

  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if(!user) return res.status(400).json({ message: "Email ou mot de passe incorrect" });
  
  const { password:_, ...safeUser } = user;
  return res.json({ message: "Connexion réussie", user: safeUser });
}