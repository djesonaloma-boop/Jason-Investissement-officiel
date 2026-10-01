// Pour l'instant en mémoire, après on mettra une vraie DB
let users = global.users || [];
global.users = users;

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if(req.method === 'OPTIONS') return res.status(200).end();
  if(req.method !== 'POST') return res.status(405).json({message:"Méthode non autorisée"});

  const { name, phone, email, password } = req.body;

  if(!name || !phone || !email || !password){
    return res.status(400).json({message:"Remplis tous les champs"});
  }

  if(users.find(u => u.email === email)){
    return res.status(400).json({message:"Cet email existe déjà"});
  }

  const newUser = { id: Date.now(), name, phone, email, solde: 0 };
  users.push({ ...newUser, password });
  
  return res.status(200).json({ message: "Compte créé avec succès", user: newUser });
}