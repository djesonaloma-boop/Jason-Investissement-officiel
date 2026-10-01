const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // sert tes .html

const DB_FILE = path.join(__dirname, 'database.json');

// Charge DB ou crée
function loadDB(){
  if(!fs.existsSync(DB_FILE)){
    fs.writeFileSync(DB_FILE, JSON.stringify({users:[], investments:[], parrainages:[], tasks:[], vips:[]}, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE,'utf8'));
}
function saveDB(db){ fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2)); }

// Génère code JAS-XXXXXX unique
function genCode(){ return 'JAS-'+Math.random().toString(36).substring(2,8).toUpperCase(); }

// ===== INSCRIPTION AVEC ?ref= =====
app.post('/api/register', (req,res)=>{
  const db = loadDB();
  const {name, phone, email, password, refCode} = req.body;
  if(db.users.find(u=>u.phone===phone || u.email===email)){
    return res.json({success:false, message:'Numéro ou email déjà utilisé'});
  }
  const myCode = genCode();
  const user = {
    id: Date.now().toString(),
    name, phone, email, password,
    solde: 0,
    points: 0,
    referralCode: myCode,
    referredBy: refCode ? refCode.toUpperCase() : null,
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  saveDB(db);
  res.json({success:true, user, message:'Compte créé! Code: '+myCode});
});

// CONNEXION
app.post('/api/login', (req,res)=>{
  const db = loadDB();
  const {phone, password} = req.body;
  const user = db.users.find(u=>u.phone===phone && u.password===password);
  if(!user) return res.json({success:false, message:'Numéro ou mot de passe incorrect'});
  res.json({success:true, user});
});

// INVESTIR - ET CREDIT 10% PARRAIN AUTOMATIQUE
app.post('/api/invest', (req,res)=>{
  const db = loadDB();
  const {userId, amount} = req.body;
  const user = db.users.find(u=>u.id===userId);
  if(!user) return res.json({success:false, message:'User non trouvé'});
  
  const invest = {id:Date.now().toString(), userId, amount:Number(amount), date:new Date().toISOString()};
  db.investments.push(invest);
  user.solde = Number(user.solde||0); // le solde ne descend pas à l'invest, c'est bloqué

  // CREDIT PARRAIN 10% AUTO SI PREMIER INVEST
  const firstInvest = db.investments.filter(i=>i.userId===userId).length===1;
  if(firstInvest && user.referredBy){
    const parrain = db.users.find(u=>u.referralCode===user.referredBy);
    if(parrain){
      const bonus = Math.floor(Number(amount)*0.10);
      parrain.solde = Number(parrain.solde||0)+bonus;
      parrain.points = Number(parrain.points||0)+100;
      db.parrainages.push({
        id:Date.now().toString(),
        parrainCode:user.referredBy,
        parrainId:parrain.id,
        filleulId:userId,
        filleulName:user.name,
        amount:Number(amount),
        bonus,
        date:new Date().toISOString()
      });
      console.log(`✅ Parrain ${parrain.name} +${bonus} FC pour filleul ${user.name}`);
    }
  }
  saveDB(db);
  res.json({success:true, user, invest});
});

// ACHETER VIP - ARGENT DESCEND VRAIMENT
app.post('/api/vip/buy', (req,res)=>{
  const db = loadDB();
  const {userId, vip, price, points} = req.body;
  const user = db.users.find(u=>u.id===userId);
  if(!user) return res.json({success:false});
  if(Number(user.solde)<Number(price)) return res.json({success:false, message:'Solde insuffisant'});

  user.solde -= Number(price);
  user.points = Number(user.points||0)+Number(points);
  user.currentVip = vip;
  db.vips.push({userId, vip, price, points, date:new Date().toISOString()});
  saveDB(db);
  res.json({success:true, user, message:`VIP ${vip} activé! -${price} FC, +${points} points`});
});

// STATS PARRAINAGE AUTO PAR TELEPHONE
app.get('/api/referral/:code', (req,res)=>{
  const db = loadDB();
  const code = req.params.code.toUpperCase();
  const list = db.parrainages.filter(p=>p.parrainCode===code);
  const total = list.reduce((s,p)=>s+p.bonus,0);
  res.json({code, count:list.length, total, list});
});

// TACHE DU JOUR AUTO 5 MIN
app.post('/api/task/read', (req,res)=>{
  const db = loadDB();
  const {userId} = req.body;
  const today = new Date().toISOString().slice(0,10);
  if(db.tasks.find(t=>t.userId===userId && t.date===today)){
    return res.json({success:false, message:'Déjà lu aujourd\'hui'});
  }
  const user = db.users.find(u=>u.id===userId);
  const inv = db.investments.filter(i=>i.userId===userId).reduce((s,i)=>s+i.amount,0);
  let gain = 0;
  if(inv>=20000 && inv<50000) gain=1500;
  else if(inv>=50000 && inv<100000) gain=4000;
  else if(inv>=100000) gain=Math.floor(inv*0.08);
  
  db.tasks.push({userId, date:today, gain, readAt:new Date().toISOString()});
  user.solde += gain;
  saveDB(db);
  res.json({success:true, gain, user});
});

app.listen(PORT, ()=>console.log(`🚀 JASON INVEST serveur sur http://localhost:${PORT}`));